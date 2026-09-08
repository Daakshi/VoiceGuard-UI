# VoiceGuard UI Design System & Style Specification

Comprehensive guide to the visual language, typography hierarchy, color palette, design tokens, component anatomy, and responsive layout specifications powering the VoiceGuard UI.

---

## 1. Design Philosophy & Aesthetic

VoiceGuard blends **high-assurance cybersecurity utility** with **editorial fintech refinement**:
- **Warm Canvas, Crisp Contrast**: Moves away from cold "terminal dark mode" to an inviting, premium cream/linen paper foundation (`#f7f7f5`) paired with deep carbon ink (`#171817`).
- **Signal-Driven Color Accent**: High-visibility energetic terracotta/burnt orange (`#f06b36` / `#bb4c31`) signals alerts, active scans, and calls-to-action.
- **Glassmorphism & Depth**: Uses frosted glass surfaces (`backdrop-filter: blur(16px)`), multi-layered ambient drop shadows, and soft ambient radial glow accents.
- **Micro-Animations & Audio Indicators**: Animated equalizer pulses, radar status dots, floating phone preview frames, and SVG ring gauges give the interface a live, responsive heartbeat.

---

## 2. Typography

VoiceGuard uses two complementary typefaces loaded via Google Fonts:
1. **Manrope** — Primary UI and Display typeface (geometric, warm sans-serif with high legibility).
2. **DM Mono** — Secondary / Data / Telemetry typeface (used for numerical metrics, timestamps, caller numbers, and technical kickers).

```html
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@500;600;700;800&display=swap');
```

### Font Size & Hierarchy Scale

| Role | Font Family | Size | Weight | Line Height | Letter Spacing | Example Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display (H1)** | `Manrope` | `clamp(48px, 7vw, 88px)` | `800` | `0.99` | `-5px` | Landing Page Hero Headline |
| **Score Card Hero Value** | `DM Mono` | `70px` (`62px` mobile) | `500` | `0.9` | `-7px` | Detail View Large Risk Score |
| **Page Title (H1)** | `Manrope` | `clamp(32px, 5vw, 46px)` | `700` / `800` | `1.1` | `-2px` to `-2.5px` | Dashboard & Analytics Headings |
| **Detail Page Title (H1)** | `Manrope` | `clamp(30px, 5vw, 43px)` | `700` | `1.1` | `-1.8px` | Call Detail View Title |
| **Metric Large Number** | `DM Mono` | `35px` (`29px` mobile) | `500` | `1.0` | `-2px` | Overview Metric Cards |
| **Donut / Ring Value** | `DM Mono` | `28px` - `29px` | `500` | `1.0` | `-2px` | Donut & Risk Ring Center Values |
| **Auth Heading (H1)** | `Manrope` | `clamp(25px, 5vw, 31px)` | `700` | `1.12` | `-1.2px` to `-1.8px` | Sign In / Register Modal Headings |
| **Preview Headline** | `Manrope` | `clamp(23px, 3vw, 34px)` | `700` | `1.05` | `-1.8px` | Mobile Preview Hero Box Strong |
| **Section Heading (H2)** | `Manrope` | `20px` - `21px` | `700` | `1.2` | `-0.7px` | Panel Titles, Confirm Dialogs |
| **Sub-section Heading (H2)**| `Manrope` | `17px` | `700` | `1.2` | `-0.5px` | Detail Report & Section Headers |
| **Brand Wordmark** | `DM Mono` / `Manrope`| `15px` - `20px` | `500` - `800` | `1.0` | `-0.5px` to `-1px`| App & Navigation Header Logos |
| **Body & Explainer Text** | `Manrope` | `14px` | `500` | `1.5` - `1.7` | Normal | Subtitles, Intros, Descriptions |
| **Form Inputs & Fields** | `Manrope` | `12px` - `14px` | `500` | `1.2` | Normal | Text Inputs, Select dropdowns |
| **Button Labels** | `Manrope` | `11px` - `13px` | `700` / `800` | `1.0` | Normal | CTAs, Submit & Action Buttons |
| **Table & Row Titles** | `DM Mono` / `Manrope`| `11px` - `12px` | `500` - `700` | `1.2` | Normal | Caller Names, Alert Rows |
| **Eyebrows & Kickers** | `DM Mono` / `Manrope`| `10px` - `11px` | `500` / `800` | `1.0` | `+1.2px` to `+1.5px`| Uppercase Category Headers |
| **Pill & Status Badges** | `DM Mono` / `Manrope`| `9px` - `10px` | `700` / `800` | `1.0` | Normal | Safe / Suspicious / Fraud Tags |
| **Data Meta & Timestamps** | `DM Mono` | `9px` - `10px` | `400` / `500` | `1.3` | Normal | Dates, Durations, Status Bar |
| **Micro Labels (Phone)** | `DM Mono` / `Manrope`| `7px` - `8px` | `500` / `700` | `1.0` | Normal | Interactive Phone Screen Elements |

