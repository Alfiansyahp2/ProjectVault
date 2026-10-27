import { ID, Query } from 'appwrite';
import { JobApplication } from '../types';
import { getAppwriteClient } from './client';
import { isValidAppwriteId } from './validation';

export async function fetchApplicationsFromAppwrite(): Promise<JobApplication[] | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  try {
    let allDocuments: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const res = await aw.databases.listDocuments(
        aw.config.databaseId,
        aw.config.applicationsCollectionId,
        [Query.limit(limit), Query.offset(offset)]
      );

      allDocuments = allDocuments.concat(res.documents);
      if (res.documents.length < limit || allDocuments.length >= res.total) {
        break;
      }
      offset += res.documents.length;
    }

    // Deduplicate by file_path or normalized company + job title
    const seen = new Set<string>();
    const uniqueDocs: any[] = [];

    for (const doc of allDocuments) {
      const fp = (doc.file_path || '').trim().toLowerCase();
      const comp = (doc.company_name || '').trim().toLowerCase();
      const jt = (doc.job_title || '').trim().toLowerCase();
      const key = fp || `${comp}::${jt}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueDocs.push(doc);
      }
    }

    return uniqueDocs.map(doc => ({
      id: doc.$id,
      company_name: doc.company_name || '',
      job_title: doc.job_title || '',
      status: doc.status || 'applied',
      applied_date: doc.applied_date || new Date().toISOString().split('T')[0],
      source_portal: doc.source_portal || '',
      summary: doc.summary || '',
      key_skills: Array.isArray(doc.key_skills) ? doc.key_skills : [],
      file_path: doc.file_path || '',
      job_link: doc.job_link || '',
      salary_range: doc.salary_range || '',
      notes: doc.notes || '',
      job_description: doc.job_description || '',
      cover_letter: doc.cover_letter || '',
      matched_project_ids: doc.matched_project_ids || [],
      createdAt: doc.$createdAt,
    }));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.info(`[Appwrite] Fallback: Koleksi '${aw.config.applicationsCollectionId}' belum tersedia di Cloud (${errorMsg}). Menggunakan Local Storage.`);
    return null;
  }
}

export async function saveApplicationToAppwrite(appItem: JobApplication): Promise<string | null> {
  const aw = getAppwriteClient();
  if (!aw) return null;

  const data: Record<string, any> = {
    company_name: (appItem.company_name || '').slice(0, 255),
    job_title: (appItem.job_title || '').slice(0, 255),
    status: appItem.status || 'applied',
    applied_date: appItem.applied_date || new Date().toISOString().split('T')[0],
    source_portal: (appItem.source_portal || '').slice(0, 255),
    summary: (appItem.summary || '').trim().slice(0, 990),
    key_skills: Array.isArray(appItem.key_skills) ? appItem.key_skills : [],
    file_path: (appItem.file_path || '').trim().slice(0, 500),
    salary_range: (appItem.salary_range || '').trim().slice(0, 255),
    notes: (appItem.notes || '').trim().slice(0, 990),
    job_description: (appItem.job_description || '').trim().slice(0, 990),
    cover_letter: (appItem.cover_letter || '').trim().slice(0, 4900),
  };

  if (appItem.job_link && (appItem.job_link.startsWith('http://') || appItem.job_link.startsWith('https://'))) {
    data.job_link = appItem.job_link.trim().slice(0, 990);
  }

  try {
    if (isValidAppwriteId(appItem.id)) {
      try {
        await aw.databases.updateDocument(
          aw.config.databaseId,
          aw.config.applicationsCollectionId,
          appItem.id,
          data
        );
        return appItem.id;
      } catch (updateErr: any) {
        if (updateErr?.code === 404 || updateErr?.status === 404) {
          const doc = await aw.databases.createDocument(
            aw.config.databaseId,
            aw.config.applicationsCollectionId,
            ID.unique(),
            data
          );
          return doc.$id;
        }
        throw updateErr;
      }
    } else {
      const doc = await aw.databases.createDocument(
        aw.config.databaseId,
        aw.config.applicationsCollectionId,
        ID.unique(),
        data
      );
      return doc.$id;
    }
  } catch (err: any) {
    console.warn('[Appwrite] Save application fallback to local storage:', err?.message || err);
    return null;
  }
}

export async function deleteApplicationFromAppwrite(id: string): Promise<boolean> {
  const aw = getAppwriteClient();
  if (!aw || !isValidAppwriteId(id)) return false;

  try {
    await aw.databases.deleteDocument(
      aw.config.databaseId,
      aw.config.applicationsCollectionId,
      id
    );
    return true;
  } catch (err: any) {
    if (err?.code === 404 || err?.status === 404) {
      return true;
    }
    console.error('Appwrite delete application error:', err);
    return false;
  }
}
