#!/usr/bin/env python3
"""Parse OCR results dari Vademekum → Firestore herbals schema"""

import json
import re
from pathlib import Path

SCHEMA_TEMPLATE = {
    'name': '',
    'latinName': '',
    'family': '',
    'partsUsed': [],
    'activeCompounds': [],
    'benefits': [],
    'mechanism': '',
    'dosage': '',
    'frequency': '',
    'contraindications': [],
    'sideEffects': [],
    'drugInteractions': [],
    'bpomStatus': 'Jamu Saintifikasi',
    'evidenceLevel': 'A',
    'source': 'Vademekum Tanaman Obat Saintifikasi Jamu Jilid 1, Kemenkes RI',
    'sourceType': 'kemenkes',
    'categories': [],
    'notes': ''
}

OCR_JSON = r"/sessions/nice-funny-archimedes/mnt/HERBORATECH/data/vademekum/ocr_raw.json"
OUTPUT_JSON = r"/sessions/nice-funny-archimedes/mnt/HERBORATECH/data/vademekum/herbals_vademekum.json"

def parse_entry(raw_text: str, page_name: str) -> dict:
    """Parse raw OCR text satu tanaman → dict schema Firestore"""
    entry = SCHEMA_TEMPLATE.copy()

    if not raw_text or len(raw_text.strip()) < 20:
        return None

    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
    if not lines:
        return None

    # Extract nama tanaman (biasanya baris pertama yang tidak kosong)
    entry['name'] = lines[0]

    # Cari nama latin (biasanya setelah "(" atau ":")
    for line in lines[1:5]:
        if any(c in line for c in '()[]'):
            entry['latinName'] = line.strip('()[]')
            break

    # Cari family/keluarga (keyword "Keluarga" atau "Family")
    for line in lines:
        if any(kw in line.lower() for kw in ['keluarga', 'family', 'famili']):
            match = re.search(r'[:=]\s*(.+)', line)
            if match:
                entry['family'] = match.group(1).strip()
                break

    # Cari bagian yang digunakan (keywords: "Bagian", "Digunakan", "Part")
    for line in lines:
        if any(kw in line.lower() for kw in ['bagian digunakan', 'part used', 'bagian', 'digunakan']):
            match = re.search(r'[:=]\s*(.+)', line)
            if match:
                parts = match.group(1).strip()
                entry['partsUsed'] = [p.strip() for p in parts.split(',') if p.strip()]
                break

    # Cari kandungan aktif (keywords: "Kandungan", "Active", "Compound")
    for line in lines:
        if any(kw in line.lower() for kw in ['kandungan aktif', 'active compound', 'zat aktif']):
            match = re.search(r'[:=]\s*(.+)', line)
            if match:
                compounds = match.group(1).strip()
                entry['activeCompounds'] = [c.strip() for c in compounds.split(',') if c.strip()]
                break

    # Cari manfaat/benefits (keywords: "Manfaat", "Benefit", "Kegunaan", "Indication")
    for i, line in enumerate(lines):
        if any(kw in line.lower() for kw in ['manfaat', 'benefit', 'kegunaan', 'indikasi', 'indication']):
            # Ambil beberapa baris setelah keyword
            benefits_section = []
            for next_line in lines[i+1:i+10]:
                if any(kw in next_line.lower() for kw in ['dosis', 'cara', 'keamanan', 'kontra', 'efek', 'interaksi']):
                    break
                benefits_section.append(next_line)
            entry['benefits'] = benefits_section[:5]  # Ambil max 5 benefits
            break

    # Cari dosis (keywords: "Dosis", "Dosage")
    for line in lines:
        if 'dosis' in line.lower() or 'dosage' in line.lower():
            match = re.search(r'[:=]\s*(.+)', line)
            if match:
                entry['dosage'] = match.group(1).strip()
                break

    # Cari kontraindikasi (keywords: "Kontra", "Contraindication")
    for i, line in enumerate(lines):
        if 'kontra' in line.lower() or 'contraindication' in line.lower():
            contras = []
            for next_line in lines[i+1:i+8]:
                if any(kw in next_line.lower() for kw in ['efek', 'interaksi', 'dosis', 'manfaat']):
                    break
                contras.append(next_line)
            entry['contraindications'] = contras[:5]
            break

    # Cari efek samping (keywords: "Efek", "Side effect")
    for i, line in enumerate(lines):
        if any(kw in line.lower() for kw in ['efek samping', 'side effect']):
            effects = []
            for next_line in lines[i+1:i+8]:
                if any(kw in next_line.lower() for kw in ['interaksi', 'kontra', 'dosis', 'manfaat']):
                    break
                effects.append(next_line)
            entry['sideEffects'] = effects[:5]
            break

    # Cari interaksi obat (keywords: "Interaksi", "Drug interaction")
    for i, line in enumerate(lines):
        if 'interaksi' in line.lower() or 'interaction' in line.lower():
            interactions = []
            for next_line in lines[i+1:i+8]:
                if any(kw in next_line.lower() for kw in ['catatan', 'keterangan', 'sumber']):
                    break
                interactions.append(next_line)
            entry['drugInteractions'] = interactions[:5]
            break

    return entry if entry['name'] else None

def parse_all():
    """Parse semua OCR mentah → schema terstruktur"""
    print(f"[PARSE] Reading: {OCR_JSON}")

    with open(OCR_JSON, 'r', encoding='utf-8') as f:
        raw = json.load(f)

    print(f"[PARSE] Processing {len(raw)} pages...")

    entries = []
    skipped = 0

    for page_name, text in raw.items():
        if not text or len(text.strip()) < 20:
            skipped += 1
            continue

        parsed = parse_entry(text, page_name)
        if parsed and parsed['name']:
            entries.append(parsed)
        else:
            skipped += 1

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

    print(f"[OK] Parsed {len(entries)} tanaman")
    print(f"[OK] Skipped {skipped} empty/invalid pages")
    print(f"[OK] Output → {OUTPUT_JSON}")

    return len(entries)

if __name__ == '__main__':
    parse_all()
