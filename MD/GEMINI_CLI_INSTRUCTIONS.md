# 🚀 GEMINI CLI EXECUTION INSTRUCTIONS — Herbal SLR Integration Phase 2

**Project**: HerboraTech Herbal Medicine SLR Integration
**Status**: 75% complete (documentation done, integration pending)
**Token Budget**: Use Gemini CLI's larger token pool for Phase 2 execution
**Timeline**: Execute all 14 tasks in 2-3 batches
**Date Created**: 2026-03-24

---

## 📋 CONTEXT & BACKGROUND

**Completed Work (Phase 1)**:
- ✅ HERBAL_SLR_PROTOCOL.md (1,200 lines) — SLR methodology with 7 herbal categories
- ✅ HERBAL_DATA_EXTRACTION_TABLE.md (1,500 lines) — 50+ papers with DOI links
- ✅ HERBAL_GRADE_ASSESSMENT.md (1,400 lines) — GRADE quality assessment
- ✅ www/material-research/index.html (400 lines) — Unified SLR portal (3 tabs)

**Pending Work (Phase 2)**:
- 🔄 5 herbal web pages (protocol, extraction, grade, formulas, presentation)
- 🔄 3 landing page integrations (index.html, profile.html, herbal pages)
- 🔄 14 tasks total (see task list below)
- 🔄 Firebase deployment

---

## 🎯 EXECUTION PLAN (14 Tasks)

### BATCH 1 — Herbal Web Pages (High Priority)

**Task 1: Create www/material-research/herbal-protocol.html**
- Source: `HERBAL_SLR_PROTOCOL.md` (line 1-376)
- Template: Mirror `www/slr-portal/protocol.html` structure
- Include sections:
  * Header (title + description)
  * Research questions (8 questions)
  * Inclusion/exclusion criteria (herbal categories)
  * Search strategy (databases + keywords)
  * Study selection (2-stage screening)
  * Data extraction framework (25+ elements)
  * GRADE methodology
  * Safety assessment
  * PRISMA checklist
  * Implementation timeline
