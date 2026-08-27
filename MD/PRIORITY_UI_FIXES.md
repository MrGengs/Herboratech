# 🚨 PRIORITY UI/UX FIXES — 3 Critical Issues

**Date:** 2026-03-24
**Status:** Identified & Ready to Fix
**Est. Time:** 2-3 hours total

---

## ISSUE #1: Checkboxes Don't Toggle ✅ FIXING

**Location:** `patient/health-profile.html` — Step 3 "Kondisi Diketahui"

**Problem:**
- User clicks checkbox (Diabetes, Hypertension, etc.) but nothing happens
- No visual feedback when clicking
- Data not saving

**Fix Applied:**
- ✅ Added JavaScript event listeners to all checkboxes
- ✅ Added auto-save on checkbox change
- ✅ Added visual feedback (CSS class toggle)

**Status:** ✅ DONE

---

## ISSUE #2: Vital Signs Show Static Data ⏳ FIXING NOW

**Locations:**
- `patient/home.html` — Vital Mini section (lines 137-145)
- `patient/monitoring.html` — Real-time vitals
- Charts showing hardcoded values: HR=78, SpO2=98, Temp=36.5

**Problem:**
- Sparklines are placeholders (empty divs)
- Values don't update with real data from VitalsManager
- No animations when new data arrives
- Graphics are decorations, not functional

**Root Cause:**
- Vital data loaded by VitalsManager but not connected to UI display
- Missing JavaScript to render SVG sparklines
- Missing animation logic

**Fix Strategy:**
1. Load real vital data from VitalsManager/Firestore
2. Create SVG sparklines dynamically
3. Update values in real-time (every 5-10 seconds)
4. Add smooth animations when values change
5. Show 24-hour trend data in sparklines

**Implementation:**
- Update `home.html` JavaScript section
- Create helper function `renderVitalSparkline()`
- Connect to VitalsManager.subscribe()
- Add CSS animations for value changes

**Status:** ⏳ IN PROGRESS

---

## ISSUE #3: Search Button Doesn't Work ❌ NEEDS FIX

**Location:** `patient/herbal.html` — Header search icon

**Problem:**
- Search icon button (🔍) is visible but clicking does nothing
- Search input field exists but typing doesn't filter results
- Category tabs (Katalog, Formula, Rekomendasi AI) show static data

**Screenshot:** Search box shows placeholder "Cari tanaman obat..."

**Root Cause:**
- Search icon button likely has no `onclick` handler
- Search input has no event listener for `oninput`
- No filter logic implemented

**Fix Strategy:**
1. Add `onclick="toggleSearch()"` to search icon
2. Add `oninput="filterHerbals()"` to search input
3. Implement filter logic in JavaScript
4. Update display based on search term

**Implementation:**
- Add search state management
- Create `filterHerbals(searchTerm)` function
- Filter both name and properties
- Show "No results" message if needed

**Status:** ❌ NOT STARTED

---

## Execution Order

### Phase 1 (NOW):
1. ✅ Issue #1 — Checkboxes (DONE)
2. ⏳ Issue #2 — Vital Signs (IN PROGRESS)
3. ❌ Issue #3 — Search (TO DO)

### Phase 2 (After fixes verified):
- Test on real device
- Check Firestore saving
- Verify animations smooth
- Confirm search filters work

---

## Success Criteria

| Issue | Before | After | Status |
|-------|--------|-------|--------|
| **Checkboxes** | Won't toggle | Click = instant feedback | ✅ |
| **Vital Signs** | Hardcoded 78/98/36.5 | Real data animates | ⏳ |
| **Search** | Button doesn't work | Type = filtered results | ❌ |

---

## Files to Modify

```
patient/
├── health-profile.html     ✅ DONE
├── home.html               ⏳ IN PROGRESS
├── monitoring.html         ⏳ IN PROGRESS
├── herbal.html             ❌ TODO
└── health-dashboard.html   ⏳ IN PROGRESS (vital cards)
```

---

## Next: Issue #2 (Vital Signs) Implementation
