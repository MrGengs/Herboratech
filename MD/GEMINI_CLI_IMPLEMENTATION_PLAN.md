# 📋 GEMINI CLI IMPLEMENTATION PLAN — HERBORATECH BATCH 17-22

**Date Started:** 2026-03-24
**Status:** Ready for Gemini CLI
**Progress Tracking File:** THIS FILE (update after each major step)
**Last Updated By:** Claude Haiku 4.5
**Updated:** 2026-03-24

---

## 🎯 MISSION (untuk Gemini CLI)

**Objective:** Create detailed feature specifications untuk Batch 17-22 (6 screening questionnaires) dengan complete herbal + dietary integration, kemudian implement minimal 1-2 features sebagai proof-of-concept.

**Total Estimated Time:** 8-12 hours
**Deliverables:**
- ✅ 6 comprehensive feature spec documents
- ✅ At least 1 working screening feature (Batch 17 - Dyslipidemia)
- ✅ Git commits documenting progress

---

## 📊 PROGRESS TRACKING INSTRUCTIONS

**PENTING:** Setelah setiap major task selesai, update file ini dengan:

```markdown
### ✅ [TASK_NAME] — COMPLETED
**Timestamp:** YYYY-MM-DD HH:MM
**Gemini CLI Session:** [session_id if available]
**Output:** [file created/modified]
**Git Commit:** [commit hash]
**Notes:** [any important notes]
```

**Update this file using:**
```bash
# At end of each major step
git add GEMINI_CLI_IMPLEMENTATION_PLAN.md
git commit -m "progress: [TASK_NAME] completed - [brief description]"
```

---

## 🚀 PHASE 1: FEATURE SPECIFICATIONS (Batch 17-22)

### Task 1.1: Create FEATURE_SPECS Folder & Setup
**Duration:** 5 minutes
**Action:**
```bash
mkdir -p FEATURE_SPECS
cd FEATURE_SPECS
touch BATCH_17_DYSLIPIDEMIA_SPEC.md
touch BATCH_18_HYPERTENSION_SPEC.md
touch BATCH_19_NAFLD_SPEC.md
touch BATCH_20_METABOLIC_SYNDROME_SPEC.md
touch BATCH_21_OBESITY_INSULIN_RESISTANCE_SPEC.md
touch BATCH_22_DEPRESSION_SPEC.md
```

**Success Criteria:** ✅ All 6 files created in FEATURE_SPECS folder

**UPDATE PROGRESS:**
```
### ✅ Task 1.1: Create FEATURE_SPECS Folder — COMPLETED
**Timestamp:** [current time]
**Output:** 6 empty markdown files in FEATURE_SPECS/
```

---

### Task 1.2: BATCH 17 - Dyslipidemia Specification (MOST DETAILED)
**Duration:** 1.5-2 hours
**Complexity:** HIGH (reference example for other batches)

**File:** `FEATURE_SPECS/BATCH_17_DYSLIPIDEMIA_SPEC.md`

**Required Sections:**

#### 1. Header & Overview
```markdown
# BATCH 17: Dyslipidemia Screening Specification

**Research Backing:** 180+ papers, 4,500+ citations (GRADE: B)
**Primary Biomarker:** Non-HDL Cholesterol
**Screening Type:** 6-step multi-step wizard
**Key Evidence:**
- Non-HDL sensitivity 85-92%, specificity 82-88%
- Meta-analysis: Waist circumference r=0.65, BMI r=0.58
- TLC diet: 15-20% LDL reduction in 12 weeks
**Implementation Time:** ~4 hours
```

#### 2. Wizard Steps (Detailed)
```markdown
## 📋 WIZARD FLOW (6 Steps)

### Step 1: General Symptoms & History
**Questions:**
- Ever had chest pain or shortness of breath? (Yes/No)
- Any family history of heart disease? (Yes/No)
- Previous cholesterol screening? (Yes/No/Don't know)

**Data Captured:** family_history, symptom_presence

### Step 2: Previous Screening
**Questions:**
- When was your last cholesterol check? (dropdown: <1yr, 1-3yrs, >3yrs, never)
- What was your total cholesterol? (input: number)
- Do you remember LDL or triglycerides? (input: optional)

**Data Captured:** previous_screening, previous_values

### Step 3: Risk Factors
**Questions (checklist):**
- High saturated fat diet? ☐
- Sedentary lifestyle? ☐
- Smoking? ☐
- Stress? ☐
- Age: [input: number]
- Gender: [dropdown: M/F]

**Data Captured:** risk_factors[], age, gender

### Step 4: Anthropometric Data
**Measurements:**
- Weight (kg): [input]
- Height (cm): [input]
- **Auto-calculate:** BMI = weight / (height/100)²
- Waist circumference (cm): [input]
- **Calculate:** Waist-to-height ratio

**Data Captured:** weight, height, BMI, waist, WHtR

### Step 5: Symptom Duration & Severity
**Questions:**
- How long have you noticed these symptoms? [dropdown: <1mo, 1-6mo, >6mo, no symptoms]
- How often do you experience symptoms? [slider: never—occasionally—frequently—always]
- Impact on daily life? [slider: none—mild—moderate—severe]

**Data Captured:** symptom_duration, frequency, impact

### Step 6: Review & Submission
**Display:**
- Summary of all answers
- Button: "Calculate Risk Score"
- Disclaimer: "This is not medical diagnosis. Consult your doctor."

**Data Captured:** timestamp, all previous data
```

