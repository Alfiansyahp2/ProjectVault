/**
 * Appwrite Cloud Sync helper for projects
 */
export async function syncProjectsToAppwrite(allProjects: any[]): Promise<number> {
  const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const appwriteDbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const appwriteProjectsCol = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION;

  if (!appwriteEndpoint || !appwriteProjectId || !appwriteDbId || !appwriteProjectsCol) {
    return 0;
  }

  let syncedCount = 0;
  try {
    const headers: Record<string, string> = {
      'X-Appwrite-Project': appwriteProjectId,
      'Content-Type': 'application/json'
    };

    const res = await fetch(
      `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteProjectsCol}/documents?limit=100`,
      { headers, cache: 'no-store' }
    );

    if (res.ok) {
      const data = await res.json();
      const existingDocs = data.documents || [];
      const existingMap = new Map<string, any>();
      existingDocs.forEach((d: any) => {
        existingMap.set((d.title || '').trim().toLowerCase(), d);
      });

      for (const p of allProjects) {
        const key = (p.title || '').trim().toLowerCase();
        const payload: any = {
          title: p.title,
          role: p.role,
          category: p.category,
          technologies: p.technologies,
          description: p.description,
          achievements: p.achievements,
          date: p.date || '2026'
        };

        if (p.repo_url && p.repo_url.startsWith('http')) {
          payload.repo_url = p.repo_url;
        }
        if (p.demo_url && p.demo_url.startsWith('http')) {
          payload.demo_url = p.demo_url;
        }

        if (existingMap.has(key)) {
          const docId = existingMap.get(key).$id;
          await fetch(
            `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteProjectsCol}/documents/${docId}`,
            {
              method: 'PATCH',
              headers,
              body: JSON.stringify({ data: payload })
            }
          );
          syncedCount++;
        } else {
          await fetch(
            `${appwriteEndpoint}/databases/${appwriteDbId}/collections/${appwriteProjectsCol}/documents`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                documentId: 'unique()',
                data: payload
              })
            }
          );
          syncedCount++;
        }
      }
    }
  } catch (cloudErr) {
    console.warn('Appwrite cloud sync skipped or timed out:', cloudErr);
  }

  return syncedCount;
}