---

## 3. Color Palette & Tokens

### Core CSS Variables (`:root`)

```css
:root {
  /* Surfaces & Canvas */
  --paper: #f7f7f5;          /* Warm linen primary canvas */
  --ink: #171817;            /* Deep carbon dark foreground */
  --muted: #73756f;          /* Neutral stone text and secondary icons */
  --line: #e2e2de;           /* Hairline borders and grid dividers */

  /* Accents & Brand Signals */
  --accent: #f06b36;         /* Vivid safety orange (Primary Accent) */
  --accent-dark: #c94d24;    /* Deep rust for hover states & active presses */
  --soft-orange: #fff0e5;    /* Soft tinted wash for badges & active tabs */
  --error: #ae382e;          /* Crimson for validation errors & danger buttons */

  /* Typography Families */
  --display: 'Manrope', sans-serif;
  --mono: 'DM Mono', monospace;
}
```

### Semantic Status Colors

| State | Foreground Text | Background Tint | Border Color | Indicator Dot / Bar |
| :--- | :--- | :--- | :--- | :--- |
| **Safe / Verified** | `#477254` / `#428352` | `#ecf7ee` / `rgba(205,225,208,.32)` | `rgba(71,114,84,.28)` | `#5e956c` / `#43a660` |
| **Suspicious / Warning** | `#8b6529` / `#d18b34` | `rgba(230,211,166,.3)` | `rgba(182,133,49,.35)` | `#b68531` |
| **High Risk / Fraud** | `#c94d24` / `#c84e3b` | `#fee5df` / `rgba(225,185,171,.3)` | `rgba(150,59,38,.3)` | `#f06b36` / `#bb4c31` |
| **Scanning / Analyzing**| `#777d8e` | `#eef0f5` | `#f2e0d7` | `#e9784c` |

### Gradients & Atmosphere

- **Hero Ambient Glow**: `radial-gradient(ellipse, rgba(248,139,77,.27) 0%, rgba(255,201,162,.13) 43%, transparent 70%)`
- **Hero Canvas Transition**: `linear-gradient(180deg, #fff4e9 0%, #fffaf5 30%, #fff 70%)`
- **Shell Mesh**: `radial-gradient(circle at 50% 0%, rgba(255,255,255,.96), transparent 45%), linear-gradient(135deg, #fff 0%, #f7f7f5 56%, #fff1e6 100%)`
- **Score Card / Headline Metric Highlight**: `linear-gradient(135deg, #fff0e5, #ffd4bc)`
- **Mobile Guard Preview Stage**: `linear-gradient(155deg, #fffdf9 0%, #ffe8d9 58%, #f9a16e 100%)`

---

## 4. Spacing, Elevation & Border Radii

### Border Radius Hierarchy

- **`2px` (Sharp Tactile)**: Form inputs, action buttons, table risk tags (legacy utility rules).
- **`8px` - `10px` (Modern Tactile)**: Form input fields (`10px`), submit buttons, status pills.
- **`12px` - `14px` (Card Medium)**: Call rows (`12px`), result cards, trend charts, history table (`14px`).
- **`16px` - `20px` (Container Large)**: Analytics panels (`16px`), metric row (`18px`), auth cards (`20px`), mockup card (`20px`).
- **`25px` - `34px` (Hardware Shell)**: Mobile phone frame preview (`34px`), screen viewport (`25px`).
- **`999px` (Fully Pill)**: Primary dark pills (`vg-dark-button`), status pills, risk tags (`vg-risk`).

