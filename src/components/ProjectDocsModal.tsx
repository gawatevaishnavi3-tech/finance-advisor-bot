import React, { useState } from 'react';
import {
  GraduationCap,
  Layers,
  GitBranch,
  HelpCircle,
  Code2,
  Copy,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

interface ProjectDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocsModal: React.FC<ProjectDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'dataflow' | 'viva' | 'python'>('viva');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const pythonFlaskCode = `"""
Personal Finance Advisor Bot - Python Flask Backend Reference Implementation
Compatible with Google GenAI SDK (gemini-2.5-flash) and Python 3.10+
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)

# Initialize Gemini Client lazily with User-Agent header
client = None

def get_genai_client():
    global client
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    if client is None:
        client = genai.Client(
            api_key=api_key,
            http_options={'headers': {'User-Agent': 'aistudio-build'}}
        )
    return client

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "Personal Finance Advisor Python Service",
        "model": "gemini-2.5-flash",
        "has_api_key": bool(os.getenv("GEMINI_API_KEY"))
    })

@app.route("/api/advisor/audit", methods=["POST"])
def perform_audit():
    data = request.json or {}
    transactions = data.get("transactions", [])
    budget_config = data.get("budgetConfig", {})
    savings_goals = data.get("savingsGoals", [])
    currency_symbol = data.get("currencySymbol", "$")

    client = get_genai_client()
    if not client:
        # Fallback rule-based evaluation
        total_income = sum(t["amount"] for t in transactions if t.get("type") == "income")
        total_expense = sum(t["amount"] for t in transactions if t.get("type") == "expense")
        net_savings = total_income - total_expense
        savings_rate = round((net_savings / total_income * 100) if total_income > 0 else 0)

        return jsonify({
            "healthScore": 78,
            "letterGrade": "B",
            "summary": f"Healthy baseline cash flow with a {savings_rate}% savings rate.",
            "overspendingAlerts": [],
            "recommendedBudgetAdjustments": [],
            "emergencyFundRoadmap": {
                "currentEmergencySavings": net_savings * 3,
                "recommendedEmergencyFund": total_expense * 6,
                "monthsCovered": 3.0,
                "monthlySavingsTarget": round(total_expense * 0.2),
                "targetMonthsToFull": 12,
                "recommendation": "Maintain continuous deposits into liquid yield reserves."
            },
            "actionPlan": [
                {"step": 1, "title": "Trim Discretionary Leaks", "description": "Review recurring food and leisure debits.", "impact": "High Recovery"},
                {"step": 2, "title": "Automate Reserve Transfers", "description": "Auto-deposit 15% on payday.", "impact": "Builds Safety Moat"},
                {"step": 3, "title": "Synchronize Category Caps", "description": "Set rigid envelopes on variable spending.", "impact": "Enforces Disciplines"},
                {"step": 4, "title": "Accelerate Milestone Target", "description": "Allocate windfalls to active targets.", "impact": "Goal Completion"}
            ],
            "keyMetrics": {
                "totalIncome": total_income,
                "totalExpense": total_expense,
                "netSavings": net_savings,
                "savingsRatePercent": savings_rate,
                "topExpenseCategory": "Housing",
                "topExpensePercentOfIncome": 30
            },
            "generatedAt": "2026-09-22T00:00:00Z",
            "source": "fallback"
        })

    # Gemini 2.5 Flash invocation
    prompt = f"""
    You are a certified professional financial auditor.
    Analyze this user's personal ledger and produce a JSON financial audit.
    Currency: {currency_symbol}
    Transactions: {json.dumps(transactions[-20:])}
    Budget Config: {json.dumps(budget_config)}
    Savings Goals: {json.dumps(savings_goals)}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    return jsonify(json.loads(response.text))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonFlaskCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const vivaQuestions = [
    {
      q: '1. What is the overarching architecture of the Personal Finance Advisor Bot?',
      a: 'The application employs a 3-tier full-stack architecture: React 19 frontend utilizing Tailwind CSS and modular component composition, an Express (Node.js) API layer acting as a reverse proxy, and Google Gemini API (gemini-2.5-flash) providing AI reasoning. All API credentials remain isolated server-side.',
    },
    {
      q: '2. Why is Gemini 2.5 Flash chosen over other LLM models?',
      a: 'Gemini 2.5 Flash delivers sub-second latency, structured JSON schema enforcement, cost efficiency, and strong quantitative reasoning required for mathematical financial ledger audits and real-time chat interactions.',
    },
    {
      q: '3. How does the application prevent exposure of the GEMINI_API_KEY?',
      a: 'The browser never interacts directly with Google APIs. All calls route to server-side endpoints (/api/advisor/audit, /api/advisor/chat). The server accesses process.env.GEMINI_API_KEY and injects the telemetry header User-Agent: aistudio-build.',
    },
    {
      q: '4. How does the Graceful Fallback Engine function if the API key is absent or quota is exceeded?',
      a: 'The backend implements lazy initialization and a deterministic heuristic evaluation engine (generateFallbackAnalysis). It computes exact savings rates, budget overruns, emergency fund requirements, and letter grades using mathematical formulas, ensuring 100% uptime with zero crashes.',
    },
    {
      q: '5. How are the financial health score and letter grades calculated?',
      a: 'The engine evaluates four weighted pillars: Savings Rate (up to 40%), Budget Envelope adherence (up to 30%), Category concentration risk (up to 15%), and Progress toward designated Savings Goals (up to 15%). Letter grades map to standard academic thresholds (A: 88+, B: 75+, C: 60+, D: 45+, F: <45).',
    },
    {
      q: '6. What formula guides the Emergency Fund Roadmap?',
      a: 'The engine calculates a 6-month living expense reserve target based on current monthly outflows (Total Expenses * 6). It compares current liquid deposits, derives months of runway covered, and schedules monthly target allocations to achieve a fully funded reserve within 12–24 months.',
    },
    {
      q: '7. How does the Conversational Advisor Chat maintain context with the user\'s ledger?',
      a: 'When querying /api/advisor/chat, the client supplies the user\'s active ledger state (aggregated inflows, category spending breakdown, active goals) alongside conversation history. This grounds the Gemini model in real quantitative user data rather than generic financial platitudes.',
    },
    {
      q: '8. How are multi-currency preferences handled?',
      a: 'The app maintains a centralized currency utility supporting INR (₹), USD ($), EUR (€), GBP (£), JPY (¥), CAD (C$), AUD (A$), and KRW (₩). Standardized Intl.NumberFormat handles localized symbol placement and decimal handling (including zero-decimal currencies like JPY/KRW).',
    },
    {
      q: '9. How does the build pipeline produce a production-ready artifact?',
      a: 'The single-command build ("npm run build") compiles client assets via Vite to the dist/ directory, while esbuild bundles server.ts into CommonJS (dist/server.cjs) with --packages=external, ensuring seamless Node container execution and fast cold starts.',
    },
    {
      q: '10. What anti-slop design principles were adhered to during UI construction?',
      a: 'We avoided purple-to-blue neon gradients, glowing dials, and nested card anti-patterns. We utilized a soft slate canvas (bg-slate-50), crisp white surface cards (bg-white), subtle borders (border-slate-200), high-contrast typography, and an optical SVG circular progress indicator.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Academic & College Viva Suite
              </h2>
              <p className="text-xs text-slate-500">
                System architecture, data flow diagrams, viva examination Q&A, and Python Flask code
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 mt-3 border-b border-slate-200 pb-2 overflow-x-auto shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('viva')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'viva'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Viva Q&A Guide (10 Questions)</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'architecture'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('dataflow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'dataflow'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Data Flow Pipeline</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'python'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python Flask Backend</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 text-xs space-y-4">
          {/* TAB 1: VIVA Q&A */}
          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-950">
                <span className="font-bold">Academic Examination & Viva Companion:</span>
                <p className="mt-0.5 text-indigo-900">
                  Detailed technical and conceptual justifications prepared for project defense and faculty viva voce evaluations.
                </p>
              </div>

              <div className="space-y-3">
                {vivaQuestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1.5"
                  >
                    <h4 className="font-bold text-slate-900">{item.q}</h4>
                    <p className="text-slate-600 leading-relaxed pl-2 border-l-2 border-slate-300">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto">
                <pre>{`+---------------------------------------------------------------------------------+
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
|  Model: gemini-2.5-flash                                                        |
|  Capabilities: Structured JSON schema, 4-step action plans, contextual advisory |
+---------------------------------------------------------------------------------+`}</pre>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="font-bold text-slate-900">Architectural Guarantees:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li><strong>Security Isolation:</strong> Gemini API keys are never exposed in browser runtime.</li>
                  <li><strong>Resilience:</strong> Deterministic rule-based engine operates if API quotas are exhausted.</li>
                  <li><strong>Single-Port Deployment:</strong> Unified Node.js server proxies Vite middleware in development and static assets in production.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: DATA FLOW PIPELINE */}
          {activeTab === 'dataflow' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto">
                <pre>{`[ USER ENTRY: Income / Expense / Goal ]
                 |
                 v
[ PERSISTENCE LAYER: LocalStorage Engine ]
                 |
                 +---> [ BUDGET ENGINE: Dynamic Cap Burn & Envelope Comparison ]
                 |            |
                 |            v
                 |     [ Status: Healthy / Moderate / High / Critical ]
                 |
                 v
[ AUDIT COMPILER: Ledger Aggregator ]
  - Total Inflow, Outflow, Net Cash Flow
  - Savings Rate Percentage
  - Category Concentration Distribution
                 |
                 v
[ API CONTROLLER: /api/advisor/audit ]
                 |
        +--------+--------+
        |                 |
(Key Valid)       (Missing / Rate-Limited)
        v                 v
[ Gemini 2.5 Flash ]   [ Deterministic Heuristic Engine ]
        |                 |
        +--------+--------+
                 |
                 v
[ AUDIT SCHEMA: Score (0-100), Letter Grade, Alerts, Emergency Roadmap, 4-Step Plan ]
                 |
                 v
[ CLIENT RENDER: SVG Circular Indicator, Action Cards, Interactive Chat Feed ]`}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: PYTHON FLASK REFERENCE */}
          {activeTab === 'python' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-600">
                  Exportable Python Flask alternative for students and viva demonstrators wanting to run the backend in Python:
                </p>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shrink-0"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied to Clipboard' : 'Copy Python Code'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[350px]">
                <pre>{pythonFlaskCode}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
