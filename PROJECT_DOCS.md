# Antigravity AI — Fairness Platform
## Complete Project Documentation

---

## 1. What Is This Project?

**Antigravity AI** is a "Universal AI Fairness & Bias Detection" platform. Its purpose is to let organisations upload a CSV dataset, have it automatically analysed for **discriminatory patterns** across demographic groups, receive a fairness score, and then see simulated projections of how different **bias mitigation strategies** would improve that score — all in a premium, animated web interface.

### Core use-cases
| Use-case | Where it happens |
|---|---|
| Upload a dataset and get a bias audit | Dashboard tab |
| See per-group scores improve after mitigation | Metrics → Before/After panel |
| Track all past audits and strategies | Logs tab |
| Inspect accuracy vs. fairness trade-offs | Metrics → radar chart + strategy cards |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Runtime** | React 19 |
| **Styling** | Tailwind CSS v4 + custom CSS variables |
| **Fonts** | Inter (body), Newsreader (headings) via `next/font/google` |
| **Icons** | Material Symbols Outlined (Google CDN) |
| **CSV Parsing** | `papaparse` (npm) |
| **Charting** | Pure SVG (no external chart library) |
| **State** | React `useState` / `useEffect` (no Redux/Zustand) |
| **Persistence** | Browser `localStorage` for audit history |
| **API** | Next.js Route Handlers (server-side, same process as UI) |

---

## 3. Directory Structure

```
D:\new app\my-app\
├── backend/                  ← Original FastAPI Python backend (reference copy)
│   ├── main.py               ← The original Python bias analysis logic
│   └── requirements.txt      ← Python deps (fastapi, pandas, numpy, etc.)
│
├── sample_data/              ← Sample CSV files for testing
│   ├── finance_sample.csv
│   ├── healthcare_sample.csv
│   └── hiring_sample.csv
│
├── src/
│   ├── app/                  ← Next.js App Router root
│   │   ├── globals.css       ← Design system (all CSS variables + utility classes)
│   │   ├── layout.js         ← Root HTML shell (fonts, metadata, icon CDN)
│   │   ├── page.js           ← Main page — tab router + shared state
│   │   └── api/
│   │       ├── audit/
│   │       │   └── route.js  ← POST /api/audit — bias analysis engine
│   │       ├── history/
│   │       │   └── route.js  ← GET /api/history — mock history seed data
│   │       └── simulate/
│   │           └── route.js  ← POST /api/simulate — mitigation projections
│   │
│   ├── components/           ← All UI components (all are Client Components)
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── ErrorToast.js
│   │   ├── Dashboard.js
│   │   ├── AnalysisResults.js
│   │   ├── BiasChart.js
│   │   ├── ModelInspection.js
│   │   ├── ModelPerformanceChart.js
│   │   ├── BeforeAfterComparison.js
│   │   └── MitigationHistory.js
│   │
│   └── lib/
│       └── types.js          ← JSDoc type definitions + shared constants
│
└── PROJECT_DOCS.md           ← This file
```

---

## 4. How the App Starts (`layout.js` + `page.js`)

### `src/app/layout.js` — The HTML Shell
This is the **root server component** that wraps every page. It:
- Loads **Inter** and **Newsreader** from Google Fonts using `next/font/google` (zero layout shift)
- Injects the **Material Symbols Outlined** stylesheet in `<head>` for all icons
- Sets `suppressHydrationWarning` on `<html>` and `<body>` — this silences the hydration warning caused by browser extensions that add class names (like `antigravity-scroll-lock`) to the DOM before React hydrates
- Exports `metadata` (title, description) for SEO

### `src/app/page.js` — The Tab Router
This is the **root client component** (marked `"use client"`). It owns all **shared application state**:

```
┌─────────────────────────────────────────────────────┐
│  page.js  (shared state)                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ activeTab   │  │selectedDomain│  │analysisResult│ │
│  │ "dashboard" │  │ "Universal"  │  │ null → data│ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
           │passes down via props
    ┌──────┼──────────┬──────────────┐
    ▼      ▼          ▼              ▼
  Navbar  Dashboard  ModelInspection  MitigationHistory
```

Key pattern: `analysisResult` is held here so that after you run an audit on the **Dashboard**, the **Metrics** page can access those results without needing a database or API call.

---

## 5. API Routes (Backend Logic)

All three routes live in `src/app/api/`. They run **server-side** in the Next.js process — no separate Python/FastAPI server is needed.

---

### `POST /api/audit` — The Bias Analysis Engine

**File:** `src/app/api/audit/route.js`

**Purpose:** The core intelligence. Accepts a CSV file upload and a domain string, validates the dataset, then computes a per-group fairness score.

#### Request
```
Content-Type: multipart/form-data
FormData fields:
  file   — CSV file (must end in .csv)
  domain — "Universal" | "Healthcare" | "Finance" | "Hiring"
```