- Design: Use neumorphic.css, herbal color variant (#27AE60)

**Task 2: Create www/material-research/herbal-extraction.html**
- Source: `HERBAL_DATA_EXTRACTION_TABLE.md` (line 1-1500)
- Create interactive data table with:
  * Filtering by herbal remedy (dropdown)
  * Sortable columns: Remedy, Year, Journal, Design, Grade, Effect Size
  * Expandable rows showing:
    - Author + DOI (clickable link)
    - Study design, population N, duration
    - Intervention details (extract type, dose)
    - Biomarkers + effect sizes (%)
    - GRADE rating
    - Safety profile
    - Adverse events
  * 50+ paper entries organized by remedy
- Reference table structure: `www/slr-portal/extraction.html`

**Task 3: Create www/material-research/herbal-grade.html**
- Source: `HERBAL_GRADE_ASSESSMENT.md` (line 1-1400)
- Content:
  * Summary table: 7 herbals with Grade A-C ratings
  * Per-herbal GRADE assessment cards showing 5 domains:
    - Risk of Bias
    - Inconsistency
    - Indirectness
    - Imprecision
    - Publication Bias
  * Safety profile summary
  * Drug-herb interaction warnings (table)
  * Clinical recommendation badges:
    - ✅ Recommended (Grade A-B)
    - ⚠️ Adjunctive (Grade C)
    - ❌ Insufficient Evidence (Grade D)
- Reference: `www/slr-portal/grade.html`

**Task 4: Create www/material-research/herbal-formulas.html**
- NEW PAGE for traditional jamu formulas
- Organize by indication:
  * Anti-lipid formulas (dyslipidemia)
  * Anti-hypertension formulas (HTN)
  * Anti-diabetes formulas (T2DM)
  * Liver support formulas (NAFLD)
  * Metabolic balance formulas
- Per-formula display:
  * Name (Indonesian + scientific)
  * Indication + mechanism
  * Ingredients list (with quantities + evidence grades)
  * Preparation method (step-by-step)
  * Dosage + duration
  * Contraindications
  * Grade badge + DOI links to component papers
  * Sourcing notes (where to buy/prepare)

**Task 5: Create www/material-research/herbal-presentation.html**
- 20-slide interactive presentation
- Browser-based (keyboard + button navigation)
- Slide outline:
  1. Title slide — "Herbal Medicine Evidence: 50+ RCTs"
  2. SLR Overview — project scope, 50+ papers, 7 herbals
  3. PRISMA Methodology — systematic process + transparency
  4. Curcumin Evidence — 12 RCTs, Grade B, effects
  5. Green Tea Evidence — 15 RCTs, Grade B, weight loss
  6. Garlic Evidence — 10 RCTs, Grade B, BP reduction
  7. Ginger Evidence — 8 RCTs, Grade B, FPG reduction
  8. Cinnamon Evidence — 8 RCTs, Grade C, variable response
  9. Olive Leaf Evidence — 6 RCTs, Grade B, HTN benefit
  10. Traditional Indonesian — population studies, usage patterns
  11. GRADE Assessment — quality domains, certainty levels
  12. Safety Profile — adverse events, contraindications per remedy
  13. Drug-Herb Interactions — warfarin/garlic, DM meds, statins
  14. Mechanism Validation — human studies vs. proposed mechanisms
  15. Implementation in HerboraTech — recommendation algorithm
  16. Evidence Transparency — DOI links, credibility approach
  17. Research Gaps — standardization, long-term safety, combinations
  18. Future Directions — prospective validation, real-world adherence
  19. Conclusion — Grade B evidence supports clinical recommendation
  20. References — key landmark papers with citations
- Each slide: title + content + 2-3 key points + icon/visual + DOI links where relevant
- Navigation: arrow keys, prev/next buttons, slide counter

---

### BATCH 2 — Landing Page & App Integration (Medium Priority)

**Task 6: Update www/index.html — Add Material Research to Navigation**
- Find: `<nav class="navbar">` section
- Add link: `<a href="www/material-research/index.html">Material Research</a>`
- Position: After "Fitur" link, before "Cara Kerja" link
- Style: Consistent with existing nav links (neumorphic)

**Task 7: Update patient/profile.html — Add Material Research Menu Item**
- Find: Profile menu section (list of menu items)
- Add new menu item card:
  ```
  📚 Material Research
  Basis penelitian ilmiah HerboraTech
  (clicking → opens www/material-research/index.html in same tab)
  ```
- Position: After "Encyclopedia" item
- Design: Use neu-card styling, consistent with other menu items

**Task 8: Integrate Material Research into herbal.html**
- Add header card linking to Material Research portal
- Add GRADE badge + "See Evidence" link to each herbal item
- Link each herbal name to its GRADE assessment detail in herbal-grade.html
- Format: "Grade B (12 RCTs) — View Evidence →"
- Color-code badges: 🟢 Grade A/B (Recommended), 🟡 Grade C (Adjunctive), 🔴 Grade D (Insufficient)

**Task 9: Integrate Material Research into herbal-formula.html**
- Add component evidence section for each formula:
  * List each ingredient with Grade rating + DOI link
  * Example: "Curcumin (Grade B) [DOI: 10.1038/...]"
- Add formula-level recommendation badge
- Link to herbal-formulas.html (material-research) for detailed formula analysis
- Add "View Full Evidence" button → www/material-research/herbal-formulas.html

---

### BATCH 3 — Evidence Integration & Deployment (Medium Priority)

**Task 10: Add GRADE Badges to All Herbal Recommendations**
- Find all herbal recommendations in:
  * patient/herbal.html
  * patient/herbal-detail.html
  * patient/herbal-formula.html
- Add Grade badge (A/B/C/D) + certainty level:
  * Grade A: 🟢 "High Certainty — Recommended"
  * Grade B: 🟢 "Moderate Certainty — Recommended"
  * Grade C: 🟡 "Low Certainty — Adjunctive Use"
  * Grade D: 🔴 "Very Low — Insufficient Evidence"

**Task 11: Add DOI Links to All Herbal Evidence References**
- Every herbal recommendation must link to source papers
- Format: [Evidence] → clickable to source DOI
- Verify all DOI links are valid (from HERBAL_DATA_EXTRACTION_TABLE.md)
- Add "View all papers" link → herbal-extraction.html

**Task 12: Create herbal-evidence.html Detail Page** (OPTIONAL, Nice-to-Have)
- Single herbal detail page structure:
  * Herbal name + image/emoji
  * 3-4 evidence snippets (from extraction table)
  * GRADE rating summary
  * Dosage recommendations
  * Drug interactions
  * Contraindications
  * Link back to herbal detail page
- Later: herbal.html items can link here for deep-dive evidence

**Task 13: Update herbal-formula.html with Component Evidence**
- Each formula ingredient line becomes:
  * Ingredient name (Indonesian + scientific)
  * Quantity (grams)
  * Grade badge (A/B/C)
  * DOI link (clickable) → source paper
- Add formula-level GRADE badge at top
- Link to www/material-research/herbal-formulas.html for full analysis

**Task 14: Deploy to Firebase Hosting**
```bash
# Navigate to project directory
cd c:\Users\mosto\Desktop\HERBORATECH

# Verify all changes committed
git status

# Deploy to Firebase
firebase deploy --only hosting

# Verify deployment
firebase open hosting:site
```

---

## 📂 FILE REFERENCE & TEMPLATES

### Reference Pages (Use as Structure Template)
- `www/slr-portal/protocol.html` — Protocol page structure
- `www/slr-portal/extraction.html` — Data table structure
- `www/slr-portal/grade.html` — GRADE assessment structure
- `www/slr-portal/presentation.html` — Presentation slide structure

### Source Markdown Files (Convert to HTML)
- `HERBAL_SLR_PROTOCOL.md` — Full protocol text
- `HERBAL_DATA_EXTRACTION_TABLE.md` — 50+ paper entries + metadata
- `HERBAL_GRADE_ASSESSMENT.md` — GRADE quality ratings + safety data

### Design System
- `shared/neumorphic.css` — All CSS classes available
- Herbal color: `#27AE60` (green), Primary: `#6C63FF` (purple)
- Use existing classes: `neu-card`, `neu-btn-primary`, `neu-chip`, `neu-table`, etc.

### Key HTML Boilerplate
```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HerboraTech — [PAGE_TITLE]</title>
  <link rel="stylesheet" href="../../shared/neumorphic.css">
  <script type='module' src='https://unpkg.com/ionicons@5.0.0/dist/ionicons/ionicons.esm.js'></script>
  <script nomodule src='https://unpkg.com/ionicons@5.0.0/dist/ionicons/ionicons.js'></script>
</head>
<body>
<div class="mobile-frame page-enter">
  <header class="app-header">
    <button class="neu-icon-btn" onclick="nav('index.html')">
      <ion-icon name="arrow-back-outline"></ion-icon>
    </button>
    <div style="font-size:1.05rem;font-weight:700;">[PAGE_TITLE]</div>
    <div style="width:42px"></div>
  </header>

  <!-- CONTENT HERE -->

</div>
<script src="../../shared/app.js"></script>
</body>
</html>
```

---

## ✅ QUALITY CHECKLIST

Before deploying, verify:
- [ ] All 5 herbal web pages created + styled
- [ ] All DOI links are clickable and valid
- [ ] All GRADE badges displayed correctly
- [ ] Material Research link added to index.html nav
- [ ] Profile menu item added to patient/profile.html
- [ ] Herbal pages integrated with evidence links
- [ ] 20-slide presentation created + navigable
- [ ] All pages tested on mobile view (172px width)
- [ ] No console errors in browser DevTools
- [ ] All images/emojis render correctly
- [ ] Firebase deployment successful
- [ ] Live URL accessible: https://herboratech.web.app

---

## 🔗 KEY DOCUMENTATION LINKS

**Task Tracking**:
- See: `C:\Users\mosto\.claude\projects\c--Users-mosto-Desktop-HERBORATECH\memory\slr_herbal_integration_progress.md`
- Todo list: Use `/tasks list` in Claude Code or check memory

**Project Context**:
- `CLAUDE.md` — UI design system rules
- `HERBORATECH\CLAUDE.md` — Project-specific instructions
- Memory files: `project_herboratech.md`, `feedback_patterns.md`

**Herbal SLR Sources**:
- `HERBAL_SLR_PROTOCOL.md` — Complete protocol
- `HERBAL_DATA_EXTRACTION_TABLE.md` — 50+ papers with DOI
- `HERBAL_GRADE_ASSESSMENT.md` — GRADE ratings + safety

---

## 🚀 EXECUTION COMMAND FOR GEMINI CLI

```
TASK: Execute Phase 2 of Herbal SLR Integration for HerboraTech

CONTEXT:
- Phase 1 completed: Documentation created (PROTOCOL, EXTRACTION, GRADE, MATERIAL_RESEARCH portal)
- Token constraint: Use Gemini CLI's token pool (larger than Claude Code weekly limit)
- User requirement: All DOI links must be clickable for credibility

INSTRUCTIONS:
1. Read GEMINI_CLI_INSTRUCTIONS.md (this file)
2. Read memory file: slr_herbal_integration_progress.md
3. Execute in order: BATCH 1 (tasks 1-5) → BATCH 2 (tasks 6-9) → BATCH 3 (tasks 10-14)
4. Reference structure from www/slr-portal/ pages for consistent styling
5. Use source markdown files (HERBAL_*.md) to populate content
6. Verify all DOI links are valid before completion
7. Deploy to Firebase: firebase deploy --only hosting
8. Test live URL: https://herboratech.web.app/www/material-research/index.html

REFERENCE FILES:
- HERBAL_SLR_PROTOCOL.md (protocol content)
- HERBAL_DATA_EXTRACTION_TABLE.md (50+ papers + DOI links)
- HERBAL_GRADE_ASSESSMENT.md (GRADE ratings + safety data)
- www/material-research/index.html (portal structure)
- www/slr-portal/ (reference page templates)
- CLAUDE.md (design system + coding conventions)

SUCCESS CRITERIA:
✅ All 5 herbal pages created (protocol, extraction, grade, formulas, presentation)
✅ Landing pages updated (index.html, profile.html)
✅ Herbal app pages integrated with evidence (herbal.html, herbal-formula.html)
✅ All DOI links clickable
✅ GRADE badges displayed
✅ 20-slide presentation navigable
✅ Firebase deployment successful
✅ No console errors
✅ Mobile-responsive (172px testing)

TIMELINE: ~2-3 hours execution with Gemini's token pool
PRIORITY: HIGH — User emphasized urgency due to Claude Code token limit (98% used)
```

---

**Last Updated**: 2026-03-24
**Status**: Ready for Gemini CLI execution
**Questions**: Refer to memory files or project CLAUDE.md
