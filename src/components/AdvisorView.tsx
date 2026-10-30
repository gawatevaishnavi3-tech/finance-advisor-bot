import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Send,
  MessageSquare,
  Activity,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Compass,
  CheckCircle2,
  DollarSign,
  Info,
} from 'lucide-react';
import {
  FinancialAuditResult,
  ChatMessage,
  Transaction,
  BudgetConfig,
  SavingsGoal,
  CurrencyCode,
} from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import { generateFallbackAnalysis, generateLocalAdvisorChat } from '../utils/financialEngine';

interface AdvisorViewProps {
  transactions: Transaction[];
  budget: BudgetConfig;
  goals: SavingsGoal[];
  currency: CurrencyCode;
}

export const AdvisorView: React.FC<AdvisorViewProps> = ({
  transactions,
  budget,
  goals,
  currency,
}) => {
  const [activeSection, setActiveSection] = useState<'audit' | 'chat'>('audit');

  // Audit State
  const [auditResult, setAuditResult] = useState<FinancialAuditResult | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: "Hello! I am your AI Financial Advisor powered by Gemini 2.5 Flash. I'm connected to your live financial ledger. Ask me about cutting expenses, optimizing your budget, or reaching your savings goals faster.",
      timestamp: Date.now(),
      suggestions: [
        'How can I save $300 more this month?',
        'Is my food spending too high?',
        'How should I allocate my bonus?',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-run audit on initial load if not run yet
  useEffect(() => {
    if (!auditResult && !loadingAudit) {
      handleRunAudit();
    }
  }, []);

  // Auto scroll chat
  useEffect(() => {
    if (activeSection === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeSection]);

  const handleRunAudit = async () => {
    setLoadingAudit(true);
    setAuditError(null);

    try {
      const res = await fetch('/api/advisor/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          budgetConfig: budget,
          savingsGoals: goals,
          currencySymbol: getCurrencySymbol(currency),
        }),
      });

      if (!res.ok) {
        throw new Error(`Audit request failed with status: ${res.status}`);
      }

      const data: FinancialAuditResult = await res.json();
      setAuditResult(data);
    } catch (err: any) {
      console.warn('Remote audit unavailable, utilizing local financial intelligence engine:', err);
      // Run resilient local rule-based financial audit engine
      const fallbackResult = generateFallbackAnalysis(
        transactions,
        budget,
        goals,
        getCurrencySymbol(currency)
      );
      setAuditResult(fallbackResult);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || loadingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoadingChat(true);

    try {
      const history = chatMessages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          transactions,
          budgetConfig: budget,
          savingsGoals: goals,
          currencySymbol: getCurrencySymbol(currency),
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat request failed: ${res.status}`);
      }

      const data: { text: string; suggestions?: string[] } = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: Date.now(),
        suggestions: data.suggestions || [
          'How can I trim my highest expense?',
          'What is the 50/30/20 rule?',
          'Help me plan for an emergency fund',
        ],
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('Remote chat endpoint unavailable, executing local financial intelligence engine:', err);
      const localReply = generateLocalAdvisorChat(
        message,
        transactions,
        budget,
        goals,
        getCurrencySymbol(currency)
      );

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: localReply.text,
        timestamp: Date.now(),
        suggestions: localReply.suggestions,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Grade badge styling
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'B':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'C':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'D':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      default:
        return 'bg-red-50 text-red-700 border-red-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <span>AI Financial Advisor</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated financial health audit and real-time conversational ledger advisory
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            id="tab-health-audit-btn"
            onClick={() => setActiveSection('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeSection === 'audit'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Health Audit</span>
          </button>
          <button
            id="tab-advisor-chat-btn"
            onClick={() => setActiveSection('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeSection === 'chat'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Advisor Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>
        </div>
      </div>

      {/* SECTION 1: FINANCIAL HEALTH AUDIT */}
      {activeSection === 'audit' && (
        <div className="space-y-6">
          {/* Audit Controls & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {auditResult
                  ? `Last evaluated: ${new Date(auditResult.generatedAt).toLocaleTimeString()} (${
                      auditResult.source === 'gemini' ? 'Gemini 2.5 Flash' : 'Rule-Engine Fallback'
                    })`
                  : 'Ready to evaluate'}
              </span>
            </div>
            <button
              id="re-run-audit-btn"
              onClick={handleRunAudit}
              disabled={loadingAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
              <span>{loadingAudit ? 'Evaluating Ledger...' : 'Re-Run Audit'}</span>
            </button>
          </div>

          {loadingAudit && !auditResult ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                Evaluating Financial Ledger with Gemini 2.5 Flash
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Auditing income stability, budget envelopes, overspending risks, and 6-month emergency adequacy...
              </p>
            </div>
          ) : auditResult ? (
            <>
              {/* Score & Summary Banner */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Clean SVG Circular Gauge (Anti-Slop) */}
                  <div className="relative w-32 h-32 shrink-0 flex items-center justify-center mx-auto md:mx-0">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                      {/* Background track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-slate-100"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      {/* Progress ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className={`${
                          auditResult.healthScore >= 80
                            ? 'stroke-emerald-600'
                            : auditResult.healthScore >= 60
                            ? 'stroke-blue-600'
                            : auditResult.healthScore >= 45
                            ? 'stroke-amber-500'
                            : 'stroke-rose-600'
                        } transition-all duration-1000 ease-out`}
                        strokeWidth="8"
                        strokeDasharray={263.89}
                        strokeDashoffset={263.89 - (263.89 * auditResult.healthScore) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {auditResult.healthScore}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Score / 100
                      </span>
                    </div>
                  </div>

                  {/* Summary & Letter Grade */}
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Financial Health Rating
                      </span>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getGradeBadge(
                          auditResult.letterGrade
                        )}`}
                      >
                        Grade: {auditResult.letterGrade}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {auditResult.summary}
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
                        Savings Rate:{' '}
                        <strong className="text-slate-900">
                          {auditResult.keyMetrics.savingsRatePercent}%
                        </strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
                        Top Expense:{' '}
                        <strong className="text-slate-900">
                          {auditResult.keyMetrics.topExpenseCategory}
                        </strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
                        Net Cash Flow:{' '}
                        <strong className="text-slate-900">
                          {formatCurrency(auditResult.keyMetrics.netSavings, currency)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overspending Alerts & Recommended Adjustments Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overspending Alerts */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Overspending Anomaly Alerts</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {auditResult.overspendingAlerts.length} Flagged
                    </span>
                  </div>

                  {auditResult.overspendingAlerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-emerald-700 bg-emerald-50/50 rounded-lg border border-emerald-100 p-4">
                      <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                      <strong>No critical budget breaches detected.</strong>
                      <p className="text-slate-600 mt-0.5">All monitored category burn rates are currently within boundaries.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {auditResult.overspendingAlerts.map((alert, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{alert.category}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                  alert.severity === 'Critical'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : alert.severity === 'High'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-slate-500 mt-1">
                              Recorded: <span className="font-semibold">{formatCurrency(alert.spent, currency)}</span> vs Cap of{' '}
                              <span className="font-semibold">{formatCurrency(alert.limit, currency)}</span>
                            </p>
                          </div>
                          {alert.excess > 0 && (
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-red-600 text-xs">
                                +{formatCurrency(alert.excess, currency)}
                              </span>
                              <p className="text-[10px] text-slate-400">excess burn</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Emergency Fund Roadmap */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Emergency Liquidity Roadmap</span>
                    </h3>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                      {auditResult.emergencyFundRoadmap.monthsCovered} Months Covered
                    </span>
                  </div>

                  <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Target 6-Month Liquidity Cushion:</span>
                      <strong className="text-slate-900 font-mono">
                        {formatCurrency(auditResult.emergencyFundRoadmap.recommendedEmergencyFund, currency)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Current Liquid Reserves:</span>
                      <strong className="text-emerald-700 font-mono">
                        {formatCurrency(auditResult.emergencyFundRoadmap.currentEmergencySavings, currency)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                      <span className="text-slate-500">Recommended Monthly Allocation:</span>
                      <strong className="text-slate-900 font-mono">
                        {formatCurrency(auditResult.emergencyFundRoadmap.monthlySavingsTarget, currency)}/mo
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic">
                    "{auditResult.emergencyFundRoadmap.recommendation}"
                  </p>
                </div>
              </div>

              {/* 4-Step Action Plan */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-slate-900" />
                      <span>Next Month 4-Step Action Plan</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prioritized tactical optimizations synthesized by the financial model
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditResult.actionPlan.map((action) => (
                    <div
                      key={action.step}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">
                            {action.step}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{action.title}</h4>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {action.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {action.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200/90 shadow-2xs">
              <Bot className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Audit Not Yet Generated</p>
              <button
                onClick={handleRunAudit}
                className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
              >
                Launch Audit Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CONVERSATIONAL ADVISOR CHAT */}
      {activeSection === 'chat' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col h-[650px] overflow-hidden">
          {/* Messenger Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>FinAdvisor Assistant</span>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Live Ledger Context
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Grounded in your active income, categorized expenses & savings goals
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setChatMessages([
                  {
                    id: 'welcome-reset',
                    sender: 'assistant',
                    text: 'Chat history cleared. How can I assist your financial planning today?',
                    timestamp: Date.now(),
                    suggestions: [
                      'How can I save $300 more this month?',
                      'Is my food spending too high?',
                      'How should I allocate my bonus?',
                    ],
                  },
                ])
              }
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear Feed
            </button>
          </div>

          {/* Chat Messages Feed */}
          <div
            ref={chatScrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/20"
          >
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-2xs whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Quick Follow-up suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loadingChat && (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center animate-pulse">
                  <Bot className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <span>Advisor is reviewing your ledger data...</span>
              </div>
            )}
          </div>

          {/* Message Input Box */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="advisor-chat-input"
                type="text"
                placeholder="Ask about your budget, cutting expenses, or savings goals..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loadingChat}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
              />
              <button
                id="send-advisor-msg-btn"
                type="submit"
                disabled={!inputMessage.trim() || loadingChat}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors shrink-0 shadow-2xs"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
