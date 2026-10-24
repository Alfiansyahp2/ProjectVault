from typing import List
from ..models.project import ProjectItem

def build_ai_prompt(
    applicant_name: str,
    job_title: str,
    company_name: str,
    job_desc: str,
    projects: List[ProjectItem]
) -> str:
    """Build a master prompt to paste into external AI chat so it never forgets context."""
    projects_summary = []
    for i, p in enumerate(projects, 1):
        techs = ", ".join(p.technologies) if p.technologies else "N/A"
        achieve = f" | Pencapaian: {p.achievements}" if p.achievements else ""
        projects_summary.append(
            f"{i}. [{p.title}] (Peran: {p.role})\n"
            f"   - Teknologi: {techs}\n"
            f"   - Deskripsi: {p.description}{achieve}"
        )
        
    projects_block = "\n".join(projects_summary) if projects_summary else "Belum ada proyek yang dicatat."
    
    prompt = (
        f"### SYSTEM INSTRUCTION / KONTEKS UTAMA KANDIDAT\n"
        f"Nama Pelamar: {applicant_name}\n"
        f"Posisi yang Dituju: {job_title} di {company_name}\n\n"
        f"--- DAFTAR RIWAYAT PROYEK RESMI KANDIDAT (JANGAN PERNAH LUPAKAN INI) ---\n"
        f"{projects_block}\n\n"
        f"--- DESKRIPSI LOWONGAN PEKERJAAN ---\n"
        f"{job_desc.strip()}\n\n"
        f"--- TUGAS ANDA ---\n"
        f"Sebagai konsultan karir AI pribadi saya, gunakan HANYA fakta dan proyek nyata di atas untuk membantu saya:\n"
        f"1. Mempersiapkan simulasi pertanyaan interview untuk posisi ini.\n"
        f"2. Memoles surat lamaran dan poin CV agar 100% selaras dengan syarat lowongan.\n"
        f"3. Jangan mengarang proyek baru; selalu kaitkan jawaban dengan daftar proyek saya di atas."
    )
    return prompt

def build_master_prompt(
    applicant_name: str,
    headline_role: str,
    projects: List[ProjectItem],
    custom_notes: str = ""
) -> str:
    """Generate a master system prompt containing all portfolio projects."""
    projects_summary = []
    for i, p in enumerate(projects, 1):
        techs = ", ".join(p.technologies) if p.technologies else "N/A"
        achieve = f" | Hasil/Metrik: {p.achievements}" if p.achievements else ""
        links = []
        if p.repo_url: links.append(f"Repo: {p.repo_url}")
        if p.demo_url: links.append(f"Demo: {p.demo_url}")
        link_str = f" ({', '.join(links)})" if links else ""
        
        projects_summary.append(
            f"{i}. [{p.title}] - Peran: {p.role}{link_str}\n"
            f"   - Kategori: {p.category}\n"
            f"   - Teknologi: {techs}\n"
            f"   - Deskripsi: {p.description}{achieve}"
        )
        
    projects_block = "\n\n".join(projects_summary) if projects_summary else "Belum ada proyek yang dicatat."
    notes_block = f"\nCatatan Tambahan: {custom_notes}" if custom_notes else ""
    
    prompt = (
        f"### PROFIL & DATABASE RESMI PORTOFOLIO SAYA\n"
        f"Nama: {applicant_name}\n"
        f"Fokus / Peran Utama: {headline_role}{notes_block}\n\n"
        f"### RIWAYAT PROYEK YANG PERNAH SAYA KERJAKAN:\n"
        f"{projects_block}\n\n"
        f"--- PETUNJUK UNTUK AI ---\n"
        f"Mulai sekarang dalam sesi chat ini, jadilah asisten karir saya. Setiap kali saya menanyakan tentang pembuatan CV, surat lamaran (cover letter), atau persiapan wawancara teknis, RUJUKLAH selalu proyek-proyek nyata di atas sebagai bukti portofolio saya. Jangan pernah membuat-buat proyek fiktif."
    )
    return prompt
