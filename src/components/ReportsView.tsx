import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  TrendingUp,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Transaction, BudgetConfig, SavingsGoal, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currency';

interface ReportsViewProps {
  transactions: Transaction[];
  budget: BudgetConfig;
  goals: SavingsGoal[];
  currency: CurrencyCode;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  budget,
  goals,
  currency,
}) => {
  // Extract distinct available months from transactions
  const availableMonths = Array.from(
    new Set(transactions.map((t) => t.date.substring(0, 7)))
  ).sort().reverse();

  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0] || currentMonthStr
  );

  // Filter transactions by selected month
  const monthlyTx = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const monthlyInflows = monthlyTx.filter((t) => t.type === 'income');
  const monthlyOutflows = monthlyTx.filter((t) => t.type === 'expense');

  const totalInflow = monthlyInflows.reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = monthlyOutflows.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalInflow - totalOutflow;
  const savingsRate = totalInflow > 0 ? Math.round((netSavings / totalInflow) * 100) : 0;

  // Category breakdown for this month
  const categoryTotals: Record<string, number> = {};
  monthlyOutflows.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const highestExpenseCategory = sortedCategories[0] ? sortedCategories[0][0] : 'None';
  const highestExpenseAmount = sortedCategories[0] ? sortedCategories[0][1] : 0;

  const handlePrint = () => {
    window.print();
  };

  // Format month name e.g. "October 2026"
  const formatMonthName = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-slate-900" />
            <span>Monthly Financial Statements</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit-grade printable account summaries and cash flow statements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Statement Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          <button
            id="print-statement-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Statement Document (Pure White Paper) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 sm:p-10 max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">FinAdvisor AI</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                Official Statement
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Personal Financial Performance & Ledger Audit Report
            </p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <p className="font-semibold text-slate-900">Period: {formatMonthName(selectedMonth)}</p>
            <p className="text-slate-400 mt-0.5">Generated: {new Date().toLocaleDateString()}</p>
            <p className="text-slate-400">Currency: {currency}</p>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Monthly Cash Flow Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500">Total Inflows</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrency(totalInflow, currency)}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500">Total Outflows</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrency(totalOutflow, currency)}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500">Net Surplus / Saved</span>
              <p
                className={`text-lg font-bold mt-1 ${
                  netSavings >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatCurrency(netSavings, currency)}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500">Savings Rate</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {savingsRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Key Observations & Highest Category */}
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500">Highest Outflow Category:</span>
            <span className="ml-2 font-bold text-slate-900">{highestExpenseCategory}</span>
            <span className="ml-1 text-slate-500">({formatCurrency(highestExpenseAmount, currency)})</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Budget Adherence:</span>
            <span className="ml-2 font-bold text-slate-900">
              {budget.monthlyOverallCap > 0
                ? `${Math.round((totalOutflow / budget.monthlyOverallCap) * 100)}% of cap consumed`
                : 'No cap set'}
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Expenditure Distribution by Category
          </h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Budget Cap</th>
                <th className="py-2 text-right">Actual Spent</th>
                <th className="py-2 text-right">% of Total</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCategories.map(([cat, amt]) => {
                const limit = budget.categoryLimits[cat] || 0;
                const percentOfTotal = totalOutflow > 0 ? Math.round((amt / totalOutflow) * 100) : 0;
                const isOver = limit > 0 && amt > limit;

                return (
                  <tr key={cat}>
                    <td className="py-2.5 font-medium text-slate-900">{cat}</td>
                    <td className="py-2.5 text-right font-mono text-slate-500">
                      {limit > 0 ? formatCurrency(limit, currency) : '—'}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(amt, currency)}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-500">{percentOfTotal}%</td>
                    <td className="py-2.5 text-right">
                      {isOver ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Over Limit
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Within Cap
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Transaction Ledger Records for Month */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recorded Transactions for {formatMonthName(selectedMonth)} ({monthlyTx.length} items)
          </h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2">Date</th>
                <th className="py-2">Description</th>
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {monthlyTx.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2 text-slate-500">{tx.date}</td>
                  <td className="py-2 font-sans font-medium text-slate-900">{tx.description}</td>
                  <td className="py-2 font-sans text-slate-600">{tx.category}</td>
                  <td
                    className={`py-2 text-right font-bold ${
                      tx.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Advisor Sign-off & Disclaimers */}
        <div className="border-t border-slate-200 pt-6 text-[11px] text-slate-400 space-y-1">
          <p>
            This statement is produced by the FinAdvisor AI personal ledger engine. All transactions are client-verified.
          </p>
          <p>
            Automated calculations and recommendations adhere to standard financial planning practices (e.g. 50/30/20 allocation and 6-month liquidity reserves).
          </p>
        </div>
      </div>
    </div>
  );
};