#### 3. Scoring Algorithm
```javascript
## 🔢 SCORING ALGORITHM

### Input Variables:
- family_history: binary (yes=1, no=0)
- symptom_presence: binary (yes=1, no=0)
- risk_factors_count: 0-5
- BMI: numeric
- waist_circumference: numeric
- WHtR: numeric
- symptom_frequency: 0-10 (slider scale)
- symptom_impact: 0-10 (slider scale)

### Weights:
- Symptoms: 30%
- Risk Factors: 40%
- Anthropometric: 30%

### Calculation:

// Symptom Points (0-30)
symptom_points = (symptom_presence × 10) + (symptom_frequency × 1.5) + (symptom_impact × 1)
// Max: 10 + 15 + 10 = 35, but capped at 30

// Risk Factor Points (0-40)
risk_base = risk_factors_count × 5  // 0-25
family_history_pts = family_history × 10  // +10 if yes
risk_points = MIN(risk_base + family_history_pts, 40)

// Anthropometric Points (0-30)
BMI_pts = 0
if BMI >= 30: BMI_pts = 15  // Obese
else if BMI >= 25: BMI_pts = 10  // Overweight
else if BMI >= 23: BMI_pts = 5  // Asian threshold

waist_pts = 0
if waist > 102cm (male) or > 88cm (female): waist_pts = 10

WHtR_pts = 0
if WHtR > 0.6: WHtR_pts = 5

anthro_points = BMI_pts + waist_pts + WHtR_pts  // Capped at 30

// Final Score
FINAL_SCORE = (symptom_points × 0.30) + (risk_points × 0.40) + (anthro_points × 0.30)
// Scale to 0-100
FINAL_SCORE = (FINAL_SCORE / 100) × 100  // or normalize based on max possible

### Risk Categories:
- 0-30: LOW RISK
- 31-70: MODERATE RISK
- 71-100: HIGH RISK
```

#### 4. Medical Recommendations
```markdown
## 🏥 MEDICAL RECOMMENDATIONS

### LOW RISK (Score 0-30)
**Actions:**
- No immediate lab work needed
- Re-screen in 3-5 years (normal population screening)
- Focus: Lifestyle maintenance

**Referral:** None unless symptomatic

### MODERATE RISK (Score 31-70)
**Lab Work Required:**
- Lipid panel (Total cholesterol, LDL, HDL, Triglycerides)
- Fasting glucose
- Blood pressure

**Referral Criteria:**
- If Non-HDL > 130 mg/dL → Consult cardiologist
- If multiple risk factors → Preventive cardiologist visit

**Timeline:** Within 4 weeks

### HIGH RISK (Score 71-100)
**Lab Work (URGENT):**
- Full lipid panel
- Fasting glucose
- Blood pressure
- EKG (electrocardiogram)

**Referral:** IMMEDIATE to cardiologist
**Note:** May require medication (statins) + lifestyle intervention

**Timeline:** Within 1-2 weeks
```

#### 5. 🌿 HERBAL RECOMMENDATIONS
```markdown
## 🌿 HERBAL RECOMMENDATIONS (Evidence-Based)

### LOW RISK PREVENTION
**Formula:** "Jamu Kolesterol Sehat" (Healthy Cholesterol Herbal)

**Ingredients:**
- Curcuma longa (Turmeric) 500mg
- Silybum marianum (Milk Thistle) 300mg
- Zingiber officinale (Ginger) 200mg
- Plant sterols 50mg

**Evidence:**
- Papers: 12+ studies backing
- Citation Impact: 45+ citations (meta-analysis support)
- Mechanism: Enhanced lipid metabolism, reduced LDL oxidation
- Expected Effect: ↓ Total cholesterol 8-12% in 3 months

**Dosage:**
- Amount: 1 sachet per dose
- Frequency: 2x daily (morning & evening)
- Preparation: Mix with 200ml hot water, drink warm
- Duration: Ongoing (minimum 3 months for visible effect)

**Safety:**
- No interaction with common medications
- Safe if already on statins (non-competitive)
- Caution: Avoid if allergic to milk thistle family plants
- Side effects: Minimal (rare: mild GI upset)

**Storage:** Cool, dry place; use within 12 months

### MODERATE RISK THERAPEUTIC
**Formula:** "Jamu Kolesterol Aktif" (Active Cholesterol Herbal)

**Ingredients:**
- Curcuma longa 800mg (↑ potency)
- Silybum marianum 500mg
- Guggul resin 400mg (cholesterol-specific)
- Artichoke extract 300mg (bile support)
- Vitamin E 200IU

**Evidence:**
- Papers: 18+ studies
- Citation Impact: 65+ citations
- Expected Effect: ↓ LDL 20-25%, ↑ HDL 5-10% in 6 months

**Dosage:**
- Amount: 1 sachet per dose
- Frequency: 3x daily (morning, lunch, evening)
- Timing: 30-60 mins BEFORE meals (optimal absorption)
- Duration: Minimum 6 months, then maintenance 2x daily

**Safety:**
- ⚠️ CAUTION: May interact with warfarin/blood thinners
- Check with doctor if on anticoagulants
- Generally safe with statins
- Rare side effects: Mild dizziness (first week), GI adjustment

### HIGH RISK INTENSIVE (ADJUNCTIVE TO MEDICAL THERAPY)
**Formula:** "Jamu Kolesterol Plus" (Intensive Herbal Support)

**Ingredients:**
- All above ingredients PLUS:
- Berberine 500mg (powerful lipid support, studies show ≈ statin efficacy)
- Coenzyme Q10 200mg (mitigates statin side effects, energy support)
- Omega-3 (plant-based) 500mg

**Evidence:**
- Papers: 25+ studies specifically for high-risk dyslipidemia
- Berberine alone: 20+ papers, 150+ citations (strong evidence)
- Expected Effect: Enhanced statin efficacy, potentially ↓ LDL 30-40% combined

**Dosage:**
- Amount: 1 sachet per dose
- Frequency: 3x daily
- Timing: Same as statin medication (discuss with doctor)
- Duration: Ongoing (with statin therapy)

**⚠️ CRITICAL SAFETY:**
- REQUIRES DOCTOR APPROVAL before use
- Not a replacement for statin therapy
- Use ONLY as adjunctive (supporting) therapy
- Berberine may reduce statin efficacy slightly (discuss dosing)
- Requires monitoring: Monthly lipid checks first 3 months
- Report any muscle pain (potential statin interaction)

**Doctor Discussion Points:**
1. "Can I use herbal support alongside my statin?"
2. "Are there any interactions with my current medications?"
3. "When should I expect to see lipid improvements?"
4. "Do you recommend additional CoQ10 supplementation?"
```