#### Processing pipeline (step by step)

```
1. Parse FormData → extract file + domain
2. Validate file exists and is a .csv
3. Parse CSV text with papaparse → rows[] + column headers[]
4. Domain Guardian Check:
   ├── If domain is "Healthcare": headers must contain diagnosis/patient/treatment/age
   ├── If domain is "Finance":    headers must contain credit/loan/income/amount
   ├── If domain is "Hiring":     headers must contain candidate/resume/role/salary/ethnicity
   └── Mismatch → return HTTP 400 with "Domain Mismatch: Non-X dataset detected"
5. Find numeric target column:
   ├── Prefer "Actual Amount" if it exists
   └── Otherwise: first column where all non-empty values parse as numbers
6. Find categorical (bias-sensitive) columns:
   └── Columns that contain at least one non-numeric value
7. Choose analysis column:
   ├── Prefer: Department, Gender, Race, Ethnicity (in that order)
   └── Fallback: first categorical column found
8. Group rows by analysis column → compute mean of target per group
9. Score each group:
   ├── score = (groupMean / maxGroupMean) × 100
   ├── status = "Pass" if score ≥ 90
   ├── status = "Warning" if 80 ≤ score < 90
   └── status = "Fail" if score < 80
10. Compute overall_fairness_score = average of all group scores
11. Build summary text
12. Return JSON response
```

#### Response
```json
{
  "overall_fairness_score": 87.3,
  "categories": [
    {
      "category": "Majority",
      "score": 100.0,
      "status": "Pass",
      "details": "Mean Actual Amount: 52000.00 (100.0% of highest group)"
    },
    {
      "category": "Minority B",
      "score": 74.6,
      "status": "Fail",
      "details": "Mean Actual Amount: 38792.00 (74.6% of highest group)"
    }
  ],
  "summary": "Analyzed Ethnicity against Actual Amount. Significant disparate impact detected in: Minority B."
}
```

---

### `GET /api/history` — Seed History Data

**File:** `src/app/api/history/route.js`

**Purpose:** Returns four pre-seeded mitigation history entries so the Logs page has data on first visit (before the user has run any audits). These mirror the mock data that the original FastAPI server returned.

No request body needed. Returns an array of `HistoryEntry` objects.

---

### `POST /api/simulate` — Mitigation Projections

**File:** `src/app/api/simulate/route.js`

**Purpose:** Takes the raw audit results and simulates what five different bias mitigation strategies would achieve in terms of accuracy and fairness.

#### Request
```json
{
  "overall_fairness_score": 74.6,
  "categories": [ ...BiasScore[] ]
}
```

#### Processing pipeline

```
1. Parse baseFairness from overall_fairness_score
2. Compute baseAccuracy:
   ├── Calculate score variance across categories
   └── Higher variance → lower base accuracy (88–97% range)
3. Generate 5 strategy objects, each trading accuracy for fairness:
   ├── Baseline:              accuracy = base,       fairness = base
   ├── Threshold Adjust:      accuracy = base − 1–3, fairness = base + 10–15
   ├── Data Reweighting:      accuracy = base − 4–6, fairness = base + 18–25
   ├── Adversarial Debiasing: accuracy = base − 6–8, fairness = base + 25–30
   └── Fairness Constraint:   accuracy = base − 9–12,fairness = base + 30–35
4. Find recommended strategy:
   └── Max score of: (fairness × 0.6 + accuracy × 0.4)
5. Generate per-category projections for recommended strategy:
   ├── improvementRatio = (recommended.fairness − base) / (100 − base)
   ├── For each category:
   │   afterScore = score + (100 − score) × improvementRatio × random(0.8–1.2)
   │   afterStatus = Pass/Warning/Fail based on afterScore
   └── delta = afterScore − beforeScore
6. Return full response
```

#### Response
```json
{
  "strategies": [ ...5 MitigationStrategy objects ],
  "recommendedId": "reweighting",
  "recommendedName": "Data Reweighting",
  "baselineAccuracy": 93.4,
  "baselineFairness": 74.6,
  "afterFairness": 94.0,
  "afterAccuracy": 88.1,
  "categoryProjections": [
    {
      "category": "Minority B",
      "before": 74.6,
      "beforeStatus": "Fail",
      "after": 93.1,
      "afterStatus": "Pass",
      "delta": 18.5
    }
  ]
}
```

---

## 6. Component Reference

### `Navbar.js`
**Props:** `activeTab`, `setActiveTab`, `selectedDomain`, `setSelectedDomain`

A **floating pill-shaped glassmorphism navigation bar** fixed to the top-center of the screen. It never scrolls away.

