#!/usr/bin/env python3
"""
parse_recipes_final.py — Parser final berbasis streaming condition tracking
Strategi: scan teks dari atas ke bawah, track kondisi aktif, setiap 'Bahan' = resep baru
"""
import re, json, os
from datetime import date

IN_TEXT   = "/sessions/friendly-intelligent-hamilton/all_pages_split.txt"
OUT_JSON  = "/sessions/friendly-intelligent-hamilton/mnt/HERBORATECH/data/herbal-formulas-raw.json"
OUT_HERBS = "/sessions/friendly-intelligent-hamilton/mnt/HERBORATECH/data/herbals-raw.json"

# ─── DAFTAR KONDISI RESMI (dari daftar isi buku) ──────────────────────────────
KNOWN_CONDITIONS = [
    "Amandel",
    "Asam Urat",
    "Badan Lelah",
    "Batu Empedu",
    "Buang Air Besar Berdarah",
    "Batu Kandung Kencing",
    "Batuk Berdahak","Batuk Berdarah","Batuk Kering","Batuk Rejan","Batuk",
    "Bau Badan","Bau Mulut",
    "Bengkak pada Persendian","Bengkak karena Keseleo","Bengkak",
    "Bercak Hitam di Muka","Berkeringat Malam","Beri-beri","Biduran",
    "Bisul di Kelopak Mata","Bisul di Payudara","Bisul",
    "Borok Berair","Borok Bernanah","Borok",
    "Bronkitis Kronis","Bronkitis","Bronkhitis",
    "Cacar Ular","Cacingan","Campak","Cantengan",
    "Darah Haid Berlebih","Darah Tinggi",
    "Demam Nifas","Demam pada Anak","Demam",
    "Diabetes Mellitus","Diabetes",
    "Diare Kronis","Diare",
    "Digigit Anjing Gila","Digigit Binatang Berbisa",
    "Disentri Akut","Disentri Basiler","Disentri Disertai Panas","Disentri",
    "Disfungsi Ereksi","Impoten",
    "Eksim pada Bayi","Eksim pada Kantung Buah Zakar","Eksim",
    "Epilepsi",
    "Gagal Ginjal",
    "Gangguan Pencernaan pada Anak","Gangguan Pencernaan",
    "Gatal-gatal","Gatal",
    "Gelisah","Tidak Tenang",
    "Gondongan",
    "Gusi Bengkak","Gusi Berdarah",
    "Haid Terlambat","Haid Tidak Lancar",
    "Hepatitis",
    "Hidung Berlendir",
    "Hipertensi",
    "Infeksi Ginjal","Infeksi Saluran Cerna","Infeksi Saluran Kemih","Influenza",
    "Jerawat",
    "Kaki Bengkak",
    "Kanker Darah","Kanker Esofagus","Kanker Hati","Kanker Kolon","Kanker Kulit",
    "Kanker Lambung","Kanker Nasofaring","Kanker Paru","Kanker Payudara",
    "Kanker Serviks","Kanker",
    "Kejang pada Anak","Kejang Perut","Kejang",
    "Kencing Batu","Kencing Berdarah","Kencing Berlemak","Kencing Kurang Lancar",
    "Keputihan","Keracunan Ikan","Keracunan Makanan","Keracunan Singkong",
    "Keseleo","Ketombe",
    "Kolesterol Tinggi","Kolesterol",
    "Koreng di Kepala","Koreng",
    "Kudis","Kulit Bersisik","Kulit Kasar","Kulit Tebal",
    "Kurang Darah","Kurap","Kusta","Kutil","Kutu di Kepala",
    "Leukemia",
    "Lemah Jantung","Lemah Saraf","Lemah Syahwat",
    "Lendir di Tenggorokan","Lidah Putih pada Bayi","Limpa Bengkak",
    "Ludah Berdarah","Luka Bakar","Luka Berdarah","Luka Tersiram Air Panas",
    "Maag","Malaria","Masuk Angin","Mata Gatal","Mata Merah",
    "Melancarkan ASI","Melangsingkan Tubuh",
    "Memar","Mematangkan Bisul","Membersihkan Rahim",
    "Memulihkan Tenaga","Memperbanyak ASI",
    "Mengecilkan Perut","Menghentikan Kebiasaan Merokok","Menghentikan Perdarahan",
    "Menghitamkan Rambut","Menguatkan Lambung",
    "Meningkatkan Kesuburan","Meningkatkan Nafsu Makan","Meningkatkan Stamina",
    "Menjernihkan Suara","Mimisan",
    "Mual pada Saat Kehamilan","Muntah Darah",
    "Nyeri Haid","Nyeri Lambung","Nyeri Pinggul","Nyeri Saat Kencing","Nyeri Sendi","Nyeri Ulu Hati",
    "Osteoporosis",
    "Panas Dalam","Payudara Bengkak","Pegal Linu","Pelega Perut","Pencuci Rambut",
    "Pendengaran Berkurang",
    "Perdarahan di Otak","Perdarahan di Rahim","Perdarahan pada Masa Kehamilan",
    "Penyubur Rambut",
    "Perut Busung","Perut Kembung pada Anak","Perut Kembung",
    "Pneumonia","Psoriasis",
    "Rabun Senja",
    "Radang Buah Zakar","Radang Ginjal Akut","Radang Ginjal",
    "Radang Gusi","Radang Hati","Radang Kantung Empedu","Radang Kelenjar Prostat",
    "Radang Kornea","Radang Kulit","Radang Lambung",
    "Radang Mulut","Radang Otak","Radang Paru","Radang Payudara",
    "Radang Saluran Kencing","Radang Saluran Napas","Radang Selaput Lendir Hidung",
    "Radang Sendi Akut","Radang Sendi","Radang Tenggorokan","Radang Usus",
    "Rematik","Rubela",
    "Sakit Di Dalam Mulut","Sakit Gigi","Sakit Kepala","Sakit Kuning",
    "Sakit Perut","Sakit Pinggang","Sakit Telinga",
    "Sariawan","Sembelit","Sering Kencing","Sesak Napas","Asma","Sinusitis",
    "Stroke","Sulit Melahirkan","Sulit Tidur",
    "TB Kelenjar","TBC","Tifoid","Tifus","Tonsilitis","Tulang Patah",
    "Tumor Paru","Tumor Payudara","Tumor Rahim","Tumor",
    "Wasir Berdarah","Wasir",
]

