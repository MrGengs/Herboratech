# 📱 Firestore Schema — Vitalora Herbal Database

## Overview
Struktur Firestore untuk menyimpan herbal data yang dapat di-query oleh AI Consultation secara real-time.

---

## Collections Structure

```
firestore/
├── herbals/                          ← Main herbal collection
│   ├── curcumin/
│   │   ├── basic_info (document)
│   │   ├── clinical_uses (array)
│   │   ├── dosage (document)
│   │   ├── safety (document)
│   │   ├── drug_interactions (subcollection)
│   │   ├── herbal_interactions (subcollection)
│   │   ├── landmark_papers (subcollection)
│   │   └── quality_metadata (document)
│   ├── ginger/
│   ├── garlic/
│   └── ... [other herbals]
│
├── formulas/                          ← Traditional herbal formulas
│   ├── jamu_kunyit_asam/
│   │   ├── basic_info
│   │   ├── ingredients (array)
│   │   ├── preparation (document)
│   │   ├── indications (array)
│   │   ├── ingredient_sources (subcollection)
│   │   └── research_citations (subcollection)
│   ├── jamu_jahe_merah/
│   └── ... [other formulas]
│
└── citations/                         ← Centralized citation library
    ├── pmid_28147121/
    │   ├── title
    │   ├── authors
    │   ├── year
    │   ├── journal
    │   ├── pmid
    │   ├── doi
    │   ├── url (PubMed link)
    │   ├── abstract
    │   └── herbal_references (array of herbal IDs)
    └── ... [other citations]
```

---

## Detailed Schema per Document

### 1. `herbals/{herbalId}/basic_info`

```javascript
{
  id: "curcumin",                          // unique ID
  name_id: "Kunyit",
  name_en: "Turmeric",
  latin_name: "Curcuma longa L.",

  // Key compounds
  active_compounds: [
    {
      name: "Curcumin",
      percentage: "2-8%",
      mechanism: "Inhibits NF-κB pathway, anti-inflammatory"
    }
  ],

  // Grade & Evidence
  grade: "B",
  grade_justification: "12 RCTs, N>500 per study...",

  // Metadata
  created_at: timestamp,
  updated_at: timestamp,
  source_database: "Vitalora Herbal SLR",
  verified_by: "pharmacist_name",
  verification_date: timestamp
}
```

### 2. `herbals/{herbalId}/clinical_uses` (Array)

```javascript
[
  {
    id: "inflammatory",
    condition: "Inflammatory Conditions",
    effect: "15-25% biomarker reduction (TNF-α, IL-6)",
    evidence: "12 RCTs, meta-analysis, Cochrane review ready",
    recommendation: "Adjunctive therapy for chronic inflammation",
    supporting_citations: ["pmid_28147121", "pmid_26219618"]  // ref to citations collection
  },
  {
    id: "metabolic_syndrome",
    condition: "Metabolic Syndrome",
    effect: "Improves lipid profile, reduces central obesity",
    evidence: "8 RCTs, NAFLD improvement documented",
    recommendation: "Supplementary with lifestyle intervention",
    supporting_citations: ["pmid_31284934", "pmid_27989900"]
  }
]
```

### 3. `herbals/{herbalId}/dosage`

```javascript
{
  standard: "500-2000 mg/day (divided doses)",
  range: {
    min: "500 mg",
    max: "2000 mg"
  },
  frequency: "2-3 times daily with meals",
  duration: "Minimum 4-8 weeks for therapeutic effect",
  notes: "Take with black pepper (piperine) for 2000% absorption enhancement",

  preparation_methods: [
    {
      method: "Powder (dried rhizome)",
      dosage: "500-2000 mg/day",
      preparation: "Fresh or dried powder, can mix with water/milk"
    },
    {
      method: "Extract (concentrated)",
      dosage: "300-800 mg curcumin/day",
      preparation: "Standardized extract 95% curcumin with piperine"
    }
  ],

  quality_standard: "Standardized extract minimum 95% curcumin",
  testing_method: "HPLC for curcumin content verification",

  citation_source: "pmid_28147121"  // reference
}
```

### 4. `herbals/{herbalId}/safety`

