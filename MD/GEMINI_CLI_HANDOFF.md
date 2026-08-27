# 🤖 GEMINI CLI HANDOFF — HERBORATECH PROJECT

**Date:** 2026-03-24
**Session Status:** Phase 2 SLR Complete ✅
**Git Commit:** `5b36116` - "Complete Phase 2 SLR — 10 remaining diseases research pages"
**Next AI:** Gemini CLI

---

## 📋 QUICK SUMMARY

✅ **What's Done:**
- Phase 1 SLR: 5 diseases, 420+ papers, 5 research pages (committed)
- Phase 2 SLR: 10 diseases, 600+ papers, 10 research pages (committed)
- Total: 15 diseases, 1,020+ papers, 30,000+ citations, **PRISMA-2020 compliant**
- All research pages with state-of-the-art timelines, evidence grading, landmark papers

❌ **What's Pending:**
- Feature Specifications (Batch 17-22)
- Multi-step screening questionnaire implementation
- Herbal recommendations integration
- Consumption pattern (pola konsumsi) integration
- Firestore data models for results storage

---

## 🎯 YOUR IMMEDIATE TASK

**Create comprehensive Feature Specifications for Batch 17-22** with:
1. Multi-step wizard design
2. Scoring algorithm (0-100 scale)
3. Risk categorization (Low/Medium/High)
4. Medical referral thresholds
5. **🌿 Herbal recommendations** (with evidence, dosage, preparation)
6. **🍽️ Consumption pattern/dietary guidelines** (meal plans, food traffic lights, timing)
7. Lifestyle recommendations
8. Firestore data model

---

## 📁 PROJECT STRUCTURE

```
c:\Users\mosto\Desktop\HERBORATECH\
├── www/patient/
│   ├── research-dyslipidemia.html ✅
│   ├── research-hypertension.html ✅
│   ├── research-nafld.html ✅
│   ├── research-metabolic-syndrome.html ✅
│   ├── research-obesity.html ✅
│   ├── research-thyroid.html ✅ (NEW)
│   ├── research-pcos.html ✅ (NEW)
│   ├── research-osa.html ✅ (NEW)
│   ├── research-gout.html ✅ (NEW)
│   ├── research-depression.html ✅ (NEW)
│   ├── research-insulin-resistance.html ✅ (NEW)
│   ├── research-diabetic-complications.html ✅ (NEW)
│   ├── research-osteoporosis.html ✅ (NEW)
│   ├── research-hypogonadism.html ✅ (NEW)
│   ├── research-ckd-extended.html ✅ (NEW)
│   └── disease-risk.html (existing, needs research page links added)
│
├── DOCUMENTATION FILES:
│   ├── SLR_METHODOLOGY_FRAMEWORK.md (40 pages - SLR methodology)
│   ├── PHASE_1_SLR_COMPLETION.md (420+ papers summary)
│   ├── PHASE_2_SLR_PROGRESS.md (600+ papers + continuation guide)
│   ├── CLAUDE.md (UI design system & boilerplate)
│   └── GEMINI_CLI_HANDOFF.md (THIS FILE)
│
└── OUTPUT LOCATION FOR YOUR WORK:
    └── FEATURE_SPECS/ (CREATE THIS FOLDER)
        ├── BATCH_17_DYSLIPIDEMIA_SPEC.md
        ├── BATCH_18_HYPERTENSION_SPEC.md
        ├── BATCH_19_NAFLD_SPEC.md
        ├── BATCH_20_METABOLIC_SYNDROME_SPEC.md
        ├── BATCH_21_OBESITY_INSULIN_RESISTANCE_SPEC.md
        └── BATCH_22_DEPRESSION_SPEC.md
```

---

## 🔑 KEY FILES TO READ FIRST

### 1. **PHASE_2_SLR_PROGRESS.md** (START HERE!)
**Why:** Complete overview of all 15 diseases, papers collected, key findings
**Section to focus:**
- "Temuan Utama (Meta-Analysis)" section untuk setiap disease
- Screening tool specifications yang sudah ada
- Prevalence & epidemiology data

### 2. **CLAUDE.md** (Design Reference)
**Why:** UI design system, color schemes, component library
**Key info:**
- Neumorphic design palette
- Color per disease (use these!)
- CSS classes available
- Boilerplate HTML structure

