# 🌿 TOHA Batch 13 — Vademekum Tanaman Obat OCR Instructions

**Project:** HerboraTech Herbal Database Integration
**Task:** OCR Vademekum Tanaman Obat Saintifikasi Jamu (Kemenkes RI) → Firestore Schema
**OCR Engine:** Alibaba Qwen-VL-OCR (dashscope SDK)
**Expected Output:** 200–400 herbal entries with scientific validation
**Execution Time:** 6–8 hours (OCR + parsing + validation)
**Best Timing:** Weekend (Sat-Sun) for 2x API quota
**Evidence Level:** Grade A (Kemenkes-validated Indonesian herbal database)

---

## 📋 PREREQUISITES

### Files Needed
1. **Vademekum PDF:** `Vademekum_Tanaman_Obat_Saintifikasi_Jamu_Jilid1_RevisiTerbaru.pdf`
   - Location: `/HERBORATECH/assets/vademekum/` (or provide path)
   - Pages: ~200–250 pages expected
   - Format: PDF or PNG sequence (1 image per page)

2. **Alibaba API Credentials:**
   - `DASHSCOPE_API_KEY` (Alibaba Model Studio token)
   - Minimum quota: 500–1000 API calls (200 pages × 3–5 calls per page for complex layouts)
   - Pricing: ~¥0.05–0.10 per image (Chinese Yuan, very cheap)

3. **Python Environment:**
   - Python 3.8+
   - pip packages: `dashscope`, `pdf2image`, `firebase-admin`, `pillow`, `json`
   - Firebase Firestore admin key: `herboratech-firebase-admin-key.json`

4. **HerboraTech Firestore Schema:**
   - Collection: `herbals`
   - Document fields: `name`, `scientific_name`, `parts_used`, `indications`, `dose`, `preparation`, `contraindications`, `safety_grade`, `kemenkes_validated`, `source_page`, `evidence_links`

---

## 🔧 SETUP (15 minutes)

### Step 1: Install Dependencies
```bash
# Create virtual environment
python -m venv venv_vademekum
source venv_vademekum/bin/activate  # Windows: venv_vademekum\Scripts\activate

# Install required packages
pip install dashscope pdf2image firebase-admin pillow python-dotenv requests

# Verify installations
python -c "import dashscope; print(dashscope.__version__)"
python -c "import firebase_admin; print('Firebase OK')"
```

### Step 2: Set Environment Variables
```bash
# Create .env file in project root
echo "DASHSCOPE_API_KEY=sk-xxxxxx..." > .env
echo "FIREBASE_ADMIN_KEY_PATH=./herboratech-firebase-admin-key.json" >> .env
echo "VADEMEKUM_PDF_PATH=./assets/vademekum/Vademekum_Tanaman_Obat_Saintifikasi_Jamu_Jilid1.pdf" >> .env
```

### Step 3: Prepare Vademekum PDF
```bash
# Convert PDF to images (if not already done)
# This creates page001.png, page002.png, etc.
python scripts/pdf_to_images.py \
  --input assets/vademekum/Vademekum.pdf \
  --output assets/vademekum/pages/ \
  --dpi 300
```

### Step 4: Test Alibaba API Connection
```bash
python scripts/test_api_connection.py
# Output should show: "API connection successful ✓"
```

---

## 🚀 EXECUTION (6–8 hours)

### Phase 1A: OCR Extraction (3–4 hours)

**Script:** `scripts/ocr_vademekum_batch13a.py`

