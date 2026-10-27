import os
import re
import sys
import json

# Ensure project root is in sys.path for direct CLI execution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    from api.services.nlp_engine import parse_pdf_document
except ImportError:
    from services.nlp_engine import parse_pdf_document

def parse_pdf(filepath: str):
    item = parse_pdf_document(filepath)
    filename = item["file_name"]
    applied_date = item["applied_date"]
    portal = item["source_portal"]

    safe_name = re.sub(r'[^a-zA-Z0-9]', '_', os.path.splitext(filename)[0]).strip('_').lower()
    app_id = f"app_{safe_name[:40]}_{applied_date.replace('-', '')}"

    item["id"] = app_id
    item["notes"] = f"Diimpor dari berkas: {filename} | Portal: {portal}"
    item["createdAt"] = f"{applied_date}T00:00:00.000Z"
    return item

def get_all_pdf_files():
    scan_folders = [
        os.path.join("data", "resume"),
        os.path.join("data", "resume", "New folder")
    ]
    all_files = []
    seen = set()
    for folder in scan_folders:
        if os.path.exists(folder):
            for f in sorted(os.listdir(folder)):
                if f.lower().endswith(".pdf") and not f.startswith("CV_"):
                    full_p = os.path.join(folder, f)
                    norm_k = os.path.abspath(full_p).lower()
                    if norm_k not in seen:
                        seen.add(norm_k)
                        all_files.append(full_p)
    return all_files

def main():
    json_path = os.path.join("data", "parsed_applications.json")
    all_files = get_all_pdf_files()

    parsed = []
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                parsed = json.load(f)
        except Exception:
            parsed = []

    # Map parsed files by normalized filename and rel_path
    parsed_files = set()
    for item in parsed:
        fn = item.get("file_name") or os.path.basename(item.get("file_path", ""))
        if fn:
            parsed_files.add(fn.lower())

    unparsed_files = [f for f in all_files if os.path.basename(f).lower() not in parsed_files]

    arg = sys.argv[1] if len(sys.argv) > 1 else "--status"

    if arg == "--status":
        out = {
            "totalFiles": len(all_files),
            "parsedCount": len(parsed),
            "unparsedCount": len(unparsed_files),
            "unparsedFiles": [os.path.basename(f) for f in unparsed_files[:10]]
        }
        print(json.dumps(out, indent=2))
        return

    if arg == "--reset":
        limit = 25
        if len(sys.argv) > 2:
            try:
                limit = int(sys.argv[2])
            except Exception:
                limit = 25
        
        reset_items = []
        for f in all_files[:limit]:
            try:
                reset_items.append(parse_pdf(f))
            except Exception:
                pass
        reset_items.sort(key=lambda x: x["applied_date"], reverse=True)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(reset_items, f, indent=2, ensure_ascii=False)
        out = {
            "success": True,
            "message": f"Reset antrean ke {len(reset_items)} berkas awal.",
            "totalFiles": len(all_files),
            "parsedCount": len(reset_items),
            "unparsedCount": len(all_files) - len(reset_items)
        }
        print(json.dumps(out, indent=2))
        return

    # Parse batch: e.g. --batch-size 5
    batch_size = 5
    if arg == "--batch-size" and len(sys.argv) > 2:
        val = sys.argv[2]
        if val.lower() == "all":
            batch_size = len(unparsed_files)
        else:
            try:
                batch_size = int(val)
            except Exception:
                batch_size = 5
    elif arg.startswith("--batch-size="):
        val = arg.split("=")[1]
        if val.lower() == "all":
            batch_size = len(unparsed_files)
        else:
            try:
                batch_size = int(val)
            except Exception:
                batch_size = 5

    files_to_parse = unparsed_files[:batch_size]

    if not files_to_parse:
        out = {
            "success": True,
            "message": "Semua berkas resume telah selesai di-parse!",
            "batchProcessed": 0,
            "newlyParsed": [],
            "totalParsed": len(parsed),
            "unparsedCount": 0
        }
        print(json.dumps(out, indent=2))
        return

    newly_parsed = []
    for filepath in files_to_parse:
        try:
            item = parse_pdf(filepath)
            newly_parsed.append(item)
        except Exception as e:
            print(f"Error parsing {filepath}: {e}", file=sys.stderr)

    # Append to parsed applications
    updated_all = newly_parsed + parsed
    seen_ids = set()
    deduped = []
    for it in updated_all:
        if it["id"] not in seen_ids:
            seen_ids.add(it["id"])
            deduped.append(it)

    deduped.sort(key=lambda x: x["applied_date"], reverse=True)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(deduped, f, indent=2, ensure_ascii=False)

    remaining_unparsed = len(all_files) - len(deduped)

    out = {
        "success": True,
        "message": f"Berhasil mem-parse {len(newly_parsed)} berkas resume baru!",
        "batchProcessed": len(newly_parsed),
        "newlyParsed": newly_parsed,
        "totalParsed": len(deduped),
        "unparsedCount": max(0, remaining_unparsed)
    }
    print(json.dumps(out, indent=2))

if __name__ == "__main__":
    main()