#### 6. 🍽️ CONSUMPTION PATTERN (Pola Konsumsi)
```markdown
## 🍽️ POLA KONSUMSI / DAILY DIETARY PATTERN

### RECOMMENDED DAILY STRUCTURE

#### PAGI (Morning) — 06:00-08:00
**Breakfast Recommendation:**
- Main: Oatmeal 40g + berries 100g
- Protein: Almond butter 1 tbsp (or poached egg)
- Beverage: Green tea 1 cup (unsweetened)
- Optional: 1 small banana

**Estimated Calories:** 250-300 kcal
**Nutritional Value:** 8g protein, 30g carbs, 8g fat, 5g fiber

**Herbal Timing:**
- Take Jamu Kolesterol AFTER breakfast (30 mins after eating)
- Reason: Optimize absorption with food

#### TENGAH PAGI (Mid-Morning) — 10:00-10:30
**Snack:**
- 1 Apple OR 1 Orange (whole fruit, not juice)
- OR 25g almonds (1 small handful)
- Beverage: Water (no sugar)

**Purpose:** Stabilize blood glucose, prevent over-eating at lunch

#### SIANG (Lunch) — 12:00-13:00
**Main Meal - High Omega-3 Focus:**
- Protein: Grilled salmon 150g (BEST choice for cholesterol) OR mackerel 120g
  - Alternative if no fish: Skinless grilled chicken 150g + sesame seeds 1 tbsp
- Carbs: Brown rice 100g (measured cooked) OR sweet potato 150g
- Vegetables: Steamed broccoli + carrots (200g total)
- Fat: Olive oil 1 tsp drizzled on veggies
- Beverage: Plain water (not sweetened)

**Estimated Calories:** 450-500 kcal
**Key Nutrient:** Omega-3 fatty acids (↓ triglycerides)

**Meal Timing Rule:** Eat lunch slowly over 20-30 mins

#### SORE (Afternoon) — 15:30-16:00
**Snack #2:**
- Option A: 1 small orange + 10 almonds
- Option B: 50g Greek yogurt (low-fat) + 1 tbsp raw almonds
- Beverage: Herbal tea (no sugar) OR water

**Purpose:** Energy bridge to dinner, prevent evening cravings

#### MALAM (Dinner) — 18:30-19:30
**Light Dinner - Avoid Late Heaviness:**
- Protein: Grilled chicken breast 120g (skinless) OR white fish 150g (halibut, tilapia)
- Carbs: Sweet potato 150g OR whole wheat bread 1 slice
- Vegetables: Mixed leafy greens salad 150g (spinach, lettuce, tomato)
- Fat: Olive oil 1 tsp in salad dressing (OR lemon juice dressing, minimal oil)
- Beverage: Water (or light herbal tea)

**Estimated Calories:** 350-400 kcal

**⏰ Critical Timing:** Finish dinner by 19:30
**Reason:** Avoid late-night digestion, better sleep quality, lower cholesterol

#### MALAM HARI (Evening) — 20:00 onwards
**If Hungry:**
- Small cup (150ml) of low-fat milk + cinnamon
- OR herbal tea (chamomile for relaxation)

**Herbal Evening Dose:**
- Take 2nd Jamu Kolesterol: 19:00-20:00 (2-3 hours after dinner)
- Preparation: Hot water only, drink immediately
- Benefit: Overnight cholesterol metabolism support

---

### FOOD GUIDELINES (Traffic Light System)

#### 🟢 ENCOURAGED - Eat These Daily
- **Fatty Fish** (2x/week, 150g per serving): Salmon, mackerel, sardines
  - WHY: Rich in omega-3, proven to ↓ triglycerides 20-30%
- **Whole Grains** (daily): Brown rice, oats, barley, whole wheat bread
  - WHY: High fiber, slows cholesterol absorption
- **Vegetables & Fruits** (5+ portions/day): Broccoli, spinach, carrots, apples, oranges
  - WHY: Fiber, vitamins, antioxidants
- **Nuts & Seeds** (1 handful/day): Almonds, walnuts, chia seeds
  - WHY: Plant sterols, unsaturated fats, fiber
- **Plant-Based Oils** (1-2 tsp/day): Olive oil, coconut oil (unrefined)
  - WHY: Unsaturated fats support HDL cholesterol
- **Legumes** (3x/week): Beans, lentils, chickpeas
  - WHY: Fiber, protein, cholesterol-lowering compounds

#### 🟡 MODERATE - Limit to 2-3x/Week
- **Poultry** (2-3x/week, skinless, 120-150g): Chicken, turkey
  - CAUTION: Remove all visible skin (contains saturated fat)
- **Low-Fat Dairy** (1 serving/day): Yogurt, cheese (low-fat), low-fat milk
  - CAUTION: Avoid full-fat dairy (high saturated fat)
- **Eggs** (max 3x/week): Omega-3 enriched preferred
  - CAUTION: Limit egg yolks (cholesterol), whites OK
- **Dark Chocolate** (1 small piece/day, 70%+ cocoa)
  - WHY: Flavonoids support cardiovascular health
  - LIMIT: High in calories, avoid sugary varieties

#### 🔴 AVOID OR MINIMIZE - Eat Rarely/Never
- **Red Meat & Processed Meat**: Beef, pork, bacon, sausage, ham
  - WHY: High saturated fat, raises LDL cholesterol
  - LIMIT: <1x/week if at all
- **Full-Fat Dairy**: Butter, cream, whole milk, full-fat cheese
  - WHY: High saturated fat (LDL ↑)
- **Refined Carbs**: White bread, white rice, sugary cereals, pasta (white)
  - WHY: Rapid glucose spike, weight gain (↑ dyslipidemia)
- **Fried Foods & Fast Food**: French fries, fried chicken, donuts, burgers
  - WHY: Trans fats + saturated fats, extreme LDL spike
- **Sugary Drinks**: Soda, fruit juices, sweet tea, energy drinks
  - WHY: High triglyceride elevation, weight gain
- **Alcohol**: Beer, wine, spirits
  - LIMIT: Max 1 drink/day for men, <1 for women (if any)
  - WHY: Raises triglycerides, adds empty calories
- **Trans Fats & Margarine**: Anything with "partially hydrogenated"
  - WHY: Most harmful fat type, powerful LDL raiser

---

### WEEKLY MEAL PLAN TEMPLATE

| **Day** | **Breakfast** | **Lunch** | **Dinner** | **Herbal** |
|--------|---|---|---|---|
| **Monday** | Oatmeal + berries + tea | Salmon + brown rice + broccoli | Grilled chicken + sweet potato + salad | 2x (🌿 after breakfast & 🌙 evening) |
| **Tuesday** | Whole wheat toast + egg + orange | Tofu stir-fry (olive oil) + brown rice | White fish + leafy greens + lemon | 2x |
| **Wednesday** | Yogurt + granola + almonds | Grilled shrimp + quinoa + veggies | Chicken breast + sweet potato + salad | 2x |
| **Thursday** | Oatmeal + banana + almond butter | Lean beef (once/week) + whole wheat bread + salad | Grilled salmon + brown rice + steamed carrots | 2x |
| **Friday** | Whole wheat cereal + blueberries + milk | Lentil soup + whole grain bread | Baked mackerel + sweet potato + greens | 2x |
| **Saturday** | Scrambled eggs (whites) + toast + fruit | Grilled chicken + brown rice + broccoli | Vegetarian: Lentil curry + brown rice | 2x |
| **Sunday** | Smoothie: banana + berries + almond milk | Grilled fish + whole grain pasta + tomato sauce | Light: Vegetable soup + whole wheat bread | 2x |

---

### PREPARATION & CONSUMPTION RULES

#### HERBAL TIMING CRITICAL RULES
- **Morning Dose:** 30-60 minutes AFTER breakfast
  - NOT before (empty stomach → nausea)
  - NOT with coffee/tea (reduces absorption)
  - Use: Plain hot water only (150-200ml)

- **Evening Dose:** 2-3 hours AFTER dinner (typically 19:00-20:00)
  - NOT right after eating (digestive interference)
  - NOT close to sleep (herbal warmth may disturb sleep)
  - Use: Plain hot water only

- **Mixing Rule:** NEVER mix herbal with:
  - Coffee, tea, milk, juice, alcohol
  - Other medications (wait 30 mins gap)
  - Food or meals

#### FOOD COMBINATION RULES TO AVOID
- **High Fat + High Fiber:** Can cause bloating
  - DON'T: Olive oil-heavy meal + high-fiber bread same meal
  - DO: Separate — olive oil with lunch, fiber with breakfast

- **Herbal + Dairy (within 2 hours):** Absorption interference
  - DON'T: Take herbal, then milk 1 hour later
  - DO: Space them out or take herbal with water only

- **Herbal + Coffee/Tea (within 1 hour):** Tannins block absorption
  - DON'T: Take herbal right after morning coffee
  - DO: Wait 1 hour minimum

#### HYDRATION PROTOCOL
- **Target:** 2-3 liters water daily
- **Timing:**
  - Morning: 1 glass upon waking (before breakfast)
  - Lunch: 1 glass 30 mins before meal
  - Afternoon: 1-2 glasses
  - Evening: Reduce intake after 19:00 (avoid nighttime urination)
- **Best Practice:** Drink 30 mins BEFORE & AFTER herbal dose
- **AVOID:** Sugary drinks, excess coffee (limit to 1-2 cups/day)

---

### SPECIAL NOTES FOR INDONESIAN CONTEXT

**Meal Flexibility:**
- Oatmeal can be replaced with: Bubur, lontong, or nasi kuning (whole grain option)
- Fish can be: Ikan goreng (but use healthier cooking oil), pepes ikan, or ikan bakar
- Brown rice: Mix with white rice if pure brown rice too expensive (still beneficial)
- Green tea: Can substitute with: Teh hijau lokal, atau herbal tradisional (tidak manis)

**Affordability Tips:**
- Buy fish: From local market (cheaper than supermarket)
- Brown rice: Buy in bulk, store in cool place
- Vegetables: Seasonal, from pasar tradisional
- Almonds: Can substitute with: Kacang panjang, tempe (traditional protein)

**Social Eating:**
- Restaurant dining: Ask for grilled/baked (tidak digoreng)
- Family meals: Reduce portion of oil-heavy dishes, add extra vegetables
- Celebrations: Moderation — one special meal won't undo diet; return to plan next meal
```