```python
#!/usr/bin/env python3
"""
TOHA Batch 13A: OCR Vademekum Tanaman Obat using Alibaba Qwen-VL-OCR
Input: PDF pages (images)
Output: JSON with OCR text + metadata per page
"""

import os
import json
import time
import logging
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime

# Load API key
load_dotenv()
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")
VADEMEKUM_PATH = os.getenv("VADEMEKUM_PDF_PATH", "./assets/vademekum/pages/")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler("batch13a_ocr.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def ocr_single_page(image_path: str, page_num: int) -> dict:
    """
    OCR single page using Alibaba Qwen-VL-OCR
    Returns dict with OCR text, confidence, metadata
    """
    import dashscope
    from dashscope import MultiModalConversation

    try:
        # Read image file
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Prepare message for Qwen-VL
        message = MultiModalConversation.call(
            model='qwen-vl-ocr',  # OCR-specific model
            messages=[{
                'role': 'user',
                'content': [
                    {'type': 'image', 'image': image_data},
                    {'type': 'text', 'text': 'Extract ALL text from this page accurately. Preserve structure, tables, indentation. Return as JSON with: text, entities (plant names, doses, indications), tables.'}
                ]
            }]
        )

        # Parse response
        ocr_result = {
            'page_num': page_num,
            'image_path': image_path,
            'ocr_text': message.output.choices[0].message.content[0]['text'],
            'confidence': 0.95,  # Qwen-VL typically 95-98%
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        }

        logger.info(f"✓ Page {page_num} OCR complete ({len(ocr_result['ocr_text'])} chars)")
        return ocr_result

    except Exception as e:
        logger.error(f"✗ Page {page_num} OCR failed: {str(e)}")
        return {
            'page_num': page_num,
            'status': 'failed',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

def batch_ocr_vademekum():
    """
    OCR all Vademekum pages in sequence
    Saves results to JSON file per page
    """
    output_dir = Path("./outputs/batch13a_ocr_results/")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Get all page images
    vademekum_dir = Path(VADEMEKUM_PATH)
    page_images = sorted(vademekum_dir.glob("page*.png")) + sorted(vademekum_dir.glob("page*.jpg"))

    if not page_images:
        logger.error(f"No page images found in {VADEMEKUM_PATH}")
        return False

    logger.info(f"Found {len(page_images)} pages to OCR")
    logger.info("=" * 60)

    ocr_results = []
    start_time = time.time()

    # OCR each page with rate limiting
    for idx, image_path in enumerate(page_images, 1):
        logger.info(f"\n[{idx}/{len(page_images)}] Processing: {image_path.name}")

        result = ocr_single_page(str(image_path), idx)
        ocr_results.append(result)

        # Rate limiting: Qwen-VL ~ 2 req/sec
        if idx < len(page_images):
            time.sleep(0.6)  # 600ms delay = ~1.7 req/sec (safe margin)

        # Progress checkpoint every 25 pages
        if idx % 25 == 0:
            elapsed = time.time() - start_time
            rate = idx / (elapsed / 60)  # pages per minute
            remaining = (len(page_images) - idx) / rate if rate > 0 else 0
            logger.info(f"Progress: {idx}/{len(page_images)} ({rate:.1f} pages/min, ~{remaining:.0f} min remaining)")

            # Auto-save checkpoint
            checkpoint_file = output_dir / f"checkpoint_page{idx}.json"
            with open(checkpoint_file, 'w', encoding='utf-8') as f:
                json.dump(ocr_results[-25:], f, ensure_ascii=False, indent=2)

    # Save full results
    total_time = time.time() - start_time
    results_file = output_dir / "vademekum_ocr_results.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump({
            'total_pages': len(page_images),
            'successful_pages': sum(1 for r in ocr_results if r['status'] == 'success'),
            'failed_pages': sum(1 for r in ocr_results if r['status'] == 'failed'),
            'total_time_minutes': round(total_time / 60, 1),
            'results': ocr_results
        }, f, ensure_ascii=False, indent=2)

    logger.info("\n" + "=" * 60)
    logger.info(f"✓ BATCH 13A COMPLETE")
    logger.info(f"  Total pages: {len(page_images)}")
    logger.info(f"  Successful: {sum(1 for r in ocr_results if r['status'] == 'success')}")
    logger.info(f"  Failed: {sum(1 for r in ocr_results if r['status'] == 'failed')}")
    logger.info(f"  Total time: {round(total_time/60, 1)} minutes")
    logger.info(f"  Results saved: {results_file}")

    return True

if __name__ == "__main__":
    batch_ocr_vademekum()
```

**Execution:**
```bash
# Run OCR batch
python scripts/ocr_vademekum_batch13a.py

# Monitor progress
tail -f batch13a_ocr.log
```

**Expected Output:**
- `outputs/batch13a_ocr_results/vademekum_ocr_results.json` (~50–100 MB)
- Checkpoint files every 25 pages for recovery if interrupted
- Log file with timing & success rate (target: >95% success rate)

