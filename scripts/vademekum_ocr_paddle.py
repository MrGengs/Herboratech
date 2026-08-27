#!/usr/bin/env python3
"""OCR untuk Vademekum menggunakan PaddleOCR (Pure Python, Lightweight)"""

import os
import json
import time
from pathlib import Path
from paddleocr import PaddleOCR

IMG_FOLDER = r"C:\Users\mosto\Desktop\HERBORATECH\data\vademekum\pages"
OUTPUT_FILE = r"C:\Users\mosto\Desktop\HERBORATECH\data\vademekum\ocr_raw.json"

# Initialize PaddleOCR with English support (works well for printed Indonesian text)
# Note: PaddleOCR 'en' model handles Indonesian printed text well
ocr = PaddleOCR(lang='en')

def ocr_page(image_path: str, page_num: int) -> str:
    """OCR satu halaman menggunakan PaddleOCR"""
    try:
        result = ocr.ocr(image_path, cls=True)

        # Extract text from result
        text_lines = []
        for line in result:
            for word_info in line:
                text = word_info[1][0]  # Extract text
                confidence = word_info[1][1]  # Extract confidence
                if confidence > 0.3:  # Only keep text with confidence > 30%
                    text_lines.append(text)

        text = '\n'.join(text_lines)
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

    print(f"[OCR] Found {len(imgs)} images. Starting PaddleOCR...\n")
    print(f"[NOTE] First run will download PaddleOCR models (~150MB)")
    print(f"[NOTE] Subsequent runs will be faster\n")

    start_time = time.time()
    processed = 0

    for i, img in enumerate(imgs, 1):
        print(f"[{i:3d}/{len(imgs)}] {img.name}...", end=' ', flush=True)

        text = ocr_page(str(img), i)
        results[img.stem] = text
        processed += 1

        if text.strip():
            char_count = len(text)
            print(f"OK ({char_count} chars)")
        else:
            print("EMPTY")

    elapsed = time.time() - start_time
    avg_per_page = elapsed / processed if processed > 0 else 0

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] OCR complete!")
    print(f"[OK] Processed: {processed}/{len(imgs)} pages")
    print(f"[OK] Time: {int(elapsed)}s ({avg_per_page:.1f}s per page)")
    print(f"[OK] Output: {OUTPUT_FILE}")

    return processed

if __name__ == '__main__':
    ocr_all_pages()
