import React, { useState } from 'react';
import {
  PieChart,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  X,
  TrendingDown,
} from 'lucide-react';
import { BudgetConfig, Transaction, CurrencyCode } from '../types';
import { EXPENSE_CATEGORIES } from '../utils/storage';
import { formatCurrency } from '../utils/currency';

interface BudgetViewProps {
  budget: BudgetConfig;
  transactions: Transaction[];
  currency: CurrencyCode;
  onUpdateBudget: (budget: BudgetConfig) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budget,
  transactions,
  currency,
  onUpdateBudget,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [overallCap, setOverallCap] = useState(budget.monthlyOverallCap.toString());
  const [categoryLimitsState, setCategoryLimitsState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      initial[cat] = (budget.categoryLimits[cat] || 0).toString();
    });
    return initial;
  });

  // Calculate actual spending for each category
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryExpenses: Record<string, number> = {};
  for (const t of expenseTransactions) {
    categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
  }

  // Monthly Overall Cap calculations
  const cap = budget.monthlyOverallCap || 1;
  const overallBurnPercent = Math.round((totalExpense / cap) * 100);
  const remainingOverall = budget.monthlyOverallCap - totalExpense;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newCap = parseFloat(overallCap) || 0;
    const newLimits: Record<string, number> = {};

    EXPENSE_CATEGORIES.forEach((cat) => {
      newLimits[cat] = parseFloat(categoryLimitsState[cat]) || 0;
    });

    onUpdateBudget({
      monthlyOverallCap: newCap,
      categoryLimits: newLimits,
    });
    setShowEditModal(false);
  };

  const openModal = () => {
    setOverallCap(budget.monthlyOverallCap.toString());
    const current: Record<string, string> = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      current[cat] = (budget.categoryLimits[cat] || 0).toString();
    });
    setCategoryLimitsState(current);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <span>Budgeting Engine</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure dynamic overall caps and monitor category envelope thresholds
          </p>
        </div>
        <button
          id="open-budget-config-btn"
          onClick={openModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors shrink-0"
        >
          <Sliders className="w-4 h-4" />
          <span>Adjust Budget Caps</span>
        </button>
      </div>

      {/* Master Monthly Spending Cap Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monthly Spending Envelope
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  overallBurnPercent >= 100
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : overallBurnPercent >= 90
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : overallBurnPercent >= 70
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {overallBurnPercent >= 100
                  ? 'Critical Breached'
                  : overallBurnPercent >= 90
                  ? 'High Utilization'
                  : overallBurnPercent >= 70
                  ? 'Moderate Pace'
                  : 'Healthy Pace'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {formatCurrency(totalExpense, currency)}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {formatCurrency(budget.monthlyOverallCap, currency)} Cap
              </span>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs font-semibold text-slate-500">Remaining Spending Power</p>
            <p
              className={`text-xl font-bold font-mono mt-0.5 ${
                remainingOverall >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {remainingOverall >= 0 ? '+' : '-'}
              {formatCurrency(Math.abs(remainingOverall), currency)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {overallBurnPercent}% of monthly ceiling consumed
            </p>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallBurnPercent >= 100
                ? 'bg-rose-600'
                : overallBurnPercent >= 90
                ? 'bg-amber-500'
                : overallBurnPercent >= 70
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}
            style={{ width: `${Math.min(100, overallBurnPercent)}%` }}
          />
        </div>
      </div>

      {/* Category Envelopes Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Category Spending Limits</h2>
          <span className="text-xs text-slate-500">{EXPENSE_CATEGORIES.length} Active Envelopes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPENSE_CATEGORIES.map((category) => {
            const spent = categoryExpenses[category] || 0;
            const limit = budget.categoryLimits[category] || 0;
            const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const remaining = limit - spent;

            let badge = { label: 'Uncapped', color: 'bg-slate-100 text-slate-600 border-slate-200' };
            if (limit > 0) {
              if (percent >= 100) {
                badge = { label: 'Critical Overspend', color: 'bg-red-50 text-red-700 border-red-200' };
              } else if (percent >= 90) {
                badge = { label: 'High (≥90%)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
              } else if (percent >= 70) {
                badge = { label: 'Moderate (≥70%)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
              } else {
                badge = { label: 'Healthy', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
              }
            }

            return (
              <div
                key={category}
                className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{category}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Spent: <span className="font-semibold text-slate-900">{formatCurrency(spent, currency)}</span> of{' '}
                      <span className="font-semibold">{limit > 0 ? formatCurrency(limit, currency) : 'No Cap'}</span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {limit > 0 ? (
                  <>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percent >= 100
                            ? 'bg-rose-600'
                            : percent >= 90
                            ? 'bg-amber-500'
                            : percent >= 70
                            ? 'bg-blue-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-400">{percent}% utilized</span>
                      <span
                        className={`font-semibold ${
                          remaining >= 0 ? 'text-slate-600' : 'text-rose-600'
                        }`}
                      >
                        {remaining >= 0 ? `${formatCurrency(remaining, currency)} remaining` : `${formatCurrency(Math.abs(remaining), currency)} over cap`}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Click "Adjust Budget Caps" to establish a spending boundary for this category.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Caps Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Configure Budget Ceilings</span>
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4 mt-4 text-xs overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Overall Monthly Spending Cap ({currency})
                </label>
                <input
                  id="budget-overall-cap-input"
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={overallCap}
                  onChange={(e) => setOverallCap(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Absolute monthly spending ceiling before critical alert triggers.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-2">Category Envelope Limits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <div key={cat}>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1 truncate">
                        {cat}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={categoryLimitsState[cat] || '0'}
                        onChange={(e) =>
                          setCategoryLimitsState({
                            ...categoryLimitsState,
                            [cat]: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="budget-save-caps-btn"
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-2xs"
                >
                  Save Budget Caps
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