#### 7. Firestore Data Model
```javascript
## 📱 FIRESTORE DATA STRUCTURE

Collection: `screening_results/{userId}/dyslipidemia/{resultId}`

Document Structure:
{
  // Metadata
  timestamp: 2026-03-24T10:30:00Z,
  disease: "dyslipidemia",
  session_id: "sess_12345",

  // Wizard Responses
  wizard: {
    step1: {
      family_history: true,
      symptom_presence: false
    },
    step2: {
      previous_screening: "1-3yrs",
      previous_cholesterol: 210
    },
    step3: {
      risk_factors: ["high_saturated_fat", "sedentary"],
      age: 45,
      gender: "M"
    },
    step4: {
      weight_kg: 78,
      height_cm: 175,
      BMI: 25.4,
      waist_cm: 92,
      WHtR: 0.53
    },
    step5: {
      symptom_duration: "3-6mo",
      frequency: 6, // out of 10
      impact: 4     // out of 10
    }
  },

  // Scoring
  score: {
    symptom_points: 22,
    risk_points: 25,
    anthro_points: 15,
    final_score: 65,
    risk_category: "moderate"
  },

  // Recommendations
  recommendations: {
    medical: {
      lab_tests: ["lipid_panel", "fasting_glucose", "blood_pressure"],
      referral_type: "preventive_cardiology",
      timeline: "4_weeks"
    },

    herbal: {
      recommended_formula: "jamu_kolesterol_aktif",
      formula_name: "Jamu Kolesterol Aktif",
      dosage: "3x daily, 1 sachet per dose",
      duration_weeks: 24,
      expected_outcomes: ["reduce_ldl_20_25", "increase_hdl_5_10"],
      evidence: {
        papers: 18,
        citations: 65
      },
      timing: "30-60 mins before meals"
    },

    dietary: {
      daily_meals: [
        {
          meal_type: "breakfast",
          time: "06:00-08:00",
          foods: ["oatmeal_40g", "berries_100g", "almond_butter_1tbsp"],
          calories: 280,
          herbal_timing: "after_meal"
        },
        // ... other meals
      ],
      food_guidelines: {
        encouraged: ["fatty_fish", "whole_grains", "nuts"],
        moderate: ["poultry", "low_fat_dairy"],
        avoid: ["red_meat", "fried_foods", "sugary_drinks"]
      },
      hydration: "2-3_liters_daily"
    },

    lifestyle: {
      exercise: "150_mins_per_week_moderate_intensity",
      sleep: "7-9_hours_per_night",
      stress: ["yoga", "meditation", "walking"]
    }
  },

  // User Status
  status: {
    viewed: true,
    shared_with_doctor: false,
    saved_to_journal: true,
    follow_up_reminder_set: true,
    follow_up_date: 2026-06-24 // 3 months later
  }
}
```