```javascript
{
  grade: "Safe",

  adverse_effects_common: [
    "GI upset (mild)",
    "Diarrhea",
    "Nausea at high doses"
  ],

  adverse_effects_serious: "Rare at recommended doses",

  ld50_status: "Not established for humans, extremely low toxicity in animal studies",

  contraindications: [
    "Pregnancy (potential uterotonic effects)",
    "Lactation (limited data)",
    "Biliary obstruction (increases bile production)",
    "Severe bleeding disorders (anticoagulant properties)"
  ],

  pregnancy: {
    status: "CAUTION",
    recommendation: "CAUTION - theoretical uterotonic effects, avoid high doses"
  },

  lactation: {
    status: "LIMITED DATA",
    recommendation: "LIMITED DATA - likely safe at standard doses, use with caution"
  },

  citations: ["pmid_28175370", "pmid_26219618"]
}
```

### 5. `herbals/{herbalId}/drug_interactions` (Subcollection)

```javascript
// Document ID: "warfarin"
{
  substance_name: "Warfarin",
  substance_type: "drug",
  substance_class: "Anticoagulant",

  interaction_type: "Inhibition (CYP2C9, CYP3A4)",

  severity: "MODERATE",
  severity_score: 2,  // 0=SAFE, 1=MILD, 2=MODERATE, 3=HIGH, 4=CONTRAINDICATED

  mechanism: "Curcumin inhibits cytochrome P450 enzymes, increasing warfarin levels",

  recommendation: "Monitor INR closely, may need dose adjustment",

  clinical_evidence: {
    description: "Case reports and pharmacokinetic studies showing interaction",
    study_count: 5,
    primary_studies: ["pmid_28147121", "pmid_26219618"]
  },

  management_approach: [
    "Monitor INR weekly initially",
    "Coordinate with cardiologist",
    "May need dose adjustment of warfarin",
    "Separate intake if possible (spacing not proven effective)"
  ],

  citation_pmid: "pmid_28147121",
  verified_date: timestamp
}
```

### 6. `herbals/{herbalId}/herbal_interactions` (Subcollection)

```javascript
// Document ID: "ginger"
{
  herbal_name: "Ginger",
  herbal_id: "ginger",

  interaction_type: "Synergistic anti-inflammatory",

  severity: "SAFE",
  severity_score: 0,

  combined_effect: "Enhanced anti-inflammatory activity",

  recommendation: "RECOMMENDED - Combination formula common in traditional medicine",

  traditional_use: "Common in jamu Indonesia (e.g., jamu kunyit + jahe)",

  research_evidence: "Limited modern RCTs, but strong traditional use evidence",

  citations: ["pmid_27989900"]
}
```

### 7. `herbals/{herbalId}/landmark_papers` (Subcollection)

```javascript
// Document ID: "pmid_28147121"
{
  pmid: "28147121",
  doi: "10.1038/srep28325",

  title: "Association of Non-Alcoholic Fatty Liver Disease with Metabolic Syndrome",
  authors: "Hirsch A, Schaffstein J, Zaichuk T, et al.",
  year: 2016,
  journal: "Scientific Reports",

  sample_size: 2147,
  study_type: "Meta-analysis",

  url_pubmed: "https://www.ncbi.nlm.nih.gov/pubmed/28147121",
  url_doi: "https://doi.org/10.1038/srep28325",

  abstract: "This meta-analysis shows 40-50% NAFLD with metabolic syndrome...",

  key_findings: [
    "40-50% NAFLD dengan metabolic syndrome",
    "50-70% NAFLD dengan Type 2 DM",
    "Insulin resistance adalah core pathophysiology"
  ],

  relevant_to_herbal_uses: ["inflammatory", "metabolic_syndrome"],

  citation_count: 138,
  last_verified: timestamp
}
```

### 8. `formulas/{formulaId}/basic_info`

```javascript
{
  id: "jamu_kunyit_asam",
  name_id: "Jamu Kunyit Asam",
  name_en: "Turmeric Tamarind Formula",

  indications: [
    "Digestive health",
    "Anti-inflammatory",
    "Liver support"
  ],

  primary_ingredients: [
    "curcumin",  // ref to herbal ID
    "tamarind",
    "ginger"
  ],

  description: "Traditional Indonesian herbal formula combining...",

  preparation_type: "Boiled decoction",

  created_at: timestamp,
  source_tradition: "Indonesian traditional medicine",
  verified_by: "herbalist_name"
}
```

### 9. `formulas/{formulaId}/ingredients` (Array)

```javascript
[
  {
    ingredient_id: "curcumin",
    ingredient_name: "Kunyit (Turmeric)",
    amount: "10-20 grams",
    part_used: "Rhizome",
    preparation: "Dried and sliced",
    role_in_formula: "Main anti-inflammatory component",
    sourcing_citation: "pmid_28147121"
  },
  {
    ingredient_id: "tamarind",
    ingredient_name: "Asam Jawa (Tamarind)",
    amount: "5-10 grams",
    part_used: "Fruit pulp",
    preparation: "Dried",
    role_in_formula: "Digestive support, flavor",
    sourcing_citation: null  // not in main database
  }
]
```

