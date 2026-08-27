#!/usr/bin/env python3
"""
ocr_split_cols.py — Re-OCR semua halaman resep dengan split kolom kiri/kanan.
Setiap halaman dipotong menjadi 2 kolom sebelum di-OCR.
"""
import os, sys
import pytesseract
from PIL import Image

IMG_DIR  = "/sessions/friendly-intelligent-hamilton/ocr_pages"
OUT_DIR  = "/sessions/friendly-intelligent-hamilton/ocr_split"
os.makedirs(OUT_DIR, exist_ok=True)

files = sorted(f for f in os.listdir(IMG_DIR) if f.endswith(".jpg"))

start_idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
end_idx   = int(sys.argv[2]) if len(sys.argv) > 2 else min(start_idx + 50, len(files))

# Halaman 1-24 = front matter (1 kolom), halaman 25+ = resep (2 kolom)
RECIPE_START_PAGE = 24  # index (0-based) dari file list

print(f"Split-OCR halaman index {start_idx} s/d {end_idx-1}...")

results = []
for i in range(start_idx, end_idx):
    fname    = files[i]
    path     = os.path.join(IMG_DIR, fname)
    page_num = int(fname[1:5])
    img      = Image.open(path)
    w, h     = img.size

    if page_num < 25:
        # Front matter: 1 kolom, OCR langsung
        text = pytesseract.image_to_string(img, lang="eng", config="--psm 6")
        results.append(f"<<<PAGE:{page_num}>>>\n{text}")
    else:
        # Halaman resep: 2 kolom
        # Split dengan sedikit overlap di tengah
        mid = w // 2
        margin = int(w * 0.02)  # 2% margin

        # Kolom kiri: dari x=0 sampai x=mid+margin
        left_img  = img.crop((0, 0, mid + margin, h))
        # Kolom kanan: dari x=mid-margin sampai x=w
        right_img = img.crop((mid - margin, 0, w, h))

        text_left  = pytesseract.image_to_string(left_img,  lang="eng", config="--psm 6")
        text_right = pytesseract.image_to_string(right_img, lang="eng", config="--psm 6")

        results.append(f"<<<PAGE:{page_num}L>>>\n{text_left}")
        results.append(f"<<<PAGE:{page_num}R>>>\n{text_right}")

    if (i - start_idx + 1) % 10 == 0:
        print(f"  {i - start_idx + 1}/{end_idx - start_idx} halaman selesai", flush=True)

out_file = f"{OUT_DIR}/split_{start_idx:03d}_{end_idx:03d}.txt"
with open(out_file, "w", encoding="utf-8") as f:
    f.write("\n".join(results))
print(f"Tersimpan: {out_file}")
