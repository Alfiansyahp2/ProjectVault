import os
import sys
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from api.ml.trainer import train_all_models
from api.services.ml_parser import reload_models
from api.ml.learning_log import get_learning_logs

def main():
    print("=" * 60)
    print("   PROJECTVAULT: LOCAL ML DOCUMENT PARSER TRAINING (NO API KEY)")
    print("=" * 60)
    print("Mempersiapkan data latih dari data/parsed_applications.json dan log...")

    try:
        metadata = train_all_models()
        reload_models()
        logs_info = get_learning_logs(limit=1)

        metrics = metadata["metrics"]
        print("\n[SUKSES] Pelatihan Model Machine Learning Selesai!")
        print("-" * 60)
        print(f"Total Sampel Dilatih : {metadata['sample_count']} dokumen")
        print(f"Log Pembelajaran     : {logs_info['total_logged']} sesi ({logs_info['verified_count']} terverifikasi)")
        print(f"Distribusi Data      : {metadata['train_samples']} latih / {metadata['test_samples']} uji")
        print(f"Waktu Pelatihan      : {metadata['trained_at']}")
        print("-" * 60)
        print("HASIL EVALUASI METRIK PADA DATA UJI (TEST SET):")
        print(f"  • Akurasi Posisi (Job Title) : {metrics['job_title_accuracy'] * 100:.1f}%")
        print(f"  • Akurasi Portal Sumber      : {metrics['portal_accuracy'] * 100:.1f}% (F1: {metrics['portal_f1']:.3f})")
        print(f"  • Akurasi Entitas Perusahaan : {metrics['company_top1_accuracy'] * 100:.1f}%")
        print(f"  • Akurasi Rata-rata Model    : {metrics['overall_accuracy'] * 100:.1f}%")
        print("-" * 60)
        print("Model tersimpan di: api/models_cache/parser_models.joblib")
        print("Engine parser lokal siap memproses dokumen secara cerdas.")
        print("=" * 60)

    except Exception as e:
        print(f"\n[GALAT] Pelatihan model gagal: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