# Sort by length descending agar "Batuk Berdahak" matched before "Batuk"
KNOWN_CONDITIONS_SORTED = sorted(KNOWN_CONDITIONS, key=len, reverse=True)

# ─── KATEGORI ─────────────────────────────────────────────────────────────────
CATEGORY_MAP = [
    ("asam urat", "metabolisme"), ("kolesterol", "metabolisme"), ("diabetes", "metabolisme"),
    ("kencing manis", "metabolisme"), ("obesitas", "metabolisme"), ("gula darah", "metabolisme"),
    ("trigliserida", "metabolisme"), ("melangsingkan", "metabolisme"),
    ("maag", "pencernaan"), ("gastritis", "pencernaan"), ("disentri", "pencernaan"),
    ("batu empedu", "pencernaan"), ("sembelit", "pencernaan"), ("diare", "pencernaan"),
    ("perut kembung", "pencernaan"), ("buang air", "pencernaan"), ("hepatitis", "pencernaan"),
    ("limpa", "pencernaan"), ("mual", "pencernaan"), ("muntah", "pencernaan"),
    ("usus", "pencernaan"), ("wasir", "pencernaan"), ("ambeien", "pencernaan"),
    ("gangguan pencernaan", "pencernaan"), ("lambung", "pencernaan"), ("liver", "pencernaan"),
    ("sakit kuning", "pencernaan"), ("radang usus", "pencernaan"), ("radang hati", "pencernaan"),
    ("masuk angin", "pencernaan"), ("pelega perut", "pencernaan"), ("perut", "pencernaan"),
    ("batuk", "imunitas"), ("amandel", "imunitas"), ("flu", "imunitas"), ("influenza", "imunitas"),
    ("demam", "imunitas"), ("pilek", "imunitas"), ("malaria", "imunitas"),
    ("tbc", "imunitas"), ("tb kelenjar", "imunitas"), ("tifoid", "imunitas"), ("tifus", "imunitas"),
    ("pneumonia", "imunitas"), ("bronkitis", "imunitas"), ("infeksi", "imunitas"),
    ("campak", "imunitas"), ("cacar", "imunitas"), ("cacingan", "imunitas"),
    ("tonsilitis", "imunitas"), ("hidung berlendir", "imunitas"), ("rinorea", "imunitas"),
    ("sesak napas", "imunitas"), ("asma", "imunitas"), ("radang saluran napas", "imunitas"),
    ("radang paru", "imunitas"), ("radang tenggorokan", "imunitas"),
    ("radang ginjal", "antiinflamasi"), ("radang sendi", "antiinflamasi"),
    ("radang", "antiinflamasi"), ("eksim", "antiinflamasi"), ("psoriasis", "antiinflamasi"),
    ("kudis", "antiinflamasi"), ("gout", "antiinflamasi"), ("bengkak", "antiinflamasi"),
    ("beri-beri", "antiinflamasi"), ("rematik", "antiinflamasi"), ("artritis", "antiinflamasi"),
    ("pegal linu", "antiinflamasi"), ("nyeri sendi", "antiinflamasi"),
    ("badan lelah", "relaksasi"), ("lelah", "relaksasi"), ("stres", "relaksasi"),
    ("sulit tidur", "relaksasi"), ("lemah saraf", "relaksasi"), ("gelisah", "relaksasi"),
    ("epilepsi", "relaksasi"), ("migrain", "relaksasi"), ("sakit kepala", "relaksasi"),
    ("kejang", "relaksasi"), ("tidak tenang", "relaksasi"),
    ("jantung", "kardiovaskular"), ("hipertensi", "kardiovaskular"), ("darah tinggi", "kardiovaskular"),
    ("stroke", "kardiovaskular"), ("perdarahan di otak", "kardiovaskular"),
    ("kurang darah", "kardiovaskular"), ("anemia", "kardiovaskular"),
    ("darah haid", "reproduksi"), ("haid", "reproduksi"), ("menstruasi", "reproduksi"),
    ("kehamilan", "reproduksi"), ("keputihan", "reproduksi"), ("rahim", "reproduksi"),
    ("impoten", "reproduksi"), ("disfungsi ereksi", "reproduksi"), ("lemah syahwat", "reproduksi"),
    ("melancarkan asi", "reproduksi"), ("memperbanyak asi", "reproduksi"),
    ("sulit melahirkan", "reproduksi"), ("membersihkan rahim", "reproduksi"),
    ("memulihkan tenaga setelah melahirkan", "reproduksi"), ("mual pada saat kehamilan", "reproduksi"),
    ("gagal ginjal", "urologi"), ("kencing batu", "urologi"), ("kencing berdarah", "urologi"),
    ("kencing berlemak", "urologi"), ("kencing kurang lancar", "urologi"),
    ("sering kencing", "urologi"), ("kandung kemih", "urologi"), ("prostat", "urologi"),
    ("infeksi ginjal", "urologi"), ("infeksi saluran kemih", "urologi"),
    ("kanker", "onkologi"), ("tumor", "onkologi"), ("leukemia", "onkologi"),
    ("kulit", "dermatologi"), ("bau badan", "dermatologi"), ("bau mulut", "dermatologi"),
    ("koreng", "dermatologi"), ("kurap", "dermatologi"), ("kutil", "dermatologi"),
    ("jerawat", "dermatologi"), ("luka bakar", "dermatologi"), ("luka berdarah", "dermatologi"),
    ("bisul", "dermatologi"), ("kutu", "dermatologi"), ("bercak", "dermatologi"),
    ("borok", "dermatologi"), ("cantengan", "dermatologi"), ("kudis", "dermatologi"),
    ("ketombe", "dermatologi"), ("rambut", "dermatologi"),
    ("mata", "mata-telinga"), ("telinga", "mata-telinga"),
    ("pendengaran berkurang", "mata-telinga"), ("rabun", "mata-telinga"),
    ("gigi", "mulut"), ("sariawan", "mulut"), ("gusi", "mulut"),
    ("gondongan", "mulut"), ("sakit di dalam mulut", "mulut"),
    ("osteoporosis", "tulang"), ("tulang patah", "tulang"),
    ("meningkatkan stamina", "kebugaran"), ("meningkatkan nafsu makan", "kebugaran"),
    ("meningkatkan kesuburan", "kebugaran"), ("menguatkan lambung", "kebugaran"),
    ("mengecilkan perut", "kebugaran"), ("menghitamkan rambut", "kebugaran"),
    ("penyubur rambut", "kebugaran"), ("pencuci rambut", "kebugaran"),
    ("menjernihkan suara", "kebugaran"),
    ("mimisan", "lainnya"), ("biduran", "antiinflamasi"),
    ("keracunan", "lainnya"), ("digigit", "lainnya"), ("rubela", "imunitas"),
]