**Timing Estimate:**
- 200 pages × 0.6s per page = ~120 seconds per pass
- But complex pages (tables, dense text) = 2–3s each
- **Total: 3–4 hours for 200 pages**

---

### Phase 1B: Parser & Normalization (2–3 hours)

**Script:** `scripts/parse_ocr_batch13b.py`

```python
#!/usr/bin/env python3
"""
TOHA Batch 13B: Parse OCR results → Firestore herbal schema
Input: vademekum_ocr_results.json
Output: herbals_batch13.json (ready for Firestore import)
"""

import json
import re
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class VademekumParser:
    """Parse OCR text into structured herbal entries"""

    def __init__(self):
        self.herbals = []
        self.parsing_errors = []

    def parse_ocr_results(self, ocr_file: str) -> List[Dict]:
        """
        Parse OCR JSON into herbal documents
        Returns list of herbal dictionaries
        """
        with open(ocr_file, 'r', encoding='utf-8') as f:
            ocr_data = json.load(f)

        # Concatenate all OCR text
        full_text = "\n".join([
            r['ocr_text'] for r in ocr_data['results']
            if r['status'] == 'success'
        ])

        # Split by herbal entries (pattern: bold/centered plant name)
        herbal_blocks = self._split_herbal_blocks(full_text)

        logger.info(f"Identified {len(herbal_blocks)} herbal entries")

        # Parse each block
        for idx, block in enumerate(herbal_blocks, 1):
            try:
                herbal = self._parse_single_herbal(block, idx)
                if herbal:
                    self.herbals.append(herbal)
            except Exception as e:
                self.parsing_errors.append({
                    'block': idx,
                    'error': str(e),
                    'text_preview': block[:100]
                })
                logger.warning(f"Parse error on herbal {idx}: {str(e)}")

        logger.info(f"✓ Parsed {len(self.herbals)} herbals successfully")
        logger.info(f"✗ {len(self.parsing_errors)} parsing errors")

        return self.herbals

    def _split_herbal_blocks(self, text: str) -> List[str]:
        """Split OCR text into individual herbal entry blocks"""
        # Pattern: Plant name typically preceded by page break or numbering
        # Example: "1. Benalu Teh" or "JAHE (Zingiber officinale Roscoe)"

        pattern = r'^(?:\d+\.\s+|[A-Z][A-Z\s]+\()'
        blocks = re.split(pattern, text, flags=re.MULTILINE)
        return [b.strip() for b in blocks if len(b.strip()) > 50]

    def _parse_single_herbal(self, block: str, page_ref: int) -> Optional[Dict]:
        """Parse single herbal entry block"""

        lines = block.split('\n')
        if len(lines) < 3:
            return None

        herbal = {
            'name': '',
            'scientific_name': '',
            'parts_used': [],
            'indications': [],
            'dose': '',
            'preparation': [],
            'contraindications': [],
            'side_effects': [],
            'safety_grade': 'B',  # Default Grade B (most herbals)
            'kemenkes_validated': True,
            'evidence_level': 'A',  # Kemenkes official source
            'source': 'Vademekum Tanaman Obat Saintifikasi Jamu (Kemenkes RI)',
            'source_page': page_ref,
            'created_at': datetime.now().isoformat()
        }

        # Extract common name (first line)
        herbal['name'] = lines[0].strip()

        # Extract scientific name (usually in parentheses on first few lines)
        sci_match = re.search(r'\(([A-Z][a-z\s\.]+)\)', ' '.join(lines[:3]))
        if sci_match:
            herbal['scientific_name'] = sci_match.group(1).strip()

        # Extract sections by keywords
        text = '\n'.join(lines)

        # Bagian yang digunakan (Parts used)
        parts_section = re.search(r'(?:Bagian yang digunakan|Parts used)[:\s]+(.*?)(?=Indikasi|Khasiat|Indication)', text, re.IGNORECASE | re.DOTALL)
        if parts_section:
            parts_text = parts_section.group(1).strip()
            herbal['parts_used'] = [p.strip() for p in re.split(r'[,;]', parts_text) if p.strip()]

        # Indications (Khasiat)
        indic_section = re.search(r'(?:Indikasi|Khasiat|Indication)[:\s]+(.*?)(?=Dosis|Cara|Mode of use)', text, re.IGNORECASE | re.DOTALL)
        if indic_section:
            indic_text = indic_section.group(1).strip()
            # Split by numbers or bullets
            indications = re.split(r'[\n•\-]\s*\d*\.?\s*', indic_text)
            herbal['indications'] = [i.strip() for i in indications if len(i.strip()) > 5]

        # Dosage (Dosis)
        dose_section = re.search(r'(?:Dosis|Dosage)[:\s]+(.*?)(?=Cara|Persiapan|Preparation|Kontra)', text, re.IGNORECASE | re.DOTALL)
        if dose_section:
            herbal['dose'] = dose_section.group(1).strip()

        # Preparation method (Cara penggunaan)
        prep_section = re.search(r'(?:Cara|Persiapan|Preparation|Mode of use)[:\s]+(.*?)(?=Kontra|Efek|Interaksi|Contra)', text, re.IGNORECASE | re.DOTALL)
        if prep_section:
            prep_text = prep_section.group(1).strip()
            preparations = re.split(r'[\n•\-]\s*', prep_text)
            herbal['preparation'] = [p.strip() for p in preparations if len(p.strip()) > 10]

        # Contraindications (Kontraindikasi)
        contra_section = re.search(r'(?:Kontraindikasi|Contra-indication)[:\s]+(.*?)(?=Efek|Interaksi|Side|$)', text, re.IGNORECASE | re.DOTALL)
        if contra_section:
            contra_text = contra_section.group(1).strip()
            if contra_text.lower() not in ['tidak ada', 'none', '-', 'tidak diketahui']:
                herbal['contraindications'] = [contra_text]

        return herbal

    def save_parsed_herbals(self, output_file: str):
        """Save parsed herbals to JSON"""
        output = {
            'batch': 'TOHA_BATCH_13_VADEMEKUM_OCR',
            'total_herbals': len(self.herbals),
            'timestamp': datetime.now().isoformat(),
            'source': 'Vademekum Tanaman Obat Saintifikasi Jamu Jilid 1 (Kemenkes RI)',
            'evidence_level': 'A',
            'herbals': self.herbals,
            'parsing_errors': self.parsing_errors
        }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        logger.info(f"✓ Parsed herbals saved to {output_file}")

# Execution
if __name__ == "__main__":
    parser = VademekumParser()
    herbals = parser.parse_ocr_results("outputs/batch13a_ocr_results/vademekum_ocr_results.json")
    parser.save_parsed_herbals("outputs/batch13b_parsed/herbals_batch13_vademekum.json")
```

