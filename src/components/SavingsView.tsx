import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  Trash2,
  X,
  Coins,
  ArrowUpRight,
} from 'lucide-react';
import { SavingsGoal, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currency';

interface SavingsViewProps {
  goals: SavingsGoal[];
  currency: CurrencyCode;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onQuickDeposit: (goalId: string, amount: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  goals,
  currency,
  onAddGoal,
  onQuickDeposit,
  onDeleteGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Add goal form
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  });

  // Aggregates
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const initial = parseFloat(initialAmount) || 0;
    if (isNaN(target) || target <= 0 || !goalName.trim()) return;

    onAddGoal({
      goal_name: goalName.trim(),
      target_amount: target,
      current_amount: initial,
      deadline,
    });

    setGoalName('');
    setTargetAmount('');
    setInitialAmount('');
    setShowAddModal(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositGoal) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    onQuickDeposit(activeDepositGoal.id, amount);
    setDepositAmount('');
    setActiveDepositGoal(null);
  };

  const quickPillAmounts = [50, 100, 250, 500];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-emerald-600" />
            <span>Savings Goals</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Target wealth milestones, emergency cushions, and major capital expenditures
          </p>
        </div>
        <button
          id="open-add-goal-modal-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Target</span>
        </button>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Accumulated Capital
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalSaved, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{goals.length} active savings targets</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Aggregate Milestone Target
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalTarget, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Cumulative goal commitment</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Portfolio Milestone Progress
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {overallProgress}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200/90 shadow-2xs">
            <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No savings targets configured</p>
            <p className="text-xs text-slate-400 mt-1">
              Establish a goal like "Emergency Reserve" or "Home Down Payment" to begin.
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = Math.min(
              100,
              Math.round((goal.current_amount / (goal.target_amount || 1)) * 100)
            );
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={goal.id}
                className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {goal.goal_name}
                    </h3>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-xl font-bold text-slate-900 font-mono">
                        {formatCurrency(goal.current_amount, currency)}
                      </span>
                      <span className="text-slate-400 font-medium ml-1">
                        / {formatCurrency(goal.target_amount, currency)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                      {progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress >= 100 ? 'bg-emerald-500' : 'bg-slate-900'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>
                      {remaining === 0 ? 'Goal Completed 🎉' : `${formatCurrency(remaining, currency)} remaining`}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Due'}
                    </span>
                  </div>
                </div>

                <button
                  id={`deposit-btn-${goal.id}`}
                  onClick={() => setActiveDepositGoal(goal)}
                  className="w-full py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quick Deposit</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Deposit Modal */}
      {activeDepositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Deposit to: {activeDepositGoal.goal_name}</span>
              </h2>
              <button
                onClick={() => setActiveDepositGoal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deposit Amount ({currency})
                </label>
                <input
                  id="deposit-amount-input"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="e.g. 150"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-bold"
                />
              </div>

              {/* Quick Pills */}
              <div className="flex items-center gap-2">
                {quickPillAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt.toString())}
                    className="flex-1 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors"
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDepositGoal(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="confirm-deposit-btn"
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs"
                >
                  Confirm Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Create Savings Milestone</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Goal Name / Purpose
                </label>
                <input
                  id="goal-name-input"
                  type="text"
                  required
                  placeholder="e.g. 6-Month Emergency Cushion"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Amount ({currency})
                </label>
                <input
                  id="goal-target-amount-input"
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="e.g. 15000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Seed Deposit ({currency})
                </label>
                <input
                  id="goal-initial-amount-input"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 500"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Completion Deadline
                </label>
                <input
                  id="goal-deadline-input"
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="save-goal-submit-btn"
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs"
                >
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