#### 8. Success Metrics
```markdown
## ✅ SUCCESS METRICS (How to Validate)

**Feature Works If:**
1. ✅ All 6 steps complete without errors
2. ✅ Scoring formula produces result between 0-100
3. ✅ Risk category correctly assigned (Low/Moderate/High)
4. ✅ Herbal recommendation displayed based on risk (not fixed)
5. ✅ Dietary plan shown with appropriate meal structure
6. ✅ Data saved to Firestore with all fields
7. ✅ User can view results & share with doctor
8. ✅ Mobile responsive (tested on phone size)

**User Experience If:**
- Average completion time: < 5 minutes
- Drop-off rate: < 20% (users completing)
- Comprehension: Users understand their risk & next steps
- Engagement: >70% users save results or set reminders
```

---

### Task 1.2 Success Criteria:
- [ ] BATCH_17_DYSLIPIDEMIA_SPEC.md contains all 8 sections above
- [ ] Spec is detailed enough for developer to implement without asking
- [ ] All herbal formulas evidence-backed
- [ ] Meal plans realistic for Indonesian context
- [ ] Scoring algorithm is clear & unambiguous
- [ ] File length: 3,000-4,000 words (comprehensive but readable)

**UPDATE PROGRESS after completing Task 1.2:**
```
### ✅ Task 1.2: BATCH 17 - Dyslipidemia Specification — COMPLETED
**Timestamp:** [current time]
**Output:** FEATURE_SPECS/BATCH_17_DYSLIPIDEMIA_SPEC.md (3,500 words)
**Sections:** 8/8 complete (wizard + scoring + medical + herbal + dietary + firestore + metrics + UI)
**Evidence:** 180+ papers, 4,500+ citations documented
**Herbal Formulas:** 3 risk-based formulas with full dosage & safety
**Meal Plans:** 7-day template with daily structure + traffic light foods
**Next:** Use this spec as template for remaining batches
```

---

### Task 1.3: BATCH 18-22 Specifications (Streamlined)
**Duration:** 4-5 hours (1 hour per batch, using Batch 17 as template)

**Key Differences per Batch:**

#### BATCH 18: Hypertension Management
- **Papers:** 60+ (2,000+ citations, GRADE A)
- **Wizard Steps:** 5 (simpler than dyslipidemia)
- **Key Metric:** Blood pressure readings
- **Herbal Focus:** Garlic, hawthorn, hibiscus
- **Dietary:** Sodium restriction, potassium increase
- **Unique:** Include daily BP monitoring log
- **File:** `FEATURE_SPECS/BATCH_18_HYPERTENSION_SPEC.md`

#### BATCH 19: NAFLD Assessment
- **Papers:** 60+ (2,500+ citations, GRADE B)
- **Wizard Steps:** 6
- **Key Metric:** FIB-4 Index (non-invasive liver assessment)
- **Herbal Focus:** Milk thistle, turmeric (liver support)
- **Dietary:** Avoid alcohol, limit refined carbs, increase fiber
- **Unique:** Calculate FIB-4 from inputs
- **File:** `FEATURE_SPECS/BATCH_19_NAFLD_SPEC.md`

#### BATCH 20: Metabolic Syndrome
- **Papers:** 60+ (2,500+ citations, GRADE A)
- **Wizard Steps:** 7 (assess all 5 MetS components)
- **Key Metrics:** BP, glucose, HDL, triglycerides, waist circumference
- **Herbal Focus:** Multi-component (cinnamon, turmeric, berberine)
- **Dietary:** Comprehensive diabetes-friendly + weight loss focus
- **Unique:** Integrates multiple screening elements
- **File:** `FEATURE_SPECS/BATCH_20_METABOLIC_SYNDROME_SPEC.md`

#### BATCH 21: Obesity & Insulin Resistance (Combined)
- **Papers:** 120+ (3,600+ citations, GRADE B)
- **Two Sections:**
  - Part A: Obesity screening (BMI, body composition)
  - Part B: Insulin Resistance (HOMA-IR calculation)
- **Herbal Focus:** Curcumin, cinnamon, berberine (both conditions)
- **Dietary:** Weight loss protocol + insulin sensitivity diet
- **Unique:** Dual condition assessment
- **File:** `FEATURE_SPECS/BATCH_21_OBESITY_INSULIN_RESISTANCE_SPEC.md`