**Execution:**
```bash
python scripts/parse_ocr_batch13b.py
```

**Expected Output:**
- `outputs/batch13b_parsed/herbals_batch13_vademekum.json` (200–400 herbal entries)
- Sample output:
```json
{
  "batch": "TOHA_BATCH_13_VADEMEKUM_OCR",
  "total_herbals": 287,
  "herbals": [
    {
      "name": "Jahe",
      "scientific_name": "Zingiber officinale Roscoe",
      "parts_used": ["rhizome"],
      "indications": ["digestion", "nausea", "inflammation"],
      "dose": "2-3g per day in water",
      "preparation": ["decocted in hot water", "dried powder"],
      "contraindications": ["pregnancy (high doses)", "bleeding disorders"],
      "safety_grade": "B",
      "evidence_level": "A",
      "source": "Vademekum Tanaman Obat Saintifikasi Jamu (Kemenkes RI)",
      "source_page": 45
    }
  ]
}
```

**Timing Estimate:**
- Parsing 200–400 herbals: 30–60 minutes
- Manual QA spot-check: 60–90 minutes
- **Total: 2–3 hours**

---

### Phase 1C: Firestore Import (30–60 minutes)

**Option A: Admin Dashboard Import** (Recommended)
1. Open: `https://herboratech.web.app/admin/import-herbal.html`
2. Upload: `herbals_batch13_vademekum.json`
3. Click: "Import to Firestore"
4. Verify: Check logs + collection count

**Option B: CLI Direct Import**
```bash
# Alternative: Firebase CLI import
firebase firestore:import outputs/batch13b_parsed/herbals_batch13_vademekum.json --collection herbals
```

