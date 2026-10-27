import re
from typing import Optional

def is_generic_or_screenshot_hint(name: str) -> bool:
    """Check if a filename or source hint is a screenshot, scanner artifact, URL, or generic placeholder."""
    if not name:
        return True
    name_clean = name.strip()
    name_lower = name_clean.lower()
    
    # Common screenshot, capture, or scanner prefixes/tokens
    if re.search(r'\b(?:screencapture|screenshot|screen_shot|capture|tangkapan\s*layar|responsepage|forms?[-_]cloud|microsoft[-_]pages|img_\d+|image\d*|scan_\d+|virtual/|pasted\s*image)\b', name_lower):
        return True
        
    # URL patterns, parameters, or web scripts
    if any(ext in name_lower for ext in ['.aspx', '.php', '.html', '.htm', 'http://', 'https://', 'forms.cloud', 'office.com', 'google.com', 'forms.gle']):
        return True
        
    # Hex hashes or UUID-like strings (e.g. 12+ hex chars with dashes)
    if re.search(r'^[a-f0-9-]{12,}$', name_lower) or re.search(r'\d{4}-\d{2}-\d{2}-\d{2}_\d{2}_\d{2}', name_lower):
        return True
        
    # Standard generic hints
    generic_words = {
        "teks salinan", "pasted text", "teks mentah", "teks masukan",
        "cli text input", "screenshot", "tangkapan layar", "image",
        "gambar", "virtual", "unknown", "document", "dokumen"
    }
    if name_lower in generic_words or name_lower.startswith(('virtual/', 'gambar:')):
        return True

    return False

def clean_extracted_text(text: str) -> str:
    """Normalize common OCR artifacts, form boilerplate disclaimers, broken words, and irregular spacing."""
    if not text:
        return ""

    # 1. Truncate form disclaimer, abuse reporting, and survey submit footers
    disclaimer_pattern = r'(?i)\n\s*(?:\d+\.\s*Apakah\s+Anda\s+berminat|Never give out your password|Report abuse|Microsoft 365|Microsoft Forms|Consumer Health Privacy|Terms of use|Back\s*\n*\s*Next).*$'
    text = re.sub(disclaimer_pattern, '', text, flags=re.DOTALL)

    # 2. Fix common OCR technical typos and broken terms
    text = re.sub(r'(\b[a-zA-Z])\s+([a-zA-Z]{2,}\b)', r'\1\2', text)
    text = re.sub(r'Full\s*-\s*Stack', 'Full Stack', text, flags=re.IGNORECASE)
    text = re.sub(r'Back\s*-\s*End', 'Backend', text, flags=re.IGNORECASE)
    text = re.sub(r'Front\s*-\s*End', 'Frontend', text, flags=re.IGNORECASE)
    text = re.sub(r'Mid\s*-\s*Level', 'Mid-Level', text, flags=re.IGNORECASE)
    
    # Common OCR character confusions in tech specs
    text = re.sub(r'\bCl\s*/\s*Laravel\b', 'CI/Laravel', text, flags=re.IGNORECASE)
    text = re.sub(r'\(Cl/', '(CI/', text)
    text = re.sub(r'\bunigue\b', 'unique', text, flags=re.IGNORECASE)
    text = re.sub(r'\bguality\b', 'quality', text, flags=re.IGNORECASE)
    text = re.sub(r'\bNode\s+js\b', 'Node.js', text, flags=re.IGNORECASE)

    # 3. Clean messy OCR bullet points and stray noise characters
    lines = []
    for raw_line in text.split('\n'):
        l = raw_line.strip()
        if not l:
            continue
        # Skip isolated OCR noise (single digit, symbols, broken words)
        if re.match(r'^[0-9\W]{1,3}$', l) or l in {'®', 'mb.', 'De” ee.', 'QA C'}:
            continue
        # Standardize OCR bullets like 'e ', '« ', ') e ', '— e ', '* ' into '• '
        l = re.sub(r'^(?:[e*«\-–—\)]+\s*)+', '• ', l)
        lines.append(l)

    return '\n'.join(lines)