**Contains:**
- **Brand** — "Antigravity" in Newsreader serif + a gradient "AI" pill badge
- **3 nav items** — Dashboard, Metrics, Logs — each with a Material Symbol icon. The active tab gets a teal background tint and a small glowing dot underneath.
- **Domain Selector** — A dropdown button letting users pick "Universal / Healthcare / Finance / Hiring". This domain is passed to the audit API to enforce Domain Guardian validation.

**Visual:** Uses `rgba(255,255,255,0.7)` background + `backdrop-filter: blur(24px)` for the glass effect.

---

### `Footer.js`
**Props:** None

A minimal footer strip. Brand name + tagline on the left, copyright on the right.

---

### `ErrorToast.js`
**Props:** `message: string`, `onClose: () => void`

A rose-red glass toast that slides in from the top-right corner when any API error occurs. Renders nothing when `message` is empty.

**When it appears:**
- Domain Guardian failure
- Empty CSV, non-CSV file
- Any `POST /api/audit` server error

---

### `Dashboard.js`
**Props:** `selectedDomain: string`, `onAuditComplete: (result) => void`

The main **audit interface**. Manages the complete upload → validate → results flow.

**User flow:**
```
1. Upload zone shown (dashed border, cloud icon)
2. User clicks or drags a .csv file
   → upload zone replaced by file info card
3. User clicks "Validate & Audit Dataset"
   → POST /api/audit called
   → Success: AnalysisResults renders below, onAuditComplete fires
   → Also calls POST /api/simulate in background for the history entry
   → Saves entry to localStorage with real strategy name + projected score
   → Failure: ErrorToast appears
```

**Sub-component `RecentAudits`:** Reads localStorage on mount, shows last 3 audits as mini glass cards.

---

### `AnalysisResults.js`
**Props:** `result: AuditResponse | null`

Renders nothing when `result` is null. When data arrives shows:
1. "Analysis Complete" header + API summary text
2. Domain Guardian pass/fail badge + warning count
3. **Overall Score gauge** — CSS `conic-gradient` ring with floating animation
4. **Bias Distribution** — BiasChart component
5. **Detailed Findings** — per-category cards with score, bar, status pill, detail text

---

### `BiasChart.js`
**Props:** `data: BiasScore[]`

Gradient progress bars, one per demographic group. Green ≥ 90, Amber ≥ 80, Red < 80. Hover reveals exact detail text.

---

### `ModelInspection.js`
**Props:** `analysisResult: AuditResponse | null`

**Metrics tab.** When `analysisResult` arrives, fires `POST /api/simulate`, then renders:
1. **Radar chart** (ModelPerformanceChart) with "⚡ Live Data" badge
2. **Before vs. After panel** (BeforeAfterComparison)
3. **5 strategy cards** — recommended one highlighted in teal

---

### `ModelPerformanceChart.js`
**Props:** `strategies: Strategy[] | null`

A **pure SVG pentagon radar chart**. No external chart library. Falls back to hardcoded data when `strategies` is null.

- Purple polygon = Accuracy values
- Cyan polygon = Fairness values
- Glowing dots at each intersection

---

### `BeforeAfterComparison.js`
**Props:** `analysisResult`, `categoryProjections`, `recommendedName`, `beforeFairness`, `afterFairness`, `beforeAccuracy`, `afterAccuracy`

Renders nothing if either key prop is null/empty.

**Two tab views:**

**"By Category" tab:**
- For each demographic group: dual progress bars (BEFORE + AFTER)
- Red/amber/green bars based on score thresholds
- Green "↑ Resolved" badge if status improved to Pass
- Delta value (+X.X) shown top-right

**"Overview" tab:**
- 4 summary stat badges (Fairness Gain, Categories Resolved, Improved Groups, Accuracy Delta)
- SVG ring dials for Before and After clusters (Fairness + Accuracy each)
- Animated via CSS `stroke-dashoffset` transition on SVG circles
- Arrow + strategy name between the two clusters

---

### `MitigationHistory.js`
**Props:** `selectedDomain: string`

**Logs tab.** On mount fetches from two sources:
1. `localStorage["auditHistory"]` — user's own audits this session
2. `GET /api/history` — four pre-seeded entries

Merges + filters by `selectedDomain`, renders:
- **4 summary stat cards**: Total Audits, Avg Improvement, Bias Detected, Resolved
- **Glass table**: Date | Dataset | Domain pill | Original score | Strategy | Result + delta

---

## 7. Design System (`globals.css`)

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#006970` | Brand teal, active states, headings accent |
| `--primary-container` | `#00F0FF` | Cyan glows, blob, chart fill |
| `--secondary` | `#821dda` | Purple — button gradient, radar polygon |
| `--tertiary` | `#ba005b` | Rose — errors, background blob |
| `--status-pass` | `#10B981` | Green |
| `--status-warning` | `#F59E0B` | Amber |
| `--status-fail` | `#EF4444` | Red |