### 3. **SLR_METHODOLOGY_FRAMEWORK.md** (Background)
**Why:** Comprehensive research methodology & evidence grading
**Sections:**
- PRISMA 2020 compliance checklist
- GRADE evidence grading system (A-D)
- Inclusion/exclusion criteria per disease

---

## 🌿 HERBAL RECOMMENDATIONS STRUCTURE

**Reference:** PHASE_2_SLR_PROGRESS.md mentions herbal formulas in context of each disease.

**Template for Each Disease:**

```markdown
## 🌿 HERBAL RECOMMENDATIONS (Risk-Based)

### LOW RISK (Preventive)
Herbal Formula: "[Jamu Formula Name]"
├─ Main herbs: [list with amounts]
├─ Evidence: X papers backing (effect size %)
├─ Mechanism: [how it works]
├─ Dosage: [frequency & amount]
├─ Duration: [minimum treatment period]
├─ Expected Result: [measurable outcomes]
└─ Safety: [interactions, contraindications]

### MODERATE RISK (Therapeutic)
[Similar structure, higher potency]

### HIGH RISK (Intensive + Medical)
⚠️ ADJUNCTIVE to medical therapy (not replacement!)
[Similar structure, requires doctor approval]
```

**Where to Find Herbal Data:**
- Some papers mention traditional remedies (in research notes)
- BATCH 13 OCR Vademekum has Indonesian herbal database (if accessible)
- Otherwise: Use established herbal databases (curcumin for dyslipidemia, milk thistle for liver, etc.)

---

## 🍽️ CONSUMPTION PATTERN (POLA KONSUMSI) STRUCTURE

**Template for Each Disease:**

```markdown
## 🍽️ POLA KONSUMSI / DIETARY GUIDELINES

### DAILY STRUCTURE (Example)
PAGI (Morning):
├─ Breakfast: [specific foods with amounts]
├─ Timing: [recommended time]
└─ Herbal: [timing relative to meals]

SIANG (Lunch):
[similar]

SORE (Afternoon):
[snack]

MALAM (Dinner):
[main meal]

### FOOD GUIDELINES (Traffic Light System)
🟢 ENCOURAGED (Every day): [list with frequency]
🟡 MODERATE (2-3x/week): [list]
🔴 AVOID/LIMIT: [list]

### WEEKLY MEAL PLAN TEMPLATE
| Day | Breakfast | Lunch | Dinner | Herbal |
|-----|-----------|-------|--------|--------|
| Mon | [meal] | [meal] | [meal] | 2x |
| ... | ... | ... | ... | ... |

### PREPARATION & CONSUMPTION RULES
├─ HERBAL TIMING: [when to take]
├─ FOOD COMBINATIONS TO AVOID: [incompatibilities]
└─ HYDRATION: [water intake recommendations]
```

---

## 📊 SCORING ALGORITHM TEMPLATE

**Universal formula (adjust weights per disease):**

```javascript
Score = (Symptom_Points × weight1) + (Risk_Factor_Points × weight2) + (Lab_Proxy_Points × weight3)

Risk Categories:
├─ 0-30: LOW RISK
│  └─ → Preventive herbal + lifestyle counseling
├─ 31-70: MODERATE RISK
│  └─ → Therapeutic herbal + dietary intervention + lab work
└─ 71-100: HIGH RISK
   └─ → Medical referral + herbal adjunctive + intensive diet plan
```

---

## 🗂️ BATCH BREAKDOWN (What to Create)

### **BATCH 17: Dyslipidemia Screening** ⭐ START HERE
- **Papers:** 180+ (4,500+ citations)
- **Grade:** B (Moderate)
- **Key Metric:** Non-HDL Cholesterol (Sensitivity 85-92%)
- **Risk Factors:** BMI, waist circumference, family history, diet
- **Key Papers:**
  - Non-HDL validation (PLoS ONE 2015, 291 citations)
  - Meta-analysis anthropometric predictors (Shanghai 2019, 47 citations)
  - TLC diet efficacy (2024, 3 citations)

### **BATCH 18: Hypertension Management**
- **Papers:** 60+ (2,000+ citations)
- **Grade:** A (Highest)
- **Key Study:** HOME BP RCT (189 citations, BMJ 2021)
- **Risk Factors:** Age, family history, lifestyle, salt intake
- **Focus:** Digital intervention, home BP monitoring

### **BATCH 19: NAFLD Assessment**
- **Papers:** 60+ (2,500+ citations)
- **Grade:** B (Moderate-Strong)
- **Key Tool:** FIB-4 Index (AUROC 0.88, 141 citations)
- **Risk Factors:** Metabolic syndrome, obesity, T2DM

