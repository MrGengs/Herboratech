# 🌿 Herbal Knowledge Base Integration Guide

## Overview

Vitalora sekarang memiliki **comprehensive herbal knowledge base** untuk fitur "Info Obat & Interaksi" di AI Consultant. Database ini mencakup 50+ papers dengan GRADE quality assessment untuk 7 kategori herbal.

---

## 📁 Files Created

### 1. **herbal-knowledge-base.json**
- **Location:** `/VITALORA/herbal-knowledge-base.json`
- **Size:** ~150 KB
- **Content:**
  - 7 herbal categories (Curcumin, Green Tea, Garlic, Ginger, Cinnamon, Olive Leaf, Traditional Indonesian)
  - Detailed drug interactions (with severity ratings & recommendations)
  - Herbal-herbal interactions
  - Clinical evidence & landmark papers
  - Dosage, safety, pregnancy/lactation data
  - Quality assurance metadata

### 2. **herbal-consultant.js**
- **Location:** `/VITALORA/shared/herbal-consultant.js`
- **Purpose:** Main JavaScript module untuk querying knowledge base
- **Class:** `HerbalConsultant`
- **Methods:**
  - `initialize()` — Load knowledge base
  - `findHerbal(name)` — Flexible herbal search
  - `queryHerbal(name, condition)` — Get comprehensive info
  - `checkInteraction(herbal, substance, type)` — Check drug/herbal interactions
  - `respond(userQuery, context)` — Generate AI responses
  - `parseQueryIntent(query)` — NLP-like intent detection
  - `generateClinicalReport(herbal, patientContext)` — Clinical summary

---

## 🚀 Quick Start Integration

### Step 1: Link JavaScript Module
```html
<!-- In ai-consultation.html or info-obat.html -->
<script src="../shared/herbal-consultant.js"></script>
```

### Step 2: Initialize Consultant
```javascript
const herbConsultant = new HerbalConsultant();
await herbConsultant.initialize();
```

### Step 3: Handle User Query
```javascript
const userQuery = "Apakah aman minum kunyit dengan warfarin?";
const response = await herbConsultant.respond(userQuery);

// Display response in chat bubble
displayChatBubble(response.content, 'ai');
```

---

## 📝 Usage Examples

### Example 1: Information Request
**User:** "Apa manfaat kunyit?"
```javascript
const response = herbConsultant.queryHerbal('curcumin');
// Returns: clinical uses, dosage, safety profile
```

**Response Template:**
```
💊 Kunyit (Turmeric / Curcumin)
Nama Latin: Curcuma longa L.
📊 Tingkat Bukti: Grade B

**Manfaat Klinis:**
• Inflammatory Conditions
  Efek: 15-25% biomarker reduction
  Rekomendasi: Adjunctive therapy for chronic inflammation

• Metabolic Syndrome
  Efek: Improves lipid profile
  Rekomendasi: Supplementary with lifestyle intervention

**Dosis Standar:** 500-2000 mg/day
Frekuensi: 2-3 times daily with meals
Durasi: Minimum 4-8 weeks

**Keamanan:** Safe
...
```

---

### Example 2: Interaction Check
**User:** "Aman tidak kunyit dengan warfarin?"
```javascript
const interaction = herbConsultant.checkInteraction('curcumin', 'warfarin', 'drug');
// Returns: { hasInteraction: true, severity: 'MODERATE', recommendation: '...' }

const response = herbConsultant.respond(userQuery);
```

**Response:**
```
🔍 **Pengecekan Interaksi**

Kunyit + Warfarin

⛔ **SEDANG - Perlu monitoring ketat**

**Jenis Interaksi:** Inhibition (CYP2C9, CYP3A4)
**Rekomendasi:** Monitor INR closely, may need dose adjustment
**Referensi:** PMID 28147121

⚠️ Konsultasikan dengan dokter sebelum menggunakan kombinasi ini.
```

---

### Example 3: Dosage Query
**User:** "Berapa dosis ginger yang aman?"
```javascript
const response = herbConsultant.respond("Berapa dosis ginger?");
```

