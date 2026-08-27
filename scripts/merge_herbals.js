/**
 * merge_herbals.js — HerboraTech Herbal Database Merge Script
 *
 * Menggabungkan dua sumber data herbal:
 *   INPUT 1: data/claude1/herbals_profiles.json  (Claude CLI #1 — riset fitofarmaka)
 *   INPUT 2: data/tcm_mkg/herboratech_enriched.json (Claude Desktop — TCM-MKG enrichment)
 *   OUTPUT:  data/final/herbals_merged.json        (siap di-seed ke Firestore herbals)
 *
 * Cara pakai:
 *   node scripts/merge_herbals.js
 *
 * Pastikan data/claude1/DONE.flag dan data/tcm_mkg/herboratech_enriched.json sudah ada.
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.join(__dirname, '..');
const PROFILES  = path.join(ROOT, 'data', 'claude1', 'herbals_profiles.json');
const ENRICHED  = path.join(ROOT, 'data', 'tcm_mkg', 'herboratech_enriched.json');
const OUT_DIR   = path.join(ROOT, 'data', 'final');
const OUT_FILE  = path.join(OUT_DIR, 'herbals_merged.json');
const DONE_FLAG = path.join(ROOT, 'data', 'claude1', 'DONE.flag');

// Evidence level priority: A > B > C
const EV_RANK = { A: 3, B: 2, C: 1 };
function bestEvidence(a, b) {
  return (EV_RANK[a] || 0) >= (EV_RANK[b] || 0) ? a : b;
}

// ── Load files ────────────────────────────────────────────────────────────────
function load(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File tidak ditemukan: ${filePath} (${label})`);
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  console.log(`✓ Loaded ${label}: ${filePath}`);
  return data;
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  HerboraTech — Herbal Database Merge');
  console.log('═══════════════════════════════════════\n');

  // Check DONE flag
  if (!fs.existsSync(DONE_FLAG)) {
    console.warn('⚠  data/claude1/DONE.flag belum ada — Claude CLI #1 mungkin belum selesai.');
    console.warn('   Lanjutkan? (script akan tetap berjalan dengan data yang ada)\n');
  }

  // Load sumber data
  const profilesData = load(PROFILES, 'herbals_profiles');
  if (!profilesData) {
    console.error('Abort: herbals_profiles.json diperlukan.');
    process.exit(1);
  }

  const enrichedData = load(ENRICHED, 'herboratech_enriched');
  if (!enrichedData) {
    console.warn('⚠  TCM enrichment tidak tersedia — output akan tanpa data TCM.');
  }

  // Extract arrays
  const profiles = Array.isArray(profilesData)
    ? profilesData
    : (profilesData.herbals || profilesData.herbs || []);

  const tcmHerbs = enrichedData
    ? (enrichedData.herbs || enrichedData || [])
    : [];

  console.log(`\n📊 Profiles: ${profiles.length} herbs`);
  console.log(`📊 TCM enrichment: ${tcmHerbs.length} herbs`);

  // Build lookup maps for TCM data (by id and latinName)
  const tcmById    = new Map();
  const tcmByLatin = new Map();
  for (const t of tcmHerbs) {
    if (t.id)       tcmById.set(t.id.toLowerCase(), t);
    if (t.latinName) tcmByLatin.set(t.latinName.toLowerCase(), t);
  }

  // ── Merge ──
  let enriched = 0;
  const merged = profiles.map(herb => {
    // Normalize id
    const herbId    = (herb.id || '').toLowerCase();
    const latinLow  = (herb.latinName || '').toLowerCase();

    // Look up TCM match
    const tcm = tcmById.get(herbId) || tcmByLatin.get(latinLow) || null;

    const result = { ...herb };

    if (tcm) {
      enriched++;
      // Add TCM fields (hanya jika belum ada atau kosong)
      if (!result.tcmIds      || !result.tcmIds.length)       result.tcmIds       = tcm.tcmIds      || [];
      if (!result.tcmNames    || !result.tcmNames.length)     result.tcmNames     = tcm.tcmNames    || [];
      if (!result.tcmProperties)                              result.tcmProperties = tcm.tcmProperties;

      // Update evidenceLevel ke yang terbaik
      result.evidenceLevel = bestEvidence(result.evidenceLevel || 'C', tcm.evidenceLevel || 'C');

      // Tambah sumber TCM ke references jika belum ada
      const tcmRef = { source: tcm.tcmSource, license: tcm.license };
      if (!result.references) result.references = [];
      const alreadyHasTCM = result.references.some(r => r.source && r.source.includes('TCM-MKG'));
      if (!alreadyHasTCM) result.references.push(tcmRef);
    }

    return result;
  });

  console.log(`\n✅ Enriched: ${enriched}/${profiles.length} herbs dengan data TCM`);
  console.log(`⚠  Tidak di-match: ${profiles.length - enriched} herbs (tidak ada di TCM-MKG)`);

  // ── Output ──
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const output = {
    metadata: {
      generatedAt: new Date().toISOString().split('T')[0],
      generatedBy: 'scripts/merge_herbals.js',
      totalHerbs: merged.length,
      tcmEnriched: enriched,
      sources: [
        'Claude CLI #1 — herbals_profiles.json (fitofarmaka + BPOM + WHO Monographs)',
        'Claude Desktop — TCM-MKG v1.0 (DOI: 10.5281/zenodo.13763953)',
      ],
    },
    herbals: merged,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n💾 Output: ${OUT_FILE}`);
  console.log(`   ${merged.length} herbs siap di-seed ke Firestore collection "herbals"`);
  console.log('\nLangkah berikutnya:');
  console.log('  Buka admin/import-herbal.html → pilih collection "herbals"');
  console.log('  Upload data/final/herbals_merged.json → klik Import\n');
}

main();
