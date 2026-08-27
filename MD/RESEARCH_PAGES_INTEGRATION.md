# 🔗 Research Pages Integration Guide

This guide explains how to link the 15 research pages to the HERBORATECH Patient UI.

---

## 🎯 STRATEGY 1: Disease Risk Dashboard (`disease-risk.html`)

Each disease card in the dashboard should include a small "Research Backed" badge or a link to the scientific evidence.

### **HTML Implementation (Example: Dyslipidemia Card)**
```html
<div class="neu-card disease-card" data-disease="dyslipidemia">
  <div class="card-header">
    <div class="icon orange"><ion-icon name="pulse-outline"></ion-icon></div>
    <div class="title">Dyslipidemia</div>
  </div>
  <div class="card-body">
    <p>Risiko perlemakan darah & kolesterol.</p>
    <a href="research-dyslipidemia.html" class="research-badge">
      <ion-icon name="beaker-outline"></ion-icon> 180+ Papers
    </a>
  </div>
</div>
```

---

## 🎯 STRATEGY 2: Screening Wizard Intro (Step 0)

When a user starts a screening (e.g., Hypertension), show the research backing to build trust.

### **Template Content for Step 0:**
> "Screening ini dikembangkan berdasarkan **Systematic Literature Review (SLR)** terhadap **60+ paper penelitian terbaru (2015-2026)** dengan total **2,000+ sitasi**. [Lihat Detail Penelitian](research-hypertension.html)"

---

## 🎯 STRATEGY 3: Research Hub (`research-hub.html`)

A dedicated page for scientifically-minded patients or doctors.

### **Structure:**
- **Hero Section**: "Our Scientific Foundation" (Total 1,020+ papers).
- **Search Bar**: Search diseases or metrics.
- **Disease List**: 15 cards with Grade (A/B/C) and link to detail page.
- **Methodology Link**: Link to `SLR_METHODOLOGY_FRAMEWORK.md` (or a simplified HTML version).

---

## 🎨 COLOR CODING (Consistency Guide)

Use these primary colors for headers and accents on the research pages:

| Disease | Primary Color | Secondary (Light) |
|---------|---------------|-------------------|
| Dyslipidemia | #F2994A (Orange) | #FFF5EB |
| Hypertension | #EB5757 (Red) | #FFEEEE |
| NAFLD | #2F80ED (Blue) | #EBF3FF |
| MetS | #6C63FF (Purple) | #F0EFFF |
| Obesity | #6FCF97 (Green) | #EFFFF5 |
| Thyroid | #2F80ED (Blue) | #EBF3FF |
| PCOS | #6C63FF (Purple) | #F0EFFF |
| OSA | #F2994A (Orange) | #FFF5EB |
| Gout | #F2C94C (Yellow) | #FFFDEB |
| Depression | #4A235A (Indigo) | #F4EEF7 |
| Insulin Resist | #6FCF97 (Green) | #EFFFF5 |
| Diabetic Comp | #EB5757 (Red) | #FFEEEE |
| Osteoporosis | #A0826D (Brown) | #F7F3F0 |
| Hypogonadism | #2C5282 (Navy) | #EBF1F7 |
| CKD Extended | #5DADE2 (Sky Blue) | #F0F8FF |

---

## 🛠️ NAVIGATION HELPERS

Add these to your `app.js` or global navigation handler:

```javascript
// Example helper to navigate to research detail
function openResearch(diseaseId) {
    const pages = {
        'dyslipidemia': 'research-dyslipidemia.html',
        'hypertension': 'research-hypertension.html',
        'nafld': 'research-nafld.html',
        'metabolic_syndrome': 'research-metabolic-syndrome.html',
        'obesity': 'research-obesity.html',
        // ... add all 15
    };
    window.location.href = pages[diseaseId] || 'disease-risk.html';
}
```

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] Ensure `neumorphic.css` is available in `shared/`.
- [ ] Ensure `app.js` handles the `nav()` function correctly.
- [ ] Verify `ion-icon` library is loaded.
- [ ] Check back-button functionality on all 15 pages.
- [ ] Verify that 100% of the pages are responsive on mobile (iOS/Android).
