import React from 'react';
import {
  TrendingUp,
  CreditCard,
  PiggyBank,
  PieChart,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Plus,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Transaction, BudgetConfig, SavingsGoal, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currency';

interface DashboardViewProps {
  transactions: Transaction[];
  budget: BudgetConfig;
  goals: SavingsGoal[];
  currency: CurrencyCode;
  onNavigate: (tab: string) => void;
  onQuickAddIncome?: () => void;
  onQuickAddExpense?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  budget,
  goals,
  currency,
  onNavigate,
  onQuickAddIncome,
  onQuickAddExpense,
}) => {
  const handleAddIncome = onQuickAddIncome || (() => onNavigate('income'));
  const handleAddExpense = onQuickAddExpense || (() => onNavigate('expense'));
  // Aggregate data
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Monthly Budget Burn
  const budgetCap = budget.monthlyOverallCap || 1;
  const budgetBurnPercent = Math.round((totalExpense / budgetCap) * 100);
  const remainingBudget = budgetCap - totalExpense;

  // Overspending badge level
  let budgetStatus: { label: string; color: string; badgeColor: string } = {
    label: 'Healthy Pace',
    color: 'text-emerald-700',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  if (budgetBurnPercent >= 100) {
    budgetStatus = {
      label: 'Critical Overspend',
      color: 'text-red-700',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
    };
  } else if (budgetBurnPercent >= 90) {
    budgetStatus = {
      label: 'High Utilization',
      color: 'text-amber-700',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  } else if (budgetBurnPercent >= 75) {
    budgetStatus = {
      label: 'Moderate Pace',
      color: 'text-blue-700',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  // Category breakdown for expenses
  const categoryExpenses: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === 'expense') {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    }
  }

  const sortedCategories = Object.entries(categoryExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Financial Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time cash flow, category utilization, and active savings roadmap
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            id="dash-quick-income-btn"
            onClick={onQuickAddIncome}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>
          <button
            id="dash-quick-expense-btn"
            onClick={onQuickAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div
          id="metric-total-income"
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Inflows
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalIncome, currency)}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{transactions.filter((t) => t.type === 'income').length} active streams</span>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div
          id="metric-total-expense"
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Outflows
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalExpense, currency)}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
              <span>{transactions.filter((t) => t.type === 'expense').length} recorded debits</span>
            </div>
          </div>
        </div>

        {/* Net Savings Card */}
        <div
          id="metric-net-savings"
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Savings
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold tracking-tight ${
                netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(netSavings, currency)}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  savingsRate >= 20
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : savingsRate >= 0
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {savingsRate}% Savings Rate
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Budget Cap Card */}
        <div
          id="metric-budget-burn"
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Budget Burn
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {budgetBurnPercent}%
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${budgetStatus.badgeColor}`}
              >
                {budgetStatus.label}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetBurnPercent > 100
                    ? 'bg-rose-600'
                    : budgetBurnPercent > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, budgetBurnPercent)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
              Remaining: {formatCurrency(Math.max(0, remainingBudget), currency)}
            </p>
          </div>
        </div>
      </div>

      {/* AI Advisor Teaser Callout */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">
                AI Financial Health Audit Ready
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Comprehensive 4-step action plan, overspending anomaly detection, and emergency fund roadmapping.
            </p>
          </div>
        </div>
        <button
          id="dash-run-advisor-audit-btn"
          onClick={() => onNavigate('advisor')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shrink-0 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Audit & Advisor</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2-Column Split: Top Spending Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Expense Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Outflow Categories</h2>
              <p className="text-xs text-slate-500">Major contributors to monthly burn</p>
            </div>
            <button
              onClick={() => onNavigate('budget')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Manage Budgets &rarr;
            </button>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No expense records found.
            </div>
          ) : (
            <div className="space-y-3.5">
              {sortedCategories.map(([category, amount]) => {
                const percentOfTotal = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                const catLimit = budget.categoryLimits[category] || 0;
                const isOver = catLimit > 0 && amount > catLimit;

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        {category}
                        {isOver && (
                          <span title="Exceeds category budget">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(amount, currency)}{' '}
                        <span className="text-slate-400 font-normal">({percentOfTotal}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-red-500' : 'bg-slate-800'
                        }`}
                        style={{ width: `${Math.min(100, percentOfTotal)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Ledger Activity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-500">Latest ledger postings</p>
            </div>
            <button
              onClick={() => onNavigate('expense')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              View All &rarr;
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {tx.category} &bull; {tx.date}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-xs font-bold font-mono ${
                      tx.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Savings Goals Progress Bar Snippet */}
      {goals.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Target Savings Milestones</h2>
              <p className="text-xs text-slate-500">Active goals tracking towards completion</p>
            </div>
            <button
              onClick={() => onNavigate('savings')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Manage Goals &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {goals.slice(0, 3).map((goal) => {
              const progress = Math.min(
                100,
                Math.round((goal.current_amount / (goal.target_amount || 1)) * 100)
              );
              return (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate max-w-[160px]">
                      {goal.goal_name}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{formatCurrency(goal.current_amount, currency)}</span>
                    <span className="text-slate-400">Target: {formatCurrency(goal.target_amount, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
