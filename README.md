# 💰 Personal Finance Advisor Bot

A production-ready, full-stack personal finance management and AI advisor web application. Built with **React 19**, **TypeScript**, **Tailwind CSS**, **Node.js (Express)**, and powered by Google's **Gemini API** (`gemini-3.8-flash`) with a resilient deterministic heuristic fallback engine.

---

## 🌟 Key Features

### 1. 📊 Financial Dashboard & Health Overview
- Real-time aggregated financial summary: **Total Inflows**, **Total Outflows**, **Net Cash Flow**, and **Savings Rate %**.
- **Monthly Budget Burn Progress**: Live visual tracking against monthly spending caps with dynamic status badges (*Healthy*, *Moderate*, *High*, *Critical Breached*).
- **Expense Categorization**: Visual distribution of categorized expenses with proportion calculations and budget overrun warnings.
- **Recent Transactions Ledger**: Instant chronological transaction feed with quick-action links.

### 2. 💵 Inflow & Outflow Ledgers
- **Income Tracker**: Record earnings across multiple categories (*Salary*, *Freelance*, *Investments*, *Gifts*, *Rental*, *Side Business*, *Refunds*, *Other*) with date filtering, search, and delete controls.
- **Expense Tracker**: Track categorized spending across 10 distinct envelopes (*Housing*, *Food & Dining*, *Transportation*, *Utilities*, *Healthcare*, *Entertainment*, *Shopping*, *Education*, *Personal Care*, *Miscellaneous*).
- Instant metric recalculations upon every addition or deletion.

### 3. 🎯 Budgeting & Category Envelope Engine
- Configurable **Monthly Overall Spending Cap** with automated burn rate tracking.
- Individual **Category Envelope Limits** with overspending indicators:
  - 🟢 **Healthy**: Under 70% budget utilization
  - 🔵 **Moderate**: 70% – 89% budget utilization
  - 🟡 **High**: 90% – 99% budget utilization
  - 🔴 **Critical**: 100%+ (Over Budget Breached)

### 4. 🐷 Savings Goals & Milestones
- Establish capital targets with deadlines, target amounts, and current deposits.
- Visual milestone completion bars and remaining days calculation.
- **Quick Deposit Dialog**: Preset contribution chips (`+$50`, `+$100`, `+$250`, `+$500`) plus custom deposit inputs.

### 5. 🤖 AI Financial Advisor (Gemini 3.8 Flash)
- **Financial Health Audit**:
  - **Health Score (0–100)** with SVG circular progress gauge.
  - **Letter Grade (A–F)** calibrated across savings rate, envelope adherence, and capital reserves.
  - **Overspending Anomaly Detection**: Highlights category spending leaks and budget breaches.
  - **Emergency Liquidity Roadmap**: Recommends a 6-month living reserve, current months covered, and monthly savings allocation targets.
  - **4-Step Tactical Action Plan**: Prioritized financial moves for the upcoming month.
- **Context-Aware Conversational Chat**:
  - Messenger feed grounded directly in live ledger balances, category distributions, and active savings goals.
  - Interactive prompt suggestion chips for quick financial queries.
- **Deterministic Heuristic Fallback Engine**:
  - Automatically activates if API keys are missing or network quotas are exceeded.
  - Evaluates formulas mathematically to ensure 100% application uptime without crashing.

### 6. 📄 Audit-Grade Monthly Statements
- Month-by-month printable statement views in a clean white-paper layout.
- Detailed tables for cash flow performance, category breakdowns, and transaction entries.
- One-click **Print / Save as PDF** support.

### 7. 🎓 Academic & College Viva Voce Suite
- Built-in technical documentation modal accessible from the navigation bar.
- **Interactive System Architecture Diagram** and **Data Flow Pipeline**.
- **10 Viva Examination Q&A pairs** explaining architectural patterns, financial formulas, and security measures.
- **Exportable Python Flask Backend Reference** (`app.py`) for multi-language evaluation.

### 8. 🌐 Multi-Currency & Session Management
- Instant currency switcher supporting:
  - 🇮🇳 **INR** (`₹`) — Indian Rupee
  - 🇺🇸 **USD** (`$`) — US Dollar
  - 🇪🇺 **EUR** (`€`) — Euro
  - 🇬🇧 **GBP** (`£`) — British Pound
  - 🇯🇵 **JPY** (`¥`) — Japanese Yen
  - 🇨🇦 **CAD** (`C$`) — Canadian Dollar
  - 🇦🇺 **AUD** (`A$`) — Australian Dollar
  - 🇰🇷 **KRW** (`₩`) — South Korean Won