### Glassmorphism
```css
--glass-bg:     rgba(255, 255, 255, 0.65)
--glass-border: rgba(255, 255, 255, 0.35)
--glass-shadow: 0 20px 40px rgba(0, 0, 0, 0.04)
--glass-blur:   20px
```
The `.glass-card` class applies all four plus a hover lift transition.

### Background Blobs
Three fixed `<div>` elements behind all content (z-index 0). Blurred circles that drift with slow keyframe animations, creating the layered pastel background.

### Animation Classes
| Class | Effect |
|---|---|
| `.animate-fade-in` | 0.5s opacity fade |
| `.animate-fade-in-up` | 0.6s fade + slide up 20px |
| `.animate-slide-up` | 0.7s fade + slide up 30px |
| `.animate-float-gauge` | Gentle float for the score ring |
| `.animate-pulse-glow` | Cyan glow pulse on audit button |
| `.stagger-children` | Sequential delays on up to 8 children |

---

## 8. Data Flow — End to End

```
USER selects file + domain
        │
        ▼
Dashboard.js → POST /api/audit
        │         ├── papaparse parses CSV
        │         ├── Domain Guardian check
        │         ├── Find target + bias columns
        │         ├── Group means → fairness scores
        │         └── Returns AuditResponse JSON
        │
        ├── setAnalysisResult(data)     ← local Dashboard state
        ├── onAuditComplete(data)       ← lifted to page.js shared state
        │
        └── POST /api/simulate (background, for history entry)
                  └── Returns recommendedName + newScore
                          └── Saved to localStorage["auditHistory"]

USER clicks Metrics tab
        │
        ▼
ModelInspection receives analysisResult from page.js
        │
        ▼
useEffect fires → POST /api/simulate
        │         ├── 5 strategy trade-off curves
        │         ├── Per-category before/after projections
        │         └── Full simulation response
        │
        ├── ModelPerformanceChart ← SVG radar with live data
        ├── BeforeAfterComparison ← dual bar + dial views
        └── InsightCard × 5       ← strategy cards

USER clicks Logs tab
        │
        ▼
MitigationHistory
        ├── localStorage["auditHistory"]  ← user's audits
        └── GET /api/history              ← seed data
                  └── merged + filtered by domain → table
```

---

## 9. State Management Summary

| State | Owned by | Purpose |
|---|---|---|
| `activeTab` | `page.js` | Controls which view is rendered |
| `selectedDomain` | `page.js` | Passed to audit API + Logs filter |
| `analysisResult` | `page.js` | Bridge: Dashboard writes, Metrics reads |
| `file`, `isValidating`, `isValidated`, `errorToast` | `Dashboard.js` | Upload flow |
| `strategies`, `categoryProjections`, etc. | `ModelInspection.js` | Simulation results |
| `history`, `serverHistory` | `MitigationHistory.js` | Log entries |
| `activeView` | `BeforeAfterComparison.js` | Tab toggle (By Category / Overview) |
| `domainOpen` | `Navbar.js` | Domain dropdown open/close |

---

## 10. `localStorage` Schema

Key: `"auditHistory"`

```json
[
  {
    "id": 1714000000000,
    "datasetName": "hiring_sample.csv",
    "domain": "Hiring",
    "originalScore": 87.3,
    "mitigation": "Data Reweighting",
    "newScore": 94.0,
    "date": "2026-04-23"
  }
]
```

Entries are prepended (newest first). Dashboard shows last 3. Logs shows all merged with server seed data.

## Sample Data Files

High-quality corporate datasets are located in `sample_data/`. Each contains 100 rows of randomized but realistic data designed to trigger domain-specific bias detection:

| File | Domain | Key Columns | Intentional Bias |
|---|---|---|---|
| `hiring_corporate_data.csv` | Hiring | Candidate_Name, Ethnicity, Technical_Score | Minorities have lower technical scores |
| `finance_corporate_data.csv` | Finance | Account_ID, Annual_Income, Loan_Amount | Lower loan amounts for specific groups |
| `healthcare_corporate_data.csv` | Healthcare | Patient_ID, Diagnosis, Treatment_Cost | Higher costs for majority groups |

Try uploading these new files to see how the platform handles large-scale data with complex category distributions.

> **Tip:** Upload `finance_sample.csv` with domain set to "Hiring" — the Domain Guardian will reject it with a domain mismatch error, demonstrating the validation system.

---

## 12. Running the Project

```bash
# From: D:\new app\my-app\

npm run dev      # Development server at http://localhost:3000
npm run build    # Production build (verify zero errors)
npm run start    # Production server
```

No Python server, no separate backend process, no environment variables required. Everything runs in a single Next.js process.

---

*Antigravity AI Platform — v1.0 — April 2026*