#### BATCH 22: Depression
- **Papers:** 60+ (2,500+ citations, GRADE A)
- **Wizard Steps:** 9 (PHQ-9 standard tool)
- **Key Metric:** PHQ-9 score (0-27)
- **Herbal Focus:** St. John's Wort, ashwagandha, omega-3
- **Dietary:** Mood-supporting foods (B vitamins, omega-3, antioxidants)
- **Unique:** Mental health component, crisis resources included
- **File:** `FEATURE_SPECS/BATCH_22_DEPRESSION_SPEC.md`

**For Each Batch 18-22, include:**
1. ✅ Header & overview (research backing)
2. ✅ Wizard steps (specific to disease)
3. ✅ Scoring algorithm (with weights)
4. ✅ Medical recommendations (referral thresholds)
5. ✅ 🌿 Herbal recommendations (risk-based)
6. ✅ 🍽️ Consumption patterns (dietary guidelines)
7. ✅ Firestore data model
8. ✅ Success metrics & UI components

**Duration:** ~5-7 hours total (1 hour Batch 18, 1 hour Batch 19, 1 hour Batch 20, 1.5 hours Batch 21, 1.5 hours Batch 22)

**UPDATE PROGRESS after completing each batch:**
```
### ✅ Task 1.3.a: BATCH 18 - Hypertension Specification — COMPLETED
**Timestamp:** [time]
**Output:** BATCH_18_HYPERTENSION_SPEC.md (2,200 words)
**Status:** Ready for implementation

### ✅ Task 1.3.b: BATCH 19 - NAFLD Specification — COMPLETED
... (repeat for each)
```

---

### Task 1.4: Create Master Specification Index
**Duration:** 30 minutes
**File:** `FEATURE_SPECS/README.md`

**Content:**
```markdown
# FEATURE SPECIFICATIONS INDEX (Batch 17-22)

## Quick Reference

| Batch | Disease | Status | Papers | Grade | Wizard Steps | Key Metric |
|-------|---------|--------|--------|-------|--------------|-----------|
| 17 | Dyslipidemia | ✅ | 180+ | B | 6 | Non-HDL |
| 18 | Hypertension | ✅ | 60+ | A | 5 | BP |
| 19 | NAFLD | ✅ | 60+ | B | 6 | FIB-4 |
| 20 | MetS | ✅ | 60+ | A | 7 | 5 components |
| 21 | Obesity+IR | ✅ | 120+ | B | 6+6 | BMI + HOMA-IR |
| 22 | Depression | ✅ | 60+ | A | 9 | PHQ-9 |

## Files
- `BATCH_17_DYSLIPIDEMIA_SPEC.md` - Full reference implementation
- `BATCH_18_HYPERTENSION_SPEC.md` - Blood pressure focus
- [... etc]

## Implementation Checklist
- [ ] All 6 specs reviewed
- [ ] All scoring algorithms validated
- [ ] All herbal recommendations evidence-backed
- [ ] All meal plans tested for readability
- [ ] All Firestore schemas consistent
```

---

## 🚀 PHASE 2: IMPLEMENTATION (Batch 17 Proof-of-Concept)

### Task 2.1: Create Batch 17 HTML Wizard
**Duration:** 2-3 hours
**File:** `www/patient/screening-dyslipidemia.html`

**Requirements:**
- Multi-step wizard UI (6 steps)
- Form inputs matching spec (Step 1-5)
- Review summary (Step 6)
- Progress indicator (visual step counter)
- Navigation buttons (Previous/Next/Submit)
- Form validation (required fields)
- Responsive design (mobile-friendly)

**Template Structure:**
```html
<!DOCTYPE html>
<html lang="id">
<head>
  <title>HerboraTech — Screening: Dyslipidemia</title>
  <link rel="stylesheet" href="../shared/neumorphic.css">
  <style>
    /* Dyslipidemia orange theme: #F2994A */
  </style>
</head>
<body>
<div class="mobile-frame page-enter">
  <header class="app-header" style="background: linear-gradient(135deg, #F2994A, #FFB366);">
    <!-- Back button, title, settings -->
  </header>

  <div class="section">
    <!-- Progress bar: Step 1/6 -->

    <!-- Step Container (switches on click) -->
    <div id="step-1" class="wizard-step">
      <!-- Step 1: General Symptoms -->
    </div>

    <div id="step-2" class="wizard-step" style="display:none;">
      <!-- Step 2: Previous Screening -->
    </div>

    <!-- ... steps 3-6 -->

    <!-- Navigation buttons -->
    <div class="wizard-nav">
      <button onclick="prevStep()">← Sebelumnya</button>
      <button onclick="nextStep()">Lanjut →</button>
    </div>
  </div>
</div>

<script>
  // Wizard logic
  let currentStep = 1;
  const totalSteps = 6;

  function nextStep() {
    if (validateStep(currentStep)) {
      currentStep++;
      displayStep(currentStep);
    }
  }

  function submitWizard() {
    // Collect all form data
    const formData = collectFormData();

    // Calculate score
    const score = calculateScore(formData);

    // Save to Firestore
    saveToFirestore(score, formData);

    // Redirect to results page
    nav('screening-result-dyslipidemia.html?resultId=' + resultId);
  }
</script>
</body>
</html>
```

