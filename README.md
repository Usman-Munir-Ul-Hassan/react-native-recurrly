# Loop — Mobile Subscription Management & Intelligence

**Loop** is a high-performance, privacy-conscious mobile application built with **React Native (0.88)**, **Expo (SDK 58)**, and **React 19**, designed to track recurring subscriptions, eliminate ghost billing, predict renewal cycles, and detect duplicate charges.

---

## 🏛️ System Architecture

Loop strictly follows **Clean Layered Architecture** and the **Single Responsibility Principle (SRP)**. Every layer has a single, well-defined reason to change and depends only on inward domain abstractions.

```
┌─────────────────────────────────────────────────────────────┐
│                 Presentation Layer (UI/UX)                  │
│       File-based routing (Expo Router), Components, Screens │
└──────────────────────────────┬──────────────────────────────┘
                               │ delegates
┌──────────────────────────────▼──────────────────────────────┐
│             State & Orchestration Layer (Context)           │
│   SubscriptionProvider, PreferencesProvider, Custom Hooks    │
└──────────────────────────────┬──────────────────────────────┘
                               │ coordinates
┌──────────────────────────────▼──────────────────────────────┐
│                    Domain Services Layer                    │
│   ClerkStorage, GeminiDuplicate, Notifications, CSVExport   │
└──────────────────────────────┬──────────────────────────────┘
                               │ calculates
┌──────────────────────────────▼──────────────────────────────┐
│               Stateless Domain Utilities & Types            │
│  CycleCalculator, CurrencyFormatter, Security Sanitizers    │
└─────────────────────────────────────────────────────────────┘
```

### Layer Breakdown

1. **Presentation Layer (`src/app/`, `src/components/`)**:
   - Pure UI entry points and presentational components.
   - Handles gestures, screen layouts, animations, and inputs.
   - **Zero business logic**: Entry points only translate user interactions into hook/context calls.

2. **State & Orchestration Layer (`src/context/`, `src/hooks/`)**:
   - **`SubscriptionContext`**: Manages the application lifecycle, optimistic UI state, and cross-screen synchronization.
   - **`PreferencesContext`**: Manages user currency conversions, compact number formats, and alert toggles.
   - **Custom Hooks (`useSocialAuth`, `useUserProfile`, `useRenewalNotifications`)**: Encapsulate complex side-effects into reusable, composable contracts.

3. **Domain Services Layer (`src/services/`)**:
   - Decoupled from transport and storage implementations.
   - Responsible for external communication (Clerk Cloud, Google Gemini AI, OS Notification System).
   - Can be swapped or mocked in tests without altering UI components.

4. **Utilities & Mathematical Pure Functions (`src/utils/`)**:
   - 100% deterministic, side-effect-free functions.
   - Responsible for date calculations, currency parsing, recurrence normalization, and security sanitization.

---

## ⚙️ Core Algorithms & Techniques