def get_category(condition: str) -> str:
    c = condition.lower()
    for kw, cat in CATEGORY_MAP:
        if kw in c:
            return cat
    return "lainnya"

def get_prep_type(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["balur", "oles", "tempel", "kompres", "gosok", "dibalut", "pemakaian luar", "obat tetes", "obat kumur"]):
        return "topikal"
    if any(w in t for w in ["mandi", "rendam", "berendam", "uap"]):
        return "mandi"
    if any(w in t for w in ["seduh", "diseduh"]):
        return "seduh"
    if any(w in t for w in ["giling", "tumbuk", "dihaluskan", "peras", "diperas", "ditumbuk"]):
        return "giling/tumbuk"
    if any(w in t for w in ["rebus", "direbus", "merebus", "air rebusan"]):
        return "rebus"
    return "rebus"

def slugify(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r'[^\w\s-]', '', t)
    t = re.sub(r'[\s_]+', '-', t)
    return t[:60].strip('-')

def parse_frequency(aturan: str) -> str:
    t = aturan.lower()
    if "3 kali" in t: return "3x sehari"
    if "2 kali" in t: return "2x sehari"
    if "sekali" in t or "sekaligus" in t: return "1x sehari"
    if "pagi" in t and "sore" in t: return "2x sehari (pagi & sore)"
    if "pagi" in t and "malam" in t: return "2x sehari (pagi & malam)"
    return "sesuai anjuran"