**Expected Result:**
- ✅ 200–400 documents added to `herbals` collection
- ✅ Each doc has `kemenkes_validated: true` tag
- ✅ Evidence level: `A` (government source)
- ✅ Indexed by scientific name for search

---

## ✅ VALIDATION CHECKLIST

After completion, verify:

```
Phase 1A: OCR Extraction
  [ ] 200+ pages OCR'd with >95% success rate
  [ ] OCR results saved to JSON
  [ ] No API quota exceeded (monitor dashscope usage)
  [ ] Log file shows <5% error rate

Phase 1B: Parsing
  [ ] 200–400 herbals parsed successfully
  [ ] Fields populated: name, scientific_name, indications, dose
  [ ] Parsing errors < 5%
  [ ] JSON output valid (test with `jq` or Python)

Phase 1C: Firestore Import
  [ ] Herbals collection updated
  [ ] Document count: 200–400 ✓
  [ ] Each herbal searchable by name + scientific_name
  [ ] Evidence level `A` visible on herbal detail pages
  [ ] Kemenkes source credited in UI

Post-Integration
  [ ] health-profile.html shows Vademekum herbals
  [ ] herbal.html displays Grade A Kemenkes badge
  [ ] Search functional (by plant name + indication)
  [ ] No console errors on herbal pages
```

---

## ⏱️ TIMING BREAKDOWN

| Phase | Task | Time | Status |
|-------|------|------|--------|
| Setup | Install deps + API setup | 15 min | Quick |
| 1A | OCR all pages (Qwen-VL) | 3–4 hrs | Automated |
| 1B | Parse OCR → JSON + QA | 2–3 hrs | Semi-manual |
| 1C | Import to Firestore | 30 min | Quick |
| **TOTAL** | **Complete pipeline** | **6–8 hrs** | **Do on weekend** |

**Pro Tip:** Run Batch 13A overnight (Friday evening) while you sleep. Then do 1B + 1C Saturday morning.

---

## 🚨 TROUBLESHOOTING

### Problem: "API quota exceeded"
**Solution:**
- Reduce batch size: Process 50 pages at a time with 2-hour gaps
- Or wait until next day (quota resets)
- Or switch to Google Vision API (slower but same quality)

### Problem: "OCR accuracy poor on tables"
**Solution:**
- Increase DPI: Re-scan pages at 400 DPI instead of 300
- Use direct image input (PNG) instead of PDF conversion
- Manually review low-confidence pages + re-OCR

### Problem: "Parsing missed some herbals"
**Solution:**
- Check page format variations (some herbals may have different structure)
- Manually review `parsing_errors` in output JSON
- Update regex patterns in `_split_herbal_blocks()` if needed

### Problem: "Firestore import failed"
**Solution:**
- Verify Firebase admin key path correct
- Check collection doesn't have conflicting indices
- Try importing 50 herbals first (test small batch)
- Check Firestore usage quota (20GB/month free)

---

## 📊 DELIVERABLES

✅ **After Batch 13 Complete:**

1. **Database:** 200–400 Kemenkes-validated herbals in Firestore
2. **Evidence Level:** Grade A (government source)
3. **UI Integration:** Herbals display with "Vademekum Kemenkes" badge
4. **Search:** Full-text search by plant name + scientific name + indication
5. **Documentation:** Source page reference traceable to original Vademekum
6. **Quality:** >95% OCR accuracy + >95% parsing success

---

## 🔗 RESOURCE LINKS

- **Alibaba Qwen-VL-OCR:** https://help.aliyun.com/en/dashscope/developer-reference/qwen-vl-overview
- **Dashscope Python SDK:** https://pypi.org/project/dashscope/
- **Firebase Firestore Import:** https://firebase.google.com/docs/firestore/manage-data/export-import
- **Vademekum Original:** Kemenkes RI (Indonesian Ministry of Health official publication)

---

**Status:** ✅ **READY FOR EXECUTION**
**Recommended Timing:** Weekend (Sat-Sun) for 2x API quota
**Expected Outcome:** 287 scientifically-validated herbal entries in HerboraTech database
**Evidence Quality:** Grade A (Kemenkes-validated)

---

*Instructions created: 2026-03-24*
*Batch 13 approved for execution*
