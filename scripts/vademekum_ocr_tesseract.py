#!/usr/bin/env python3
"""OCR untuk Vademekum menggunakan Tesseract (Local, Gratis)"""

import os
import json
import time
from pathlib import Path
from PIL import Image
import pytesseract

IMG_FOLDER = r"C:\Users\mosto\Desktop\HERBORATECH\data\vademekum\pages"
OUTPUT_FILE = r"C:\Users\mosto\Desktop\HERBORATECH\data\vademekum\ocr_raw.json"

# Configure Tesseract path (Windows specific)
try:
    pytesseract.pytesseract.pytesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
except:
    pass

def ocr_page(image_path: str, page_num: int) -> str:
    """OCR satu halaman menggunakan Tesseract"""
    try:
        img = Image.open(image_path)
        # Extract text dengan config untuk high-quality dokumen
        text = pytesseract.image_to_string(img, lang='ind+eng', config='--psm 1')
        return text
    except Exception as e:
        print(f"  [ERR] Page {page_num}: {str(e)}")
        return ""

def ocr_all_pages():
    """OCR semua image di folder → JSON"""
    results = {}
    imgs = sorted(Path(IMG_FOLDER).glob('page-*.jpg'))

    if not imgs:
        print(f"[ERR] No JPG files found in {IMG_FOLDER}")
        return

    print(f"[OCR] Found {len(imgs)} images. Starting Tesseract OCR...\n")

    start_time = time.time()

    for i, img in enumerate(imgs, 1):
        print(f"[{i:3d}/{len(imgs)}] {img.name}...", end=' ', flush=True)

        text = ocr_page(str(img), i)
        results[img.stem] = text

        if text.strip():
            char_count = len(text)
            print(f"OK ({char_count} chars)")
        else:
            print("EMPTY")

    elapsed = time.time() - start_time
    avg_per_page = elapsed / len(imgs)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] OCR complete!")
    print(f"[OK] Total pages: {len(imgs)}")
    print(f"[OK] Time elapsed: {int(elapsed)}s ({avg_per_page:.1f}s per page)")
    print(f"[OK] Output → {OUTPUT_FILE}")

    return len(imgs)

if __name__ == '__main__':
    ocr_all_pages()