### 10. `citations/{citationId}` (Centralized)

```javascript
{
  id: "pmid_28147121",
  pmid: "28147121",
  doi: "10.1038/srep28325",

  title: "Association of NAFLD with Metabolic Syndrome Independent of Central Obesity",
  authors: "Hirsch A, Schaffstein J, Zaichuk T, et al.",
  year: 2016,
  journal: "Scientific Reports",

  // URLs untuk akses
  url_pubmed: "https://www.ncbi.nlm.nih.gov/pubmed/28147121",
  url_doi: "https://doi.org/10.1038/srep28325",
  url_full_text: "https://www.nature.com/articles/srep28325",  // jika open access

  // Metadata
  study_type: "Meta-analysis",
  sample_size: 2147,
  countries: ["Multiple"],

  // Content
  abstract: "Full abstract text...",
  key_findings: ["Finding 1", "Finding 2"],

  // Relevant to
  referenced_in_herbals: ["curcumin", "ginger"],
  referenced_in_formulas: ["jamu_kunyit_asam"],
  referenced_in_claims: [
    "curcumin::metabolic_syndrome::effect",
    "ginger::dyslipidemia::evidence"
  ],

  // Verification
  citation_count: 138,
  indexed_date: timestamp,
  last_verified: timestamp,
  verified_by: "researcher_name",
  accessibility_status: "open_access"  // open_access / paywalled / preprint
}
```

---

## Setup Instructions

### Step 1: Create Collections in Firestore Console

```bash
# Using Firebase Console (manual):
1. Go to https://console.firebase.google.com/project/vitalora
2. Create collections:
   - herbals
   - formulas
   - citations
```

### Step 2: Initialize with JSON Data

```javascript
// Using Node.js script to import from herbal-knowledge-base.json
const admin = require('firebase-admin');
const serviceAccount = require('./vitalora-firebase-adminsdk-fbsvc-f5d5e39256.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Import herbals
const herbalsData = require('./herbal-knowledge-base.json');
herbalsData.herbals.forEach(async (herbal) => {
  await db.collection('herbals').doc(herbal.id).set({
    basic_info: { /* ... */ },
    clinical_uses: herbal.clinical_uses,
    dosage: herbal.dosage,
    safety: herbal.safety_profile,
    // ... etc
  });
});
```

### Step 3: Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Read-only for client (no authentication required)
    match /herbals/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    match /formulas/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    match /citations/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    // Admin-only for updates
    match /herbals/{herbalId}/drug_interactions/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

---

## Indexing Strategy

**For faster queries, create composite indexes:**

```
Collection: herbals
Fields:
  - grade (Ascending)
  - created_at (Descending)

Collection: citations
Fields:
  - year (Descending)
  - citation_count (Descending)
```

---

## Query Examples

### Query 1: Get herbal by name
```javascript
db.collection('herbals').doc('curcumin').get()
```

### Query 2: Get all interactions for herbal
```javascript
db.collection('herbals').doc('curcumin')
  .collection('drug_interactions').get()
```

### Query 3: Get citation details
```javascript
db.collection('citations').doc('pmid_28147121').get()
```

### Query 4: Find herbals by grade
```javascript
db.collection('herbals')
  .where('grade', '==', 'B')
  .orderBy('created_at', 'desc')
  .get()
```

---

## Migration Path

```
Phase 1: Create Firestore collections (manual or script)
Phase 2: Update herbal-consultant.js to query Firestore
Phase 3: Implement citation tracking in AI responses
Phase 4: Deploy to production
Phase 5: Regular maintenance & updates
```

---

## Performance Considerations

- **Read Optimization:** Client-side filtering where possible
- **Caching:** Implement service worker caching for offline access
- **Pagination:** Use cursor-based pagination for large result sets
- **Real-time:** Use `onSnapshot()` for reactive updates

---

## Data Update Workflow

```
New Research Found
    ↓
Add to citations collection
    ↓
Update relevant herbal interactions
    ↓
Trigger verification notification
    ↓
Pharmacist reviews (verification_date)
    ↓
Go live in Firestore
    ↓
AI Consultation automatically uses new data
```

---

**Last Updated:** 2026-03-28
**Schema Version:** 1.0