def extract_ingredients(bahan_text: str) -> list:
    ingredients = []
    lines = [l.strip() for l in bahan_text.split('\n') if l.strip()]
    for line in lines:
        line = re.sub(r'^[•\+\-\*\#\|]\s*', '', line).strip()
        if not line or len(line) < 3:
            continue
        if re.match(r'^(Cuci|Rebus|Saring|Potong|Giling|Campur|Tambah|Angkat|Biar|Minum|Lakukan|Gunakan|Gongseng|Haluskan|Iris|Tumbuk|Peras|Bilas|Masuk)', line):
            continue
        bad_words = ['bahan', 'cara meramu', 'aturan pakai', 'catatan', 'carameramu']
        if any(bw in line.lower() for bw in bad_words):
            continue
        if re.search(r'\d{4,}', line):  # OCR noise (halaman, dsb)
            continue
        if len(line) > 120:  # Terlalu panjang, bukan bahan
            continue

        result = {"herb": line, "amount": None, "unit": None, "condition": None}

        m = re.search(r'\b(segar|kering|matang|mentah|muda|tua|basah|masak|halus)\b', line, re.I)
        if m:
            result["condition"] = m.group(1).lower()

        # Range
        m = re.search(r'(\d+[\.,]?\d*)\s*[-–]\s*(\d+[\.,]?\d*)\s*(g|gram|ml|liter|lembar|biji|buah|kuntum|genggam|sendok|sdt|sdm|gelas|tetes|butir|batang|helai|ruas|cm|cc|bonggol|siung|kuntum)\b', line, re.I)
        if m:
            result["amount"] = f"{m.group(1)}-{m.group(2)}"
            result["unit"] = m.group(3).lower()
        else:
            m = re.search(r'(\d+[\.,]?\d*)\s*(g|gram|ml|liter|lembar|biji|buah|kuntum|genggam|sendok|sdt|sdm|gelas|tetes|butir|batang|helai|ruas|cm|cc|bonggol|siung|kuntum)\b', line, re.I)
            if m:
                result["amount"] = m.group(1)
                result["unit"] = m.group(2).lower()
            else:
                m = re.search(r'(seukuran\s+\w+(?:\s+\w+)?|secukupnya|\d+/\d+\s*\w*|½\s*\w*|¼\s*\w*|¾\s*\w*)', line, re.I)
                if m:
                    result["amount"] = m.group(1).strip()
                    result["unit"] = "secukupnya"

        # Bersihkan nama herb
        herb_clean = re.sub(
            r',?\s*\d+[\.,]?\d*\s*[-–]?\s*\d*[\.,]?\d*\s*(g|gram|ml|liter|lembar|biji|buah|kuntum|genggam|sendok|sdt|sdm|gelas|tetes|butir|batang|helai|ruas|cm|cc|bonggol|siung|kuntum)\b\.?',
            '', line, flags=re.I
        )
        herb_clean = re.sub(r',?\s*(segar|kering|matang|mentah|muda|tua|basah|masak)\.?$', '', herb_clean, flags=re.I)
        herb_clean = re.sub(r',?\s*(seukuran\s+\w+(?:\s+\w+)?|secukupnya)\.?$', '', herb_clean, flags=re.I)
        herb_clean = re.sub(r'^\d+[\.,]?\d*\s*', '', herb_clean)
        herb_clean = re.sub(r'\s+', ' ', herb_clean).strip().rstrip(',.')
        if herb_clean and len(herb_clean) > 2:
            result["herb"] = herb_clean

        if result["herb"] and 2 < len(result["herb"]) <= 80:
            # Filter OCR artefak
            if not re.search(r'[{}\\<>\[\]|@#$%^&*]', result["herb"]):
                ingredients.append(result)

    return ingredients

