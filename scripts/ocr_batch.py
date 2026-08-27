#!/usr/bin/env python3
"""OCR batch per 50 halaman, simpan incremental."""
import os, sys
import pytesseract
from PIL import Image

IMG_DIR  = "/sessions/friendly-intelligent-hamilton/ocr_pages"
OUT_DIR  = "/sessions/friendly-intelligent-hamilton/ocr_batches"
os.makedirs(OUT_DIR, exist_ok=True)

files = sorted(f for f in os.listdir(IMG_DIR) if f.endswith(".jpg"))

start_idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
end_idx   = int(sys.argv[2]) if len(sys.argv) > 2 else min(start_idx + 50, len(files))

print(f"OCR halaman index {start_idx} s/d {end_idx-1} ({end_idx-start_idx} halaman)...")

results = []
for i in range(start_idx, end_idx):
    fname = files[i]
    path  = os.path.join(IMG_DIR, fname)
    page_num = int(fname[1:5])
    text = pytesseract.image_to_string(Image.open(path), lang="eng", config="--psm 6")
    results.append(f"<<<PAGE:{page_num}>>>\n{text}")
    if (i - start_idx + 1) % 10 == 0:
        print(f"  {i - start_idx + 1}/{end_idx - start_idx} selesai")

batch_file = f"{OUT_DIR}/batch_{start_idx:03d}_{end_idx:03d}.txt"
with open(batch_file, "w", encoding="utf-8") as f:
    f.write("\n".join(results))
print(f"Tersimpan: {batch_file}")