### **BATCH 20: Metabolic Syndrome**
- **Papers:** 60+ (2,500+ citations)
- **Grade:** A (Highest)
- **Landmark:** PREDIMED-Plus (304 citations, N=6,874)
- **Criteria:** IDF 5-component definition
- **Key Finding:** Weight loss 7-10kg → CV event reduction 25-30%

### **BATCH 21: Obesity & Insulin Resistance**
- **Papers:** 120+ (combined, 3,600+ citations)
- **Obesity Grade:** B (Strong) - 60 papers
- **IR Grade:** B (Moderate) - 60 papers
- **Key Tools:** BMI (diagnostic accuracy 85-92%), HOMA-IR (Asian cutoff >2.2)

### **BATCH 22: Depression**
- **Papers:** 60+ (2,500+ citations)
- **Grade:** A (Highest)
- **Gold Standard:** PHQ-9 (90 citations from landmark study)
- **Key Finding:** PHQ-9 Sensitivity 88-95%, Specificity 85-92%
- **Herbal Note:** Consider mood-supporting herbs (St. John's Wort, Ashwagandha)

---

## 📝 SPEC DOCUMENT TEMPLATE

Use this structure for each batch:

```markdown
# BATCH [X]: [Disease Name] Specification

**Research Backing:** X+ papers, Y+ citations (GRADE: [A-D])
**Primary Biomarker:** [key measurement]
**UI Steps:** [number]-step wizard
**Estimated Implementation Time:** [X hours]

## WIZARD STEPS (Overview)
Step 1: [first question area]
...
Step N: [summary & results]

## SCORING ALGORITHM
[JavaScript-ready pseudocode]

## 🏥 MEDICAL RECOMMENDATIONS
├─ Lab work: [what tests]
├─ Referral criteria: [when to refer]
└─ Follow-up: [timeline]

## 🌿 HERBAL RECOMMENDATIONS
[Risk-based herbal formulas with evidence]

## 🍽️ CONSUMPTION PATTERN
[Daily structure + food guidelines + meal plans]

## 💪 LIFESTYLE RECOMMENDATIONS
├─ Exercise: [type, duration, frequency]
├─ Sleep: [hours & timing]
└─ Stress management: [techniques]

## 🗄️ FIRESTORE DATA MODEL
[Schema for storing results]

## ✅ SUCCESS METRICS
[How to measure if feature works]

## 📱 UI COMPONENTS TO BUILD
[List of HTML/CSS/JS components needed]
```

---

## 🎨 COLOR SCHEME (Reference from PHASE_2_SLR_PROGRESS.md)

Use these for consistency across UI:

```
Dyslipidemia:    Orange (#F2994A)
Hypertension:    Red (#EB5757)
NAFLD:           Blue (#2F80ED)
Metabolic Syn:   Purple (#6C63FF)
Obesity:         Green (#6FCF97)
Insulin Resist:  Light Green (#6FCF97)
Depression:      Dark Purple (#4A235A)
Thyroid:         Blue (#2F80ED)
PCOS:            Purple (#6C63FF)
OSA:             Orange-Red (#F2994A)
Gout:            Yellow (#F2C94C)
Diabetic Comp:   Red (#EB5757)
Osteoporosis:    Tan/Brown (#A0826D)
Hypogonadism:    Navy Blue (#2C5282)
CKD Extended:    Light Blue (#5DADE2)
```

---

## 🚀 STEP-BY-STEP INSTRUCTIONS FOR GEMINI CLI

### **STEP 1: Create FEATURE_SPECS Folder**
```bash
mkdir -p FEATURE_SPECS
cd FEATURE_SPECS
```

### **STEP 2: Create Batch 17 Specification** (Full template example)
```
File: BATCH_17_DYSLIPIDEMIA_SPEC.md

Content should include:
- Intro with research backing
- 6-step wizard layout
- Scoring algorithm (with weights for dyslipidemia)
- Medical recommendations (lipid panel, cardiologist referral)
- 🌿 Herbal recommendations (Curcumin, Milk Thistle formulas)
- 🍽️ Consumption pattern (daily meals, food guidelines)
- Firestore schema
```

### **STEP 3: Create Batch 18-22 Specifications**
```
Repeat step 2 for each batch:
- BATCH_18_HYPERTENSION_SPEC.md
- BATCH_19_NAFLD_SPEC.md
- BATCH_20_METABOLIC_SYNDROME_SPEC.md
- BATCH_21_OBESITY_INSULIN_RESISTANCE_SPEC.md
- BATCH_22_DEPRESSION_SPEC.md
```

### **STEP 4: Git Commit**
```bash
git add FEATURE_SPECS/
git commit -m "docs: Create feature specifications for Batch 17-22 with herbal + dietary integration

- BATCH 17: Dyslipidemia (180+ papers, herbal + meal plans)
- BATCH 18: Hypertension (60+ papers, digital intervention)
- BATCH 19: NAFLD (60+ papers, FIB-4 screening)
- BATCH 20: Metabolic Syndrome (60+ papers, PREDIMED-Plus backed)
- BATCH 21: Obesity & Insulin Resistance (120+ papers combined)
- BATCH 22: Depression (60+ papers, PHQ-9 gold standard)

Each spec includes:
✓ Multi-step wizard design
✓ Scoring algorithm (0-100 scale)
✓ Medical recommendations with referral thresholds
✓ 🌿 Herbal recommendations (evidence-based with dosage)
✓ 🍽️ Consumption patterns (daily meal structure + food guidelines)
✓ Firestore data models

Total research backing: 600+ papers, 16,500+ citations

Co-Authored-By: Gemini CLI <noreply@google.com>"
```

---

## 📚 REFERENCE DATA (Quick Lookup)

### **Key Herbal Compounds by Disease:**

**Dyslipidemia:**
- Curcumin (Turmeric): LDL reduction 10-20%
- Milk Thistle: Liver support, cholesterol metabolism
- Plant sterols: LDL reduction 5-15%

**NAFLD:**
- Milk Thistle (Silymarin): Liver enzyme reduction
- Curcumin: Anti-inflammatory
- Vitamin E: Antioxidant support

**Metabolic Syndrome:**
- Curcumin: Insulin sensitivity improvement
- Cinnamon: Blood glucose control
- Fenugreek: Lipid profile improvement

**Depression:**
- St. John's Wort: Mild-moderate depression (15+ papers)
- Ashwagandha: Anxiety & mood support
- 5-HTP: Serotonin support

**Hypertension:**
- Garlic: BP reduction 5-10%
- Hawthorn: Cardiovascular support
- Hibiscus: BP reduction studies available

---

## 💾 OUTPUT CHECKLIST

Before you finish, ensure:

- [ ] All 6 Batch spec documents created (17-22)
- [ ] Each spec has 7 main sections:
  - [ ] Research backing & overview
  - [ ] Multi-step wizard design
  - [ ] Scoring algorithm
  - [ ] Medical recommendations
  - [ ] 🌿 Herbal recommendations (risk-based)
  - [ ] 🍽️ Consumption pattern (daily + weekly)
  - [ ] Firestore data model
- [ ] Evidence citations included (paper count, citations, grades)
- [ ] Herbal formulas backed by research
- [ ] Meal plans are realistic & culturally appropriate (Indonesian context)
- [ ] Scoring weights total to 100%
- [ ] All specs follow consistent formatting
- [ ] Git committed with clear message

---

## 🔗 NEXT STEPS AFTER SPECS ARE DONE

Once all 6 batch specs are completed:

1. **Implementation:** Another AI session will use these specs to build actual screening features
2. **Testing:** Create test cases for each scoring algorithm
3. **Integration:** Add to disease-risk.html with links
4. **Database:** Set up Firestore collections for results storage
5. **Deployment:** Deploy to staging environment for testing

---

## 📞 HANDOFF NOTES

**What went well:**
- Phase 2 SLR completed ahead of schedule
- All 15 research pages created with comprehensive evidence backing
- Clear specification template established
- Color scheme & design system documented

**Potential challenges:**
- Herbal recommendations need cultural validation (Indonesian context)
- Consumption patterns should reflect local food availability
- Scoring algorithms need validation with real patient data (future)
- Firestore integration requires careful data modeling

**Assumptions made:**
- User has access to herbal/Vademekum OCR data from Batch 13
- Meal plans should be Indonesian-friendly (nasi goreng, etc. alternatives)
- Medical thresholds based on international standards (may need localization)
- Budget ~6 hours per batch for specs (may vary)

---

**Status:** Ready for Gemini CLI to start **BATCH 17 specification creation**.
**Git branch:** main
**Last commit:** 5b36116

Good luck! 🚀
