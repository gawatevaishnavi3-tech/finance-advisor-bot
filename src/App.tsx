import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { IncomeView } from './components/IncomeView';
import { ExpenseView } from './components/ExpenseView';
import { BudgetView } from './components/BudgetView';
import { SavingsView } from './components/SavingsView';
import { AdvisorView } from './components/AdvisorView';
import { ReportsView } from './components/ReportsView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ProjectDocsModal } from './components/ProjectDocsModal';
import {
  TabType,
  Transaction,
  BudgetConfig,
  SavingsGoal,
  User,
  CurrencyCode,
} from './types';
import {
  loadTransactions,
  saveTransactions,
  loadBudgetConfig,
  saveBudgetConfig,
  loadSavingsGoals,
  saveSavingsGoals,
  loadCurrentUser,
  saveCurrentUser,
  resetToSampleData,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [user, setUser] = useState<User | null>(null);

  // Core Financial State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<BudgetConfig>({
    monthlyOverallCap: 4500,
    categoryLimits: {},
  });
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedTx = loadTransactions();
    const loadedBudget = loadBudgetConfig();
    const loadedGoals = loadSavingsGoals();
    const loadedUser = loadCurrentUser();

    setTransactions(loadedTx);
    setBudget(loadedBudget);
    setGoals(loadedGoals);
    setUser(loadedUser);
    if (loadedUser?.preferredCurrency) {
      setCurrency(loadedUser.preferredCurrency);
    }
  }, []);

  // Save changes to localStorage
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    const updated = [tx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleUpdateBudget = (newBudget: BudgetConfig) => {
    setBudget(newBudget);
    saveBudgetConfig(newBudget);
  };

  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    const updated = [...goals, goal];
    setGoals(updated);
    saveSavingsGoals(updated);
  };

  const handleQuickDeposit = (goalId: string, amount: number) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          current_amount: g.current_amount + amount,
        };
      }
      return g;
    });
    setGoals(updated);
    saveSavingsGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter((g) => g.id !== goalId);
    setGoals(updated);
    saveSavingsGoals(updated);
  };

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    if (user) {
      const updatedUser = { ...user, preferredCurrency: newCurrency };
      setUser(updatedUser);
      saveCurrentUser(updatedUser);
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    saveCurrentUser(newUser);
    if (newUser.preferredCurrency) {
      setCurrency(newUser.preferredCurrency);
    }
  };

  const handleLogout = () => {
    setUser(null);
    saveCurrentUser(null);
  };

  const handleResetData = () => {
    resetToSampleData();
    setTransactions(loadTransactions());
    setBudget(loadBudgetConfig());
    setGoals(loadSavingsGoals());
  };

  const handleExportData = () => {
    const exportObject = {
      exportedAt: new Date().toISOString(),
      user,
      currency,
      budget,
      transactions,
      goals,
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finadvisor-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as TabType)}
        currency={currency}
        setCurrency={handleCurrencyChange}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenDocs={() => setShowDocsModal(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            budget={budget}
            goals={goals}
            currency={currency}
            onNavigate={(tab) => setActiveTab(tab as TabType)}
          />
        )}

        {activeTab === 'income' && (
          <IncomeView
            transactions={transactions}
            currency={currency}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {(activeTab === 'expense' || (activeTab as string) === 'expenses') && (
          <ExpenseView
            transactions={transactions}
            currency={currency}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            budget={budget}
            transactions={transactions}
            currency={currency}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsView
            goals={goals}
            currency={currency}
            onAddGoal={handleAddGoal}
            onQuickDeposit={handleQuickDeposit}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {activeTab === 'advisor' && (
          <AdvisorView
            transactions={transactions}
            budget={budget}
            goals={goals}
            currency={currency}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            budget={budget}
            goals={goals}
            currency={currency}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        currentCurrency={currency}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        currency={currency}
        onSelectCurrency={handleCurrencyChange}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onLogout={handleLogout}
      />

      <ProjectDocsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />
    </div>
  );
}