**Response:**
```
💊 **Dosis Jahe**

**Dosis Standar:** 1-3 g/day dried ginger powder, or fresh equivalent
**Range:** 1 g - 4 g
**Frekuensi:** Divided doses with meals
**Durasi Penggunaan:** Acute: 2-3 days; Chronic: 4-8 weeks for metabolic effects

**Catatan Penting:** Fresh ginger has more gingerol; dry has higher shogaol concentration

**Cara Penyimpanan:** Fresh: 1-2 weeks (cool place), Dried: 12+ months
```

---

### Example 4: Safety Concern
**User:** "Efek samping kunyit apa saja?"
```javascript
const response = herbConsultant.respond("Efek samping kunyit?");
```

**Response:**
```
🛡️ **Keamanan Kunyit**

**Tingkat Keamanan:** Safe
**Kualitas Bukti:** Grade B

**Efek Samping Umum:**
• GI upset (mild), diarrhea, nausea at high doses

**Efek Samping Serius (Jarang):**
• Rare at recommended doses

**Kontraindikasi (Jangan Digunakan Jika):**
• Pregnancy (potential uterotonic effects)
• Lactation (limited data)
• Biliary obstruction
• Severe bleeding disorders

**Keamanan pada Kehamilan & Menyusui:**
Hamil: CAUTION - theoretical uterotonic effects, avoid high doses
Menyusui: LIMITED DATA - likely safe at standard doses, use with caution
```

---

### Example 5: Combination Query
**User:** "Bisa dikombinasi kunyit + jahe?"
```javascript
const response = herbConsultant.respond("Bisa dikombinasi kunyit + jahe?");
```

**Response:**
```
🔗 **Kombinasi Herbal**

**Kunyit + Jahe**
Synergistic anti-inflammatory effect
Keamanan: SAFE (beneficial)
Rekomendasi: Combination formula common in traditional medicine

✅ Kombinasi ini aman dan sering digunakan dalam jamu tradisional.
```

---

## 🔧 Implementation in AI Consultant

### Option A: Add to `patient/ai-consultation.html`

```html
<div id="chat-container">
  <div id="messages"></div>
  <input id="user-input" type="text" placeholder="Tanya tentang herbal...">
  <button onclick="sendQuery()">Kirim</button>
</div>

<script src="../shared/herbal-consultant.js"></script>
<script>
const herbConsultant = new HerbalConsultant();
herbConsultant.initialize();

async function sendQuery() {
  const query = document.getElementById('user-input').value;
  const response = await herbConsultant.respond(query);

  // Display user message
  appendMessage(query, 'user');

  // Display AI response
  appendMessage(response.content, 'ai');
  appendMessage(response.disclaimer, 'system');

  // Clear input
  document.getElementById('user-input').value = '';
}

function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-bubble ${sender}`;
  msgDiv.textContent = text;
  document.getElementById('messages').appendChild(msgDiv);
}
</script>
```

### Option B: Create Dedicated `Info Obat & Interaksi` Page

```html
<!-- patient/info-obat.html -->
<!DOCTYPE html>
<html lang="id">
<head>
  <title>Info Obat & Interaksi — Vitalora</title>
  <link rel="stylesheet" href="../shared/neumorphic.css">
</head>
<body>
<div class="mobile-frame">
  <header class="app-header">
    <button class="neu-icon-btn" onclick="nav('ai-consultation.html')">
      <ion-icon name="arrow-back-outline"></ion-icon>
    </button>
    <div>💊 Info Obat & Interaksi</div>
  </header>

  <div class="section">
    <div id="chat"></div>

    <div style="padding: 16px;">
      <input id="query" type="text" class="neu-input"
             placeholder="Tanya nama herbal atau obat...">
      <button class="neu-btn-primary" onclick="askHerbal()" style="margin-top: 12px;">
        🔍 Cari Info
      </button>
    </div>
  </div>
</div>

<script src="../shared/herbal-consultant.js"></script>
<script>
const consultant = new HerbalConsultant();
consultant.initialize();