### Elevation & Shadows

- **Auth Card & Modals**: `box-shadow: 0 24px 70px rgba(77,53,40,.12)`
- **Floating Hardware Preview**: `box-shadow: 0 35px 80px rgba(90,54,34,.15), 0 5px 15px rgba(35,39,35,.06)`
- **Primary Dark Button Hover**: `box-shadow: 0 12px 25px rgba(27,30,28,.23)`
- **Sticky Glass Header**: `backdrop-filter: blur(16px); background: rgba(255,255,255,.78); border-bottom: 1px solid rgba(23,24,23,.08)`
- **Metric Row Container**: `box-shadow: 0 16px 45px rgba(28,28,24,.05)`
- **Toast Notifications**: `box-shadow: 0 8px 24px rgba(60,54,44,.14)`

---

## 5. Animation & Motion Design

VoiceGuard utilizes purposeful, physics-based micro-interactions to emphasize live security monitoring:

1. **Entrance Rhythm (`reveal-up`)**:
   - `0%`: `opacity: 0; transform: translateY(16px);`
   - `100%`: `opacity: 1; transform: translateY(0);`
   - Staggered child delays (`0.08s`, `0.16s`, `0.24s`, `0.32s`).
2. **Audio Waveform Equalizer (`voice-wave`)**:
   - Pulsing vertical bars alternating scale from `scaleY(0.55)` to `scaleY(1.1)`.
3. **Live Radar Dot (`pulse-dot`)**:
   - 2s repeating loop expanding `transform: scale(1.35)` with diminishing opacity.
4. **Floating Phone Device (`phone-float`)**:
   - 4.5s organic floating loop with `-10px` vertical translation and `-1deg` rotation.
5. **Interactive Chart Lines & Gauges (`draw-line`, `draw-ring`, `grow-bar`)**:
   - SVG lines drawn with stroke-dashoffset transitions (`1.2s ease forwards`).
   - Circular progress rings animate into view from `scale(0.88)` and `-12deg`.
   - Score bars expand horizontally from `scaleX(0)` with `transform-origin: left`.
6. **Accessible Fallback**:
   - Full `@media (prefers-reduced-motion: reduce)` support instantly zeroing transitions and animations for users with motion sensitivity.

---

## 6. Layout Grids & Containers

| Viewport Container | Max-Width | Horizontal Padding | Target View |
| :--- | :--- | :--- | :--- |
| **Global Page Shell** | `100%` | Auto margins | Entire App |
| **Dashboard Shell** | `1180px` | `clamp(20px, 5vw, 72px)` | `/dashboard`, `/analytics` |
| **Landing Hero Inner** | `1120px` | `20px` | `/` (Home Hero & Stage) |
| **Auth Center Stage** | `1120px` (max 440px card) | `24px` - `36px` | `/login`, `/register` |
| **Detail & Settings** | `920px` | `24px` | `/contacts`, `/settings` |
| **Device Mockup** | `735px` - `870px` | `10px` | Landing Feature Stage |

### Responsive Breakpoints

- **Desktop (1024px+)**: Multi-column grids (3+1 metric grid, 2-column detail report, horizontal toolbar).
- **Tablet (≤820px)**:
  - Metric row converts to 3 columns with headline spanning full width.
  - History table transforms from multi-column rows into clean card stacks.
  - Auth layout collapses from 2-column split (card + phone preview) to a focused single-column stack.
- **Mobile (≤560px / 480px)**:
  - Navigation links collapse to streamlined action items.
  - Headings scale gracefully down (`clamp()` typography).
  - Metric cards drop to a balanced 2-column layout.
  - Buttons expand to full-width touch targets (minimum `40px` - `48px` touch target height).
