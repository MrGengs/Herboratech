#!/usr/bin/env python3
"""OCR untuk Vademekum menggunakan Alibaba Qwen-VL-OCR API"""

import os
import json
import base64
import time
from pathlib import Path
from dashscope import MultiModalConversation

ALIBABA_API_KEY = "sk-b0dfeb5b4dd24b138619c8de0629840e"
IMG_FOLDER = r"C:\Users\mosto\Desktop\HERBORATECH\data\vademekum\pages"
OUTPUT_FILE = r"C:\Users\mosto\Desktop\HERBORATECH\data\vademekum\ocr_raw.json"

def ocr_page(image_path: str, page_num: int) -> str:
    """Kirim satu halaman ke Qwen-VL-OCR, return teks hasil"""
    try:
        with open(image_path, 'rb') as f:
            img_b64 = base64.b64encode(f.read()).decode()

        messages = [{
            'role': 'user',
            'content': [
                {
                    'image': f'data:image/jpeg;base64,{img_b64}'
                },
                {
                    'text': '''Ekstrak SEMUA teks dari halaman ini secara lengkap dan akurat.
Pertahankan struktur: nama tanaman, nama latin, keluarga, bagian yang digunakan,
kandungan aktif, manfaat, dosis, kontraindikasi, efek samping, interaksi obat, status BPOM.
Jika ada tabel, preserve struktur dengan newline dan spasi.
Output: teks mentah tanpa formatting.'''
                }
            ]
        }]

        response = MultiModalConversation.call(
            model='qwen-vl-ocr',
            messages=messages,
            api_key=ALIBABA_API_KEY
        )

        text = response.output.choices[0].message.content[0]['text']
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

    print(f"[OCR] Found {len(imgs)} images. Starting OCR...\n")

    for i, img in enumerate(imgs, 1):
        print(f"[{i:3d}/{len(imgs)}] {img.name}...", end=' ', flush=True)

        text = ocr_page(str(img), i)
        results[img.stem] = text

        if text:
            print(f"OK ({len(text)} chars)")
        else:
            print("EMPTY")

        # Rate limiting - Alibaba API limit ~5-10 requests per minute
        if i % 5 == 0:
            print(f"     Pausing 5 seconds to avoid rate limit...")
            time.sleep(5)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] OCR complete! Output → {OUTPUT_FILE}")
    print(f"[OK] Total pages processed: {len(imgs)}")
    return len(imgs)

if __name__ == '__main__':
    ocr_all_pages()