async function askHerbal() {
  const query = document.getElementById('query').value;
  const response = await consultant.respond(query);

  const chatDiv = document.getElementById('chat');
  const msg = document.createElement('div');
  msg.className = 'neu-card';
  msg.innerHTML = `
    <div style="white-space: pre-wrap; font-size: 0.85rem; line-height: 1.6;">
      ${response.content}
    </div>
    <div style="font-size: 0.7rem; color: var(--text-tertiary); margin-top: 12px;">
      ${response.disclaimer}
    </div>
  `;
  chatDiv.appendChild(msg);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}
</script>
</body>
</html>
```

---

## 📊 Response Quality Features

### 1. **Intent Detection**
- Automatically detects: info requests, interaction checks, dosage queries, safety concerns, combinations
- Flexible keyword matching in Indonesian & English

### 2. **Severity Ratings**
```
✅ SAFE — No significant interaction
⚠️ MILD — Monitor for symptoms
⛔ MODERATE — Separate doses, medical supervision
🛑 HIGH — Avoid combination
💀 CONTRAINDICATED — DO NOT COMBINE
```

### 3. **Evidence-Based**
- GRADE A-D quality ratings for all claims
- Citation to landmark RCTs & PubMed PMIDs
- Metadata on total papers reviewed (50+)

### 4. **Patient Context**
- Pregnancy/lactation status
- Current medications
- Known conditions/contraindications

---

## 🔐 Safety & Compliance

### Built-in Disclaimers
```
⚠️ Informasi ini untuk edukasi. Konsultasikan dengan dokter
sebelum memulai suplemen herbal, terutama jika sedang minum
obat resep.
```

### Data Quality
- Source: Vitalora Herbal SLR (50+ papers, PRISMA-2020)
- Update frequency: Every 6 months
- Last audit: 2026-03-28

---

## 🧪 Testing Queries

```
User: "Apa manfaat kunyit?"
→ Returns clinical uses with evidence

User: "Aman tidak ginger dengan aspirin?"
→ Returns interaction severity & recommendation

User: "Berapa dosis jahe untuk diabetes?"
→ Returns standard dosage + condition-specific notes

User: "Herbal apa yang aman saat hamil?"
→ Returns filtered list with pregnancy safety notes

User: "Bisa dikombinasi bawang putih + warfarin?"
→ Returns specific interaction severity (MODERATE)

User: "Daftar efek samping cinnamon"
→ Returns adverse effects + contraindications
```

---

## 📈 Future Enhancements

1. **Machine Learning Integration**
   - Train NLP model on user queries
   - Improve intent detection accuracy
   - Personalized recommendations

2. **Real-time Updates**
   - Sync database from Firestore
   - Auto-update when new research published
   - Versioning system for changes

3. **Advanced Features**
   - Multi-herbal interaction checker (3+ combinations)
   - Risk calculator (patient profile → herbal recommendation)
   - Doctor approval workflow
   - Pharmacist review integration

4. **Localization**
   - Indonesian traditional names mapping
   - Regional availability checker
   - Price comparison integration

---

## 🔗 Integration Checklist

- [ ] Copy `herbal-knowledge-base.json` to `/VITALORA/`
- [ ] Copy `herbal-consultant.js` to `/VITALORA/shared/`
- [ ] Add `<script src="../shared/herbal-consultant.js"></script>` to relevant pages
- [ ] Test with sample queries
- [ ] Verify interaction checks with known drug combinations
- [ ] Set up Firestore sync (optional)
- [ ] Deploy to Firebase
- [ ] User testing & feedback collection

---

## 📚 References

**Knowledge Base Sources:**
- WHO Monographs on Selected Medicinal Plants
- PubMed Central (50+ papers)
- Cochrane Library (4 systematic reviews)
- Vitalora Herbal SLR (PRISMA-2020 protocol)

**Development:**
- Herbal Consultant Module v1.0
- Database: herbal-knowledge-base.json
- Last Updated: 2026-03-28

---

**Questions?** Check `herbal-knowledge-base.json` metadata or contact Vitalora research team.
