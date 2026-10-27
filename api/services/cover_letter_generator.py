from typing import List
from ..models.job_analysis import MatchedProject

def generate_cover_letter(
    applicant_name: str,
    job_title: str,
    company_name: str,
    top_projects: List[MatchedProject],
    detected_skills: List[str],
    tone: str = "profesional",
    language: str = "id"
) -> str:
    """
    Generate tailored, high-converting cover letter drafts in various tones and languages.
    Tones supported:
        - profesional: Formal, authoritative, metric & architecture focused
        - antusias: Energetic, high-ownership, passion for product vision
        - ringkas: Crisp, bullet-driven, scannable for busy recruiters
        - teknikal: In-depth engineering, systems design & stack trade-offs
    """
    tone = (tone or "profesional").lower()
    language = (language or "id").lower()
    
    # ------------------ ENGLISH TEMPLATES ------------------
    if language == "en":
        if tone == "ringkas":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies[:4]) if p.technologies else "core stack"
                metric = f" -> {p.achievements}" if p.achievements else ""
                bullets.append(f"• **{p.title}** ({tech}): {p.description}{metric}")
            bullet_block = "\n".join(bullets) if bullets else "• Proven track record in building and deploying production-grade systems."
            
            return (
                f"Dear Hiring Team at {company_name},\n\n"
                f"I am writing to express my focused interest in the **{job_title}** position. With hands-on experience across {', '.join(detected_skills[:4]) if detected_skills else 'software engineering'}, "
                f"here is concrete proof of how I deliver measurable impact:\n\n"
                f"{bullet_block}\n\n"
                f"I am eager to bring this same engineering rigor to {company_name}. I look forward to connecting and discussing how my background aligns with your roadmap.\n\n"
                f"Best regards,\n{applicant_name}"
            )
            
        elif tone == "antusias":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies[:4]) if p.technologies else "modern technologies"
                metric = f" (Key Achievement: {p.achievements})" if p.achievements else ""
                bullets.append(f"- **{p.title}**: Engineered using {tech}. {p.description}{metric}")
            bullet_block = "\n".join(bullets) if bullets else "I thrive on building scalable, reliable software that solves real user problems."
            
            return (
                f"Dear Hiring Team at {company_name},\n\n"
                f"I was genuinely excited to discover the **{job_title}** opening at **{company_name}**. "
                f"Your engineering mission strongly resonates with my passion for building high-quality, impactful digital products.\n\n"
                f"Throughout my engineering journey, I have focused on solving real-world challenges through clean code and reliable architecture. "
                f"A few key projects that highlight my capabilities include:\n\n"
                f"{bullet_block}\n\n"
                f"With my strong background in {', '.join(detected_skills[:5]) if detected_skills else 'software development'}, "
                f"I am ready to hit the ground running, collaborate proactively, and help accelerate {company_name}'s product velocity.\n\n"
                f"Thank you very much for considering my application. I would love the chance to discuss how we can build great things together.\n\n"
                f"Warm regards,\n{applicant_name}"
            )
            
        elif tone == "teknikal":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies) if p.technologies else "software stack"
                metric = f" | Quantified outcome: {p.achievements}" if p.achievements else ""
                bullets.append(f"- **{p.title}** [Role: {p.role}]:\n  Stack: {tech}\n  Architecture & Details: {p.description}{metric}")
            bullet_block = "\n\n".join(bullets) if bullets else "- Strong foundation in clean architecture, performance optimization, and reliable API design."
            
            return (
                f"Dear Engineering Hiring Team at {company_name},\n\n"
                f"I am applying for the **{job_title}** position at **{company_name}**. "
                f"Having analyzed your technical requirements for {', '.join(detected_skills[:6]) if detected_skills else 'this role'}, "
                f"I am confident my hands-on background in systems design, maintainable codebase architecture, and robust delivery makes me a strong fit.\n\n"
                f"### Evidence of Technical Execution:\n\n"
                f"{bullet_block}\n\n"
                f"My engineering philosophy emphasizes clean separation of concerns, testability, and resilience. "
                f"I would welcome a deep-dive technical discussion to explore how my architectural practices can support {company_name}'s scalability goals.\n\n"
                f"Sincerely,\n{applicant_name}"
            )
            
        else:
            # tone == "profesional" (Default English)
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies) if p.technologies else "relevant technologies"
                metric = f" ({p.achievements})" if p.achievements else ""
                bullets.append(f"- **{p.title}** ({p.role}): Developed with {tech}. {p.description}{metric}")
            bullet_block = "Relevant projects from my portfolio that demonstrate my capability:\n" + "\n".join(bullets) if bullets else "I bring a track record of reliable software development and problem solving."
            
            return (
                f"Dear Hiring Team at {company_name},\n\n"
                f"I am writing to express my strong interest in the **{job_title}** role at **{company_name}**. "
                f"With a solid track record of architecting, implementing, and shipping robust solutions, I am confident in my ability to deliver immediate value to your organization.\n\n"
                f"{bullet_block}\n\n"
                f"Given your requirements in {', '.join(detected_skills[:5]) if detected_skills else 'key software engineering disciplines'}, "
                f"my practical experience allows me to ramp up quickly, adapt to established team workflows, and drive high-impact results.\n\n"
                f"I welcome the opportunity to discuss how my qualifications align with {company_name}'s objectives. Thank you for your time and consideration.\n\n"
                f"Sincerely,\n{applicant_name}"
            )
            
    # ------------------ BAHASA INDONESIA TEMPLATES ------------------
    else:
        if tone == "ringkas":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies[:4]) if p.technologies else "stack utama"
                metric = f" -> {p.achievements}" if p.achievements else ""
                bullets.append(f"• **{p.title}** ({tech}): {p.description}{metric}")
            bullet_block = "\n".join(bullets) if bullets else "• Rekam jejak konsisten dalam membangun dan merilis sistem perangkat lunak handal."
            
            return (
                f"Yth. Tim Rekrutmen {company_name},\n\n"
                f"Saya mengajukan lamaran untuk posisi **{job_title}** di **{company_name}**. Dengan kompetensi praktis dalam {', '.join(detected_skills[:4]) if detected_skills else 'rekayasa perangkat lunak'}, "
                f"berikut ringkasan bukti kontribusi nyata dari portofolio saya:\n\n"
                f"{bullet_block}\n\n"
                f"Saya siap membawa etos kerja terarah dan efisiensi eksekusi ini ke tim {company_name}. "
                f"Besar harapan saya untuk dapat berdiskusi lebih lanjut dalam sesi wawancara.\n\n"
                f"Salam hormat,\n{applicant_name}"
            )
            
        elif tone == "antusias":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies[:4]) if p.technologies else "teknologi modern"
                metric = f" (Pencapaian: {p.achievements})" if p.achievements else ""
                bullets.append(f"• **{p.title}**: Dibangun menggunakan {tech}. {p.description}{metric}")
            bullet_block = "\n".join(bullets) if bullets else "Saya selalu antusias membangun solusi digital yang memberikan nilai nyata bagi pengguna."
            
            return (
                f"Yth. Tim Rekrutmen {company_name},\n\n"
                f"Saya sangat bersemangat saat melihat lowongan untuk posisi **{job_title}** di **{company_name}**. "
                f"Visi dan reputasi {company_name} dalam menciptakan inovasi digital yang berdampak sangat selaras dengan passion saya dalam dunia teknologi.\n\n"
                f"Sepanjang perjalanan membangun berbagai produk digital, saya terbiasa memecahkan masalah kompleks dan bekerja dengan rasa kepemilikan (*ownership*) tinggi. "
                f"Berikut beberapa proyek yang paling membuktikan kesiapan saya:\n\n"
                f"{bullet_block}\n\n"
                f"Dengan keahlian yang terasah pada {', '.join(detected_skills[:5]) if detected_skills else 'bidang ini'}, "
                f"saya siap belajar cepat, berkolaborasi secara proaktif, dan memberikan energi positif bagi pencapaian target tim {company_name}.\n\n"
                f"Terima kasih banyak atas waktu dan kesempatan yang diberikan. Saya sangat antusias untuk berdiskusi lebih lanjut!\n\n"
                f"Salam hangat,\n{applicant_name}"
            )
            
        elif tone == "teknikal":
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies) if p.technologies else "teknologi terkait"
                metric = f"\n  Metrik & Dampak: {p.achievements}" if p.achievements else ""
                bullets.append(
                    f"• **{p.title}** (Peran: {p.role})\n"
                    f"  Arsitektur & Stack: {tech}\n"
                    f"  Implementasi: {p.description}.{metric}"
                )
            bullet_block = "\n\n".join(bullets) if bullets else "• Menguasai prinsip clean code, pengujian sistem, dan arsitektur modular yang teruji di lingkungan produksi."
            
            return (
                f"Yth. Engineering Lead & Tim Rekrutmen {company_name},\n\n"
                f"Saya mengajukan diri untuk posisi **{job_title}** di **{company_name}**. "
                f"Berdasarkan analisis spesifikasi teknis lowongan Anda yang memerlukan keahlian {', '.join(detected_skills[:6]) if detected_skills else 'rekayasa perangkat lunak tingkat lanjut'}, "
                f"saya yakin rekam jejak teknis saya dalam merancang sistem yang skalabel, aman, dan mudah di-maintain dapat memperkuat kapabilitas tim Anda.\n\n"
                f"### Bukti Eksekusi Arsitektur & Rekayasa:\n\n"
                f"{bullet_block}\n\n"
                f"Standar rekayasa saya berfokus pada efisiensi pemrosesan, kemudahan kolaborasi tim melalui dokumentasi kode yang rapi, serta pengujian terukur. "
                f"Saya menyambut baik kesempatan untuk mendiskusikan keputusan arsitektural dan solusi teknis yang dapat saya bawa ke proyek-proyek {company_name}.\n\n"
                f"Hormat saya,\n{applicant_name}"
            )
            
        else:
            # tone == "profesional" (Default Indonesian)
            bullets = []
            for mp in top_projects[:3]:
                p = mp.project
                tech = ", ".join(p.technologies) if p.technologies else "teknologi terkait"
                achievement_text = f" Hasil nyata: {p.achievements}." if p.achievements else ""
                bullets.append(
                    f"• **{p.title}** (Peran: {p.role})\n"
                    f"  Teknologi: {tech}\n"
                    f"  Uraian: {p.description}.{achievement_text}"
                )
                
            skills_highlight = f", khususnya dalam pemanfaatan {', '.join(detected_skills[:5])}" if detected_skills else ""
            if bullets:
                proj_body = "Berikut beberapa proyek terkait yang membuktikan kompetensi dan kontribusi nyata saya:\n\n" + "\n\n".join(bullets)
                transition = f"Dengan latar belakang pengalaman praktis tersebut{skills_highlight}, "
            else:
                proj_body = (
                    "Sepanjang perjalanan profesional saya, saya telah membangun fondasi yang kokoh dalam "
                    "merancang, mengimplementasikan, serta mengoptimalkan solusi perangkat lunak yang berorientasi hasil."
                )
                transition = f"Dengan dedikasi dan kompetensi teknis tersebut{skills_highlight}, "
                
            return (
                f"Yth. Tim Rekrutmen {company_name},\n\n"
                f"Saya menulis surat ini untuk menyatakan ketertarikan saya terhadap posisi **{job_title}** di **{company_name}**. "
                f"Berdasarkan pengalaman langsung saya dalam menyelesaikan berbagai proyek perangkat lunak dan solusi digital, "
                f"saya yakin dapat memberikan kontribusi nyata bagi perkembangan tim Anda.\n\n"
                f"{proj_body}\n\n"
                f"{transition}"
                f"saya siap beradaptasi dengan cepat dan berkolaborasi secara produktif bersama {company_name}.\n\n"
                f"Saya sangat antusias untuk berdiskusi lebih lanjut mengenai bagaimana portofolio dan keahlian saya dapat mendukung target perusahaan Anda. "
                f"Terima kasih atas waktu dan kesempatan yang diberikan.\n\n"
                f"Hormat saya,\n{applicant_name}"
            )