### 1. Dynamic Billing Cycle Projection Algorithm
* **Location**: [`src/utils/subscription-cycle-calculator.ts`](file:///c:/Users/Usman%20Munir/Documents/ReactNative-Tools/practice-app/src/utils/subscription-cycle-calculator.ts)
* **Problem**: Subscription renewal dates vary wildly depending on whether a cycle is Monthly, Annual, or Custom, as well as leap years, 30/31-day months, and past start dates.
* **Algorithm**:
  1. **Anchor Normalization**: Parses the initial subscription start date and billing cadence (`Monthly`, `Annual`, `Weekly`, `Quarterly`).
  2. **Cycle Stepping**: Projects forward from the start date by incrementing cycle intervals until the next renewal timestamp is strictly greater than the current reference date.
  3. **Day-Remaining Arithmetic**: Computes the exact integer delta between today's midnight timestamp and the renewal date:
     $$\Delta t = \lceil (t_{\text{renewal}} - t_{\text{today}}) / 86400000 \rceil$$
  4. **Humanized Cadence Output**: Generates context-aware label strings (e.g., *"Renews tomorrow"*, *"in 5 days"*, *"Overdue"*).

### 2. Hybrid Duplicate Subscription Detection
* **Location**: [`src/services/subscription/duplicate-detection-orchestrator.ts`](file:///c:/Users/Usman%20Munir/Documents/ReactNative-Tools/practice-app/src/services/subscription/duplicate-detection-orchestrator.ts)
* **Problem**: Users frequently subscribe to the same tool under multiple accounts or slightly different names (e.g., *"Google Cloud"* vs *"GCP"*, or *"Max"* vs *"HBO Max"*).
* **Two-Tier Architecture**:
  * **Tier 1 — Instant Local Heuristic Matcher**:
    - Runs in $O(N)$ synchronously with zero network latency.
    - Scopes candidate names against existing active subscriptions under the same invoice email/account.
    - Normalizes strings (lowercasing, punctuation stripping, whitespace collapsing) and performs bidirectional substring checking.
  * **Tier 2 — Gemini AI Semantic Fallback**:
    - If local matching is inconclusive, dispatches an asynchronous call to Google Gemini (`gemini-duplicate-service.ts`).
    - Uses structured LLM prompting to determine if two product names refer to the same underlying billing service.
    - **Graceful Fallback**: If offline or if the API key is unavailable, gracefully falls back to local detection without blocking the user.

### 3. Dynamic Native Module Lazy-Loading
* **Location**: [`src/services/notification/renewal-notification-service.ts`](file:///c:/Users/Usman%20Munir/Documents/ReactNative-Tools/practice-app/src/services/notification/renewal-notification-service.ts)
* **Problem**: In Expo SDK 58, static top-level imports of `expo-notifications` cause fatal initialization crashes in **Expo Go** (`Cannot find native module 'ExpoApplication'`).
* **Technique**:
  - Implemented dynamic runtime module loader `getNotificationsModule()`.
  - In Expo Go, it catches the missing module gracefully, emits a non-fatal warning, and avoids crashing the app.
  - In standalone APK / production builds, it loads the full native push & local notification channels without any performance penalty.

### 4. Concurrency Mutex & Double-Submit Protection
* **Location**: [`src/components/subscription/add-subscription-modal.tsx`](file:///c:/Users/Usman%20Munir/Documents/ReactNative-Tools/practice-app/src/components/subscription/add-subscription-modal.tsx)
* **Problem**: On mobile touch screens, rapid multi-tapping on a button can trigger multiple asynchronous submission events before React re-renders, resulting in duplicate database entries.
* **Technique**:
  - Implemented an immediate synchronous event lock using `isSubmittingRef = useRef(false)`.
  - React state (`isSubmitting`) controls UI visual indicators (`ActivityIndicator`, button disabled state).
  - The `useRef` guard synchronously blocks any touch events that arrive before the event loop processes the re-render.

### 5. OWASP CSV & Formula Injection Defense (CWE-1236)
* **Location**: [`src/services/subscription/csv-export-service.ts`](file:///c:/Users/Usman%20Munir/Documents/ReactNative-Tools/practice-app/src/services/subscription/csv-export-service.ts)
* **Problem**: Exporting subscription data containing user-supplied names or notes to CSV can execute arbitrary formulas if opened in Microsoft Excel, Google Sheets, or Apple Numbers (Formula Injection).
* **Technique**:
  - Sanitizes every exported field against formula trigger prefixes (`=`, `+`, `-`, `@`, `\t`, `\r`).
  - If a cell begins with a dangerous character, it is safely prefixed with an apostrophe (`'`) and enclosed in standard RFC 4180 quotes.

---

## 🔒 Multi-Tenant Data Isolation & Privacy

1. **Per-User Cloud Isolation**:
   - Subscriptions are persisted directly inside Clerk's encrypted `unsafeMetadata` tied to the authenticated user ID.
   - No shared databases or global cross-tenant tables.
2. **Clean Slate Initialization**:
   - Brand-new accounts (and accounts re-registered after deletion) receive an empty array (`[]`).
   - Mock/sample data is never injected into real accounts.
3. **In-Memory Cache Invalidation**:
   - On user sign-out or account switch, the in-memory override state is purged immediately, preventing cross-account state leakage in shared device environments.

---

## 📦 Native Mobile Binary Optimization Pipeline

Loop implements an optimized Android build pipeline targeting standalone release performance:

| Optimization Step | Universal Build | Loop Optimized Build | Impact |
| :--- | :--- | :--- | :--- |
| **Target Architecture** | All 4 ABIs (`arm64`, `arm32`, `x86`, `x86_64`) | **`arm64-v8a`** (via `expo-build-properties`) | **62.5% size reduction** |
| **APK Footprint** | ~105.7 MB | **37.7 MB** | Faster install, lower memory |
| **Build Duration** | 19.4 minutes | **10.4 – 11.1 minutes** | 43% faster cloud build times |
| **Key Injection** | Plaintext local `.env` | Cloud-injected (`eas env:set`) | Zero secrets committed to Git |

---

## 🎨 Design System ([DESIGN.md](file:///c:/Users/Usman%20Munir/Documents/ReactNative-Tools/DESIGN.md))

Loop adheres to an ultra-clean, achromatic, Swiss-inspired design system:

* **Palette**:
  * **Obsidian Black**: `#050505` (Action buttons, primary text, high contrast)
  * **Cloud White**: `#FAF9F6` / `#FFFFFF` (Base backgrounds, surfaces)
  * **Fog / Slate Border**: `#E5E7EB` / `#D1D5DB` (Hairline dividers, 1px cards)
  * **Graphite Text**: `#6B7280` / `#9CA3AF` (Secondary labels, metadata)
* **Radii Discipline**:
  * Micro/interactive elements: `4px`
  * Cards and containers: `8px`
  * Fully rounded pills / action triggers: `9999px`
* **Accessibility**: Minimum touch targets of 48×48 dp for all interactive surfaces.

---

## 📁 Project Directory Structure

```
practice-app/
├── assets/images/              # Brand icon (icon.png, adaptive-icon.png) & splash
├── src/
│   ├── app/                    # Expo Router file-based screens
│   │   ├── (auth)/             # Login & Authentication flows
│   │   ├── (tabs)/             # Main Tab navigation (Dashboard, Search, Settings)
│   │   ├── details/[id].tsx    # Subscription detail view & exit animations
│   │   ├── sso-callback.tsx    # Google OAuth deep link handler
│   │   └── _layout.tsx         # Root app layout & safe error boundaries
│   ├── components/
│   │   ├── navigation/         # AppHeader, TabBars
│   │   ├── subscription/       # Cards, metrics, modals, dropdowns
│   │   └── ui/                 # Reusable buttons, badges, image skeletons
│   ├── constants/              # Achromatic theme tokens & categories
│   ├── context/                # SubscriptionContext & PreferencesContext
│   ├── hooks/                  # Social auth, notifications, user profiles
│   ├── services/
│   │   ├── ai/                 # Google Gemini semantic duplicate service
│   │   ├── auth/               # OAuth strategies & error handlers
│   │   ├── notification/       # Scheduled renewal reminders
│   │   └── subscription/       # Clerk persistence & CSV export
│   ├── types/                  # TypeScript domain models
│   └── utils/                  # Deterministic pure calculators & formatters
├── app.json                    # Expo project configuration & plugins
└── eas.json                    # EAS Cloud build profiles (preview, production)
```

---

## 🧪 Testing & Quality Assurance

Loop maintains a comprehensive test suite using **Jest** and **React Native Testing Library**:

* **Test Coverage**: **31 test suites**, **188 passing tests**.
* **Tested Dimensions**:
  * Unit tests for financial calculators and currency converters.
  * Concurrency and double-submit prevention tests.
  * State transition and exit animation cache tests.
  * CSV Injection (CWE-1236) security vector assertions.
  * Multi-account sign-out and cache invalidation suites.
* **Linting**: Strict ESLint configuration with 0 errors and 0 warnings.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v20+ recommended)
* npm or yarn
* [EAS CLI](https://docs.expo.dev/build/introduction/) (for standalone builds)

### 1. Installation
```bash
cd practice-app
npm install
```

### 2. Running Locally (Expo Go)
```bash
npx expo start
```
Scan the displayed QR code using the **Expo Go** app on your Android or iOS device.

### 3. Running Unit Tests & Linter
```bash
npm test
npm run lint
```

### 4. Building a Standalone Android APK
```bash
eas build --platform android --profile preview
```
This triggers an EAS cloud build and outputs a standalone, installable **`.apk`** (~37.7 MB) with custom branding.