- Local data persistence with **One-Click Demo Account** (Alex Mercer), JSON export backup, and sample dataset reset.

---

## 🏗️ Architecture & Technology Stack

```
+---------------------------------------------------------------------------------+
|                       CLIENT TIER (React 19 + TypeScript)                       |
|                                                                                 |
|  [ DashboardView ]  [ IncomeView ]  [ ExpenseView ]  [ BudgetView ] [ Savings ] |
|  [ AdvisorView: Audit + Chat ]      [ ReportsView: Printable Statements ]       |
|                                                                                 |
|  State Management: Local Storage Persistence + Multi-Currency Normalizer       |
+----------------------------------------+----------------------------------------+
                                         | HTTP / JSON (REST API)
                                         v
+---------------------------------------------------------------------------------+
|                    SERVER TIER (Node.js + Express 4.x)                          |
|                                                                                 |
|  Routes:                                                                        |
|    - POST /api/advisor/audit ---> Financial Health & Anomaly Detector          |
|    - POST /api/advisor/chat  ---> Contextual Advisor Conversational Agent       |
|    - GET  /api/health        ---> Operational Status & Key Readiness           |
|                                                                                 |
|  Controller Logic:                                                              |
|    - Fallback Engine (Deterministic Mathematical Heuristics)                   |
|    - Telemetry Injection (User-Agent: aistudio-build)                           |
+----------------------------------------+----------------------------------------+
                                         | Google GenAI SDK
                                         v
+---------------------------------------------------------------------------------+
|                     AI REASONING TIER (Google Gemini API)                       |
|                                                                                 |
|  Model: gemini-3.8-flash (with automatic fallback to gemini-3.6-flash)          |
|  Capabilities: Structured JSON schema, 4-step action plans, contextual advisory |
+---------------------------------------------------------------------------------+
```

### Technology Breakdown
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion
- **Bundler & Server**: Vite 8, Express 4, `tsx`, `esbuild`
- **AI Integration**: `@google/genai` TypeScript SDK (server-side proxy)
- **Security**: Complete isolation of `GEMINI_API_KEY` on the backend; client never touches private API secrets.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later
- *(Optional)* Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Clone or download the repository:
   ```bash
   git clone <repo-url>
   cd personal-finance-advisor-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```
   *(Note: The app will run smoothly using its built-in rule-based fallback engine even without an API key).*

### Running the Application

- **Development Mode** (with hot reload and Express server):
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Production Build & Execution**:
  ```bash
  npm run build
  npm start
  ```
  The production build compiles Vite client assets to `dist/` and bundles `server.ts` into a standalone `dist/server.cjs` via `esbuild`.

- **Linting & Code Verification**:
  ```bash
  npm run lint
  ```

---

## 📡 API Reference

### 1. Health Check
`GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-22T12:00:00.000Z",
    "model": "gemini-3.8-flash",
    "hasApiKey": true
  }
  ```

### 2. Financial Health Audit
`POST /api/advisor/audit`
- **Request Body**:
  ```json
  {
    "transactions": [...],
    "budgetConfig": { "monthlyOverallCap": 3500, "categoryLimits": {} },
    "savingsGoals": [...],
    "currencySymbol": "$"
  }
  ```
- **Response**: Returns a structured `FinancialAuditResult` including `healthScore`, `letterGrade`, `summary`, `overspendingAlerts`, `emergencyFundRoadmap`, `actionPlan`, and `keyMetrics`.

### 3. Contextual Advisor Chat
`POST /api/advisor/chat`
- **Request Body**:
  ```json
  {
    "message": "How can I reduce my housing expenses?",
    "history": [],
    "transactions": [...],
    "budgetConfig": { ... },
    "savingsGoals": [...],
    "currencySymbol": "$"
  }
  ```
- **Response**: Returns conversational text advice with suggested follow-up chips.

---

## 💡 Academic Viva Voce Highlights

| Question | Key Answer |
| :--- | :--- |
| **Why use Gemini 3.8 Flash?** | Delivers sub-second latency, structured JSON schema output, and low token cost ideal for real-time tabular financial analysis. |
| **How is API key security enforced?** | Server-side proxy design ensures `GEMINI_API_KEY` is never transmitted to or readable by the client browser. |
| **What happens during API outage?** | A deterministic heuristic engine analyzes the ledger via exact mathematical financial formulas with zero crash risk. |
| **How is the Health Score calculated?** | Weighted scoring based on Savings Rate (40%), Budget Envelope adherence (30%), Concentration risk (15%), and Goal progress (15%). |

---

## 📄 License
Licensed under the [Apache License, Version 2.0](LICENSE).
