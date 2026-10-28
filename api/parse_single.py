import os
import sys
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Ensure project root is in sys.path for direct CLI execution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    from api.services.nlp_engine import parse_pdf_document, parse_raw_text
except ImportError:
    from services.nlp_engine import parse_pdf_document, parse_raw_text

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path or --text provided"}))
        sys.exit(1)

    if sys.argv[1] == "--file-text":
        txt_path = sys.argv[2]
        hint = sys.argv[3] if len(sys.argv) > 3 else "Teks Salinan"
        try:
            with open(txt_path, "r", encoding="utf-8") as f:
                content = f.read()
            data = parse_raw_text(content, source_hint=hint)
            print(json.dumps(data, ensure_ascii=False))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
        return

    if sys.argv[1] == "--text":
        raw_text = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
        try:
            data = parse_raw_text(raw_text, source_hint="Teks Salinan")
            print(json.dumps(data, ensure_ascii=False))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
        return

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(json.dumps({"error": f"File not found: {filepath}"}))
        sys.exit(1)

    try:
        data = parse_pdf_document(filepath)
        print(json.dumps(data, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