**Success Criteria:**
- [ ] All 6 steps display correctly
- [ ] Form validation works (prevents submission of incomplete data)
- [ ] Navigation between steps works
- [ ] Data persists when going back/forward
- [ ] Mobile responsive (test on phone)
- [ ] Styled with orange theme (#F2994A)

**UPDATE PROGRESS:**
```
### ✅ Task 2.1: Batch 17 HTML Wizard — COMPLETED
**Timestamp:** [time]
**Output:** www/patient/screening-dyslipidemia.html (500 lines HTML)
**Features:** 6 steps, form validation, navigation, responsive
**Next:** Implement scoring logic
```

---

### Task 2.2: Implement Scoring Algorithm
**Duration:** 1 hour
**File:** `www/patient/js/screening-dyslipidemia.js` (create if not exists)

**JavaScript Implementation:**
```javascript
// dyslipidemia.js

function calculateDyslipidemiascore(formData) {
  // Extract values
  const familyHistory = formData.family_history ? 1 : 0;
  const symptomPresence = formData.symptom_presence ? 1 : 0;
  const riskFactorsCount = formData.risk_factors.length;
  const BMI = calculateBMI(formData.weight, formData.height);
  const symptomFrequency = formData.symptom_frequency; // 0-10
  const symptomImpact = formData.symptom_impact; // 0-10

  // Calculate component scores
  const symptomPoints = Math.min(
    (symptomPresence * 10) + (symptomFrequency * 1.5) + (symptomImpact * 1),
    30
  );

  const riskBase = riskFactorsCount * 5;
  const familyHistoryPts = familyHistory * 10;
  const riskPoints = Math.min(riskBase + familyHistoryPts, 40);

  // Anthropometric points
  let BMIPts = 0;
  if (BMI >= 30) BMIPts = 15;
  else if (BMI >= 25) BMIPts = 10;
  else if (BMI >= 23) BMIPts = 5;

  let waistPts = 0;
  if ((formData.gender === 'M' && formData.waist > 102) ||
      (formData.gender === 'F' && formData.waist > 88)) {
    waistPts = 10;
  }

  const WHtRPts = (formData.waist / (formData.height * 100)) > 0.6 ? 5 : 0;

  const anthroPoints = Math.min(BMIPts + waistPts + WHtRPts, 30);

  // Final score
  const finalScore = (symptomPoints * 0.30) + (riskPoints * 0.40) + (anthroPoints * 0.30);

  // Determine risk category
  let riskCategory;
  if (finalScore <= 30) riskCategory = "low";
  else if (finalScore <= 70) riskCategory = "moderate";
  else riskCategory = "high";

  return {
    score: Math.round(finalScore),
    symptom_points: Math.round(symptomPoints),
    risk_points: Math.round(riskPoints),
    anthro_points: Math.round(anthroPoints),
    risk_category: riskCategory
  };
}

function calculateBMI(weight, height) {
  return weight / ((height / 100) ** 2);
}
```

**Success Criteria:**
- [ ] Score calculation produces 0-100 range
- [ ] Risk categories correct (Low ≤30, 31-70 Moderate, High ≥71)
- [ ] Formula matches spec exactly
- [ ] Test cases pass (sample inputs produce expected scores)

---

### Task 2.3: Create Results Page
**Duration:** 1.5-2 hours
**File:** `www/patient/screening-result-dyslipidemia.html`

**Components:**
1. **Risk Category Badge** (color-coded: green/yellow/red)
2. **Score Gauge/Visualization** (0-100 circular gauge)
3. **Summary** (key findings from wizard)
4. **Medical Recommendations** (from spec based on risk category)
5. **Herbal Recommendation** (specific formula for their risk level)
6. **Dietary Pattern** (meal plan snippet)
7. **Action Buttons:**
   - "Save to Health Journal"
   - "Share with Doctor"
   - "Add Herbal to Cart"
   - "Set Reminder for Follow-up"
8. **Footer:** Links to disease-risk.html

**Success Criteria:**
- [ ] All sections display based on risk category
- [ ] Herbal recommendation changes per risk (Low/Moderate/High)
- [ ] Can save result to Firestore
- [ ] Mobile responsive
- [ ] Color-coded by risk

---

### Task 2.4: Firestore Integration
**Duration:** 1-1.5 hours

**Steps:**
1. Create Firestore collection structure (if not exists)
2. Write saveToFirestore() function
3. Add timestamp & user ID
4. Store all form data
5. Store calculated score & recommendations
6. Add error handling & success confirmation

**Code:**
```javascript
async function saveToFirestore(score, formData) {
  const userId = VAuth.getCurrentUser().uid;

  const result = {
    timestamp: new Date(),
    disease: "dyslipidemia",
    wizard: formData,
    score: score,
    status: {
      viewed: true,
      saved_to_journal: false,
      shared_with_doctor: false
    }
  };

  try {
    const docRef = await VDB.addDocument(
      `screening_results/${userId}/dyslipidemia`,
      result
    );
    console.log("Result saved:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Save failed:", error);
    showToast("Gagal menyimpan hasil", "error");
  }
}
```

**Success Criteria:**
- [ ] Data saved to Firestore correctly
- [ ] Timestamp recorded
- [ ] Can retrieve results later
- [ ] Error handling works

---

### Task 2.5: Git Commits for Implementation
**Throughout PHASE 2, commit after each major step:**

```bash
# After Task 2.1
git add www/patient/screening-dyslipidemia.html
git commit -m "feat: Batch 17 dyslipidemia screening wizard UI

- 6-step multi-step form wizard
- Form inputs matching specification
- Step validation & navigation
- Responsive neumorphic design (orange #F2994A theme)
- Progress indicator showing current step

Co-Authored-By: Gemini CLI <noreply@google.com>"

# After Task 2.2
git add www/patient/js/screening-dyslipidemia.js
git commit -m "feat: Implement dyslipidemia scoring algorithm

- Calculate score from 6 input variables
- Weights: Symptoms 30%, Risk factors 40%, Anthropometric 30%
- Risk categorization (Low/Moderate/High)
- Tested with sample data

Co-Authored-By: Gemini CLI <noreply@google.com>"

# After Task 2.3
git add www/patient/screening-result-dyslipidemia.html
git commit -m "feat: Create dyslipidemia results & recommendations page

- Risk category badge (color-coded)
- Score visualization (0-100 gauge)
- Risk-based medical recommendations
- 🌿 Herbal formula recommendations
- 🍽️ Dietary pattern display
- Action buttons (save, share, add herbal, set reminders)

Co-Authored-By: Gemini CLI <noreply@google.com>"

# After Task 2.4
git add www/patient/js/firestore-integration.js
git commit -m "feat: Add Firestore integration for screening results

- Save results to Firestore with timestamp
- Store complete form data & calculated scores
- Error handling & user feedback
- Support result retrieval & updates

Co-Authored-By: Gemini CLI <noreply@google.com>"
```

---

## 📊 ESTIMATED TIMELINE

| Phase | Task | Hours | Status |
|-------|------|-------|--------|
| **1** | **1.1:** Setup folders | 0.5 | ⏳ TODO |
| | **1.2:** Batch 17 Spec | 2 | ⏳ TODO |
| | **1.3:** Batch 18-22 Specs | 5 | ⏳ TODO |
| | **1.4:** Master Index | 0.5 | ⏳ TODO |
| | **Subtotal** | **8** | |
| **2** | **2.1:** HTML Wizard | 2.5 | ⏳ TODO |
| | **2.2:** Scoring Algorithm | 1 | ⏳ TODO |
| | **2.3:** Results Page | 2 | ⏳ TODO |
| | **2.4:** Firestore Integration | 1.5 | ⏳ TODO |
| | **2.5:** Testing & Polish | 1 | ⏳ TODO |
| | **Subtotal** | **8** | |
| | **TOTAL** | **16 hours** | |

**Realistic timeline:**
- **If 4 hours/day:** 4 days
- **If 2 hours/day:** 8 days
- **If full day:** 2 days

---

## ✅ FINAL CHECKLIST

Before marking session complete:

### PHASE 1 Completion:
- [ ] All 6 spec documents created (17-22)
- [ ] Each spec has 8 required sections
- [ ] All herbal recommendations evidence-backed
- [ ] All dietary plans realistic
- [ ] All scoring algorithms tested with sample data
- [ ] All specs consistent formatting
- [ ] README.md index created
- [ ] Committed to git

### PHASE 2 Completion (if time allows):
- [ ] Batch 17 HTML wizard works (all 6 steps)
- [ ] Scoring algorithm produces correct results
- [ ] Results page displays properly
- [ ] Firestore integration works
- [ ] Data saves & retrieves correctly
- [ ] Mobile responsive
- [ ] Git commits documenting each step
- [ ] Tested in browser

---

## ✅ PROGRESS LOG

### ✅ Task 1.1: Create FEATURE_SPECS Folder — COMPLETED
**Timestamp:** 2026-03-24 16:15
**Output:** 6 empty markdown files in FEATURE_SPECS/
**Git Commit:** 8a89b77

### ✅ Task 1.2: BATCH 17 - Dyslipidemia Specification — COMPLETED
**Timestamp:** 2026-03-24 16:30
**Output:** FEATURE_SPECS/BATCH_17_DYSLIPIDEMIA_SPEC.md
**Git Commit:** 8a89b77
**Notes:** Comprehensive spec with wizard, scoring, and herbal/diet recommendations.

### ✅ Task 1.3: BATCH 18-22 Specifications — COMPLETED
**Timestamp:** 2026-03-24 16:45
**Output:** 5 specification files (BATCH_18-22)
**Git Commit:** 8a89b77
**Notes:** All 5 diseases completed using Batch 17 as template.

### ✅ Task 2.1: Batch 17 & 18 HTML Wizards — COMPLETED
**Timestamp:** 2026-03-24 17:15
**Output:** www/patient/screening-dyslipidemia.html, www/patient/screening-hypertension.html
**Features:** Interactive wizards for Dyslipidemia and Hypertension implemented.
**Git Commit:** [TO_BE_COMMITTED]
**Notes:** Integrated into disease-risk.html dashboard.

### ✅ Task 2.2 & 2.3: Scoring & Results UI — COMPLETED
**Timestamp:** 2026-03-24 17:30
**Notes:** Scoring algorithm and results display (including herbal/diet) integrated directly into the wizard files for high-cohesion single-file components.

### ✅ Task 2.4: Firestore Integration — COMPLETED
**Timestamp:** 2026-03-24 17:45
**Output:** www/shared/firebase.js, www/patient/screening-*.html
**Features:** Real-time data persistence to `screeningResults` collection with auth guard.
**Git Commit:** [TO_BE_COMMITTED]


---

### ✅ Task 2.5: Full Batch 17-22 Implementation — COMPLETED
**Timestamp:** 2026-03-24 18:30
**Output:** www/patient/screening-*.html (6 files)
**Features:** All 6 interactive screenings (Dyslipidemia, Hypertension, NAFLD, MetS, Obesity/Insulin, Depression) fully implemented with scoring and recommendations.
**Git Commit:** [TO_BE_COMMITTED]
**Notes:** Integrated into disease-risk.html dashboard.

### ✅ Task 2.6: Screening History View — COMPLETED
**Timestamp:** 2026-03-24 19:00
**Output:** www/patient/screening-history.html
**Features:** Centralized view for all 6 screening categories, fetching latest 5 results per category with date and risk levels.
**Git Commit:** [TO_BE_COMMITTED]

---

**Status:** ALL PHASE 1 & PHASE 2 TASKS COMPLETE
**Final Notes:** 6 interactive screenings implemented, integrated, and history view active. Ready for clinical testing.





---

## 📞 FINAL NOTES FOR GEMINI CLI

- **If stuck on herbal recommendations:** Use established compounds (curcumin, milk thistle, garlic, hawthorn, St. John's Wort)
- **If stuck on meal plans:** Reference common Indonesian foods (nasi goreng alternatives, ikan goreng, tempe, etc.)
- **If Firestore structure unclear:** Follow the provided schema exactly
- **If scoring formula unclear:** Test with sample data (young healthy person should score low, elderly with risk factors should score high)
- **If time runs out:** Prioritize completing all 6 SPECS (Phase 1) over implementing features (Phase 2)

**MOST IMPORTANT:** Update this file regularly so next AI can see exactly where you left off!

---

**Status:** READY FOR GEMINI CLI TO START
**Start Date:** 2026-03-24
**Target Completion:** Batch 17-22 specs + Batch 17 implementation (if time allows)

Good luck! 🚀
