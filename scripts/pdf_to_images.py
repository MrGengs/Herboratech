#!/usr/bin/env python3
"""Convert PDF to high-quality JPEG images for OCR using PyMuPDF"""

import os
from pathlib import Path
import fitz  # PyMuPDF

PDF_PATH = r"C:\Users\mosto\Downloads\Vademekum Tanaman Obat Untuk Saintifikasi Jamu Jilid 1 (edisi Revisi).pdf"
OUTPUT_DIR = r"C:\Users\mosto\Desktop\HERBORATECH\data\vademekum\pages"

def convert_pdf():
    """Convert PDF to JPEG images at 300 DPI"""
    print(f"[PDF] Reading PDF: {PDF_PATH}")
    print(f"[OUT] Output folder: {OUTPUT_DIR}")

    # Open PDF
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    print(f"[OK] PDF loaded. Total pages: {total_pages}")

    # Save each page as JPEG
    for page_num in range(total_pages):
        page = doc[page_num]
        # Render at 300 DPI (zoom factor = 300/72 = 4.167)
        zoom = 300 / 72
        matrix = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        output_file = Path(OUTPUT_DIR) / f"page-{page_num + 1:04d}.jpg"
        pix.save(output_file, "jpeg")
        if (page_num + 1) % 20 == 0:
            print(f"  [OK] Saved page {page_num + 1}/{total_pages}")

    doc.close()
    print(f"[OK] Done! {total_pages} images saved to {OUTPUT_DIR}")
    return total_pages

if __name__ == '__main__':
    convert_pdf()