# ─── NORMALIZE ────────────────────────────────────────────────────────────────
def normalize(text: str) -> str:
    # Fix kondisi OCR
    fixes = {
        'Asam rat\n': 'Asam Urat\n', 'Asam Chrat': 'Asam Urat', 'Asam Clrat': 'Asam Urat',
        'Asam Urat': 'Asam Urat', 'tsam Cbrat': 'Asam Urat', 'Isam Clrat': 'Asam Urat',
        'dsam Clrat': 'Asam Urat', 'diam Clrat': 'Asam Urat', 'sam Clrat': 'Asam Urat',
        'Imandel': 'Amandel', 'Imanda': 'Amandel',
        '1001 stp Herbal': '', '1001 Rises Herbal': '', '1001 Reset Herbal': '',
        '{ool': '1001', '\ool': '1001', 'Yor!': '1001', '\ol': '1001', 'Vos': '05',
        '—': '-', '–': '-', '\u2022': ' ',
        '1/2': '½', '3/4': '¾', '1/4': '¼',
    }
    for old, new in fixes.items():
        text = text.replace(old, new)
    text = re.sub(r'<<<PAGE:\d+[LR]?>>>', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text

# ─── PARSER STREAMING ─────────────────────────────────────────────────────────
def find_condition_in_text(chunk: str) -> str | None:
    """Cari kondisi yang diketahui dalam potongan teks."""
    for cond in KNOWN_CONDITIONS_SORTED:
        # Cari kondisi dengan atau tanpa dekoratif OCR di sekitarnya
        pattern = re.compile(re.escape(cond), re.IGNORECASE)
        if pattern.search(chunk):
            return cond
    return None

def parse_all(raw_text: str) -> list:
    text = normalize(raw_text)

    # Split pada "Bahan" sebagai anchor
    # Gunakan re.split agar posisi marker bisa diketahui
    parts = re.split(r'(\nBahan\s*\n)', text)
    # parts = [pre0, '\nBahan\n', body1, '\nBahan\n', body2, ...]

    if len(parts) < 3:
        print("  PERINGATAN: Sangat sedikit blok Bahan ditemukan!")
        return []

    print(f"  Total blok Bahan: {(len(parts)-1)//2}")

    recipes = []
    seen_sigs = set()
    current_condition = None
    recipe_counter = 0

    for i in range(0, len(parts) - 2, 2):
        pre_segment  = parts[i]        # teks sebelum 'Bahan'
        # parts[i+1] = '\nBahan\n' (divider)
        body_segment = parts[i + 2] if i + 2 < len(parts) else ""  # teks setelah 'Bahan'

        # ─── Deteksi perubahan kondisi di pre_segment ───
        # Cari kondisi dalam 600 char terakhir pre_segment
        search_ctx = pre_segment[-600:]
        found = find_condition_in_text(search_ctx)
        if found:
            current_condition = found

        if not current_condition:
            # Juga cari di awal body (kadang kondisi muncul setelah 'Bahan')
            found2 = find_condition_in_text(body_segment[:200])
            if found2:
                current_condition = found2

        if not current_condition:
            continue

        # ─── Parse bagian resep ───
        def section(pat, blk):
            m = re.search(pat, blk, re.DOTALL | re.IGNORECASE)
            return m.group(1).strip() if m else ""

        # Bahan = dari awal body sampai "Cara Meramu" atau "Aturan Pakai"
        bahan_raw  = section(r'^(.+?)(?=Cara Meramu Resep|Aturan Pakai|Catatan|$)', body_segment)
        cara_raw   = section(r'Cara Meramu Resep\s*\n(.+?)(?=Aturan Pakai|Catatan|$)', body_segment)
        aturan_raw = section(r'Aturan Pakai\s*\n(.+?)(?=Catatan|$)', body_segment)
        catatan_raw= section(r'Catatan\s*\n(.+?)(?=\n\n|$)', body_segment)

        def clean_para(t: str) -> str:
            t = re.sub(r'^[•\+\-\*\#\|]\s*', '', t, flags=re.MULTILINE)
            t = re.sub(r'\n+', ' ', t).strip()
            return t

        cara_text    = clean_para(cara_raw)
        aturan_text  = clean_para(aturan_raw)
        catatan_text = clean_para(catatan_raw)
        all_text     = cara_text + " " + aturan_text

        # Validasi: harus ada bahan
        if not bahan_raw or len(bahan_raw.strip()) < 5:
            continue

        ingredients = extract_ingredients(bahan_raw)
        if not ingredients:
            continue

        # Cek duplikat berdasarkan kondisi + bahan utama
        sig = (current_condition.lower(), ingredients[0]["herb"].lower()[:30] if ingredients else "")
        if sig in seen_sigs:
            continue
        seen_sigs.add(sig)

        recipe_counter += 1

        prep_type  = get_prep_type(all_text + " " + catatan_text)
        category   = get_category(current_condition)
        topical    = prep_type in ("topikal", "mandi")
        frequency  = parse_frequency(aturan_text)

        warnings = []
        if catatan_text and len(catatan_text) > 5:
            warnings.append(catatan_text)

        cond_clean = current_condition.strip()
        indications = [slugify(cond_clean)]
        base = re.sub(r'\s*\(.*?\)', '', cond_clean).strip()
        if base != cond_clean and len(base) > 2:
            indications.insert(0, slugify(base))

        recipes.append({
            "recipeNumber": recipe_counter,
            "condition": cond_clean,
            "ingredients": ingredients,
            "preparationMethod": cara_text,
            "preparationType": prep_type,
            "dosage": aturan_text,
            "frequency": frequency,
            "warnings": warnings,
            "category": category,
            "isTopical": topical,
            "indications": list(dict.fromkeys(indications)),
        })

    return recipes

def extract_unique_herbs(recipes: list) -> list:
    herb_map = {}
    for r in recipes:
        for ing in r.get("ingredients", []):
            name = ing.get("herb", "").strip()
            if not name or len(name) < 3 or len(name) > 80:
                continue
            if re.search(r'[{}\\<>\[\]|@#$%]', name):
                continue
            key = name.lower()[:40]
            if key not in herb_map:
                herb_map[key] = {"name": name, "count": 0, "conditions": set(), "methods": set()}
            herb_map[key]["count"] += 1
            herb_map[key]["conditions"].add(r["condition"])
            herb_map[key]["methods"].add(r["preparationType"])
    herbs = []
    for d in herb_map.values():
        herbs.append({
            "name": d["name"],
            "usedInRecipesCount": d["count"],
            "conditions": sorted(d["conditions"])[:5],
            "usageMethods": sorted(d["methods"]),
            "evidenceLevel": "C",
            "source": "1001 Resep Herbal - dr. Setiawan Dalimartha",
        })
    return sorted(herbs, key=lambda h: -h["usedInRecipesCount"])

# ─── MAIN ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("PARSE FINAL: Streaming condition tracker")
    print("=" * 60)

    with open(IN_TEXT) as f:
        raw = f.read()
    print(f"Input: {len(raw):,} chars")

    recipes = parse_all(raw)
    print(f"\n✅ Total resep berhasil: {len(recipes)}")

    cats = {}
    preps = {}
    for r in recipes:
        cats[r["category"]]  = cats.get(r["category"], 0) + 1
        preps[r["preparationType"]] = preps.get(r["preparationType"], 0) + 1

    print("\nKategori:")
    for k, v in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {k:25s}: {v:4d}")
    print("\nTipe penyajian:")
    for k, v in sorted(preps.items(), key=lambda x: -x[1]):
        print(f"  {k:20s}: {v:4d}")

    herbs = extract_unique_herbs(recipes)
    print(f"\nTanaman unik: {len(herbs)}")
    print("Top 15 paling banyak dipakai:")
    for h in herbs[:15]:
        print(f"  {h['name']:35s}: {h['usedInRecipesCount']:3d} resep")

    # ─── Output ───
    output = {
        "metadata": {
            "source": "1001 Resep Herbal - Dr. Setiawan Dalimartha",
            "publisher": "Penebar Swadaya, Jakarta 2008",
            "totalRecipes": len(recipes),
            "totalConditions": len(set(r["condition"] for r in recipes)),
            "totalUniqueHerbs": len(herbs),
            "extractedAt": str(date.today()),
            "extractedBy": "Claude Desktop — Tesseract OCR 4.1.1, split-column, streaming parser",
            "pdfPages": 312,
            "note": "PDF scan gambar dua kolom. OCR menggunakan English engine (Latin alphabet). QC manual disarankan untuk 10-15% resep.",
        },
        "formulas": recipes
    }

    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    fsize = os.path.getsize(OUT_JSON)
    print(f"\n✅ {OUT_JSON}")
    print(f"   {fsize:,} bytes ({fsize/1024:.0f} KB)")

    herbs_out = {
        "metadata": {
            "source": "1001 Resep Herbal - Dr. Setiawan Dalimartha",
            "totalUniqueHerbs": len(herbs),
            "extractedAt": str(date.today()),
        },
        "herbs": herbs
    }
    os.makedirs(os.path.dirname(OUT_HERBS), exist_ok=True)
    with open(OUT_HERBS, "w", encoding="utf-8") as f:
        json.dump(herbs_out, f, ensure_ascii=False, indent=2)
    print(f"✅ {OUT_HERBS}")
    print(f"   {len(herbs)} tanaman unik")
