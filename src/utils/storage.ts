import {
  Transaction,
  BudgetConfig,
  SavingsGoal,
  User,
  CurrencyCode,
  ExpenseCategory,
  IncomeCategory,
} from "../types";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Personal Care',
  'Miscellaneous',
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Investments',
  'Gifts',
  'Rental',
  'Side Business',
  'Refunds',
  'Other',
];

const STORAGE_KEYS = {
  USER: 'pfab_user',
  TRANSACTIONS: 'pfab_transactions',
  BUDGET: 'pfab_budget',
  GOALS: 'pfab_goals',
};

// Realistic Seed Data Generator tailored to current month
export function getInitialSeedData(currency: CurrencyCode = 'USD'): {
  transactions: Transaction[];
  budget: BudgetConfig;
  goals: SavingsGoal[];
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Scale factors for currencies like INR, JPY, KRW
  let mult = 1;
  if (currency === 'INR') mult = 80;
  else if (currency === 'JPY') mult = 150;
  else if (currency === 'KRW') mult = 1350;

  const transactions: Transaction[] = [
    // Income
    {
      id: 'tx-inc-1',
      type: 'income',
      amount: 4800 * mult,
      category: 'Salary',
      description: 'Monthly Corporate Tech Salary',
      date: `${year}-${month}-01`,
      createdAt: Date.now() - 20 * 86400000,
    },
    {
      id: 'tx-inc-2',
      type: 'income',
      amount: 650 * mult,
      category: 'Freelance',
      description: 'UI/UX Design Consulting Milestone',
      date: `${year}-${month}-12`,
      createdAt: Date.now() - 9 * 86400000,
    },
    {
      id: 'tx-inc-3',
      type: 'income',
      amount: 180 * mult,
      category: 'Investments',
      description: 'Quarterly Index Dividend Yield',
      date: `${year}-${month}-15`,
      createdAt: Date.now() - 6 * 86400000,
    },

    // Expenses
    {
      id: 'tx-exp-1',
      type: 'expense',
      amount: 1400 * mult,
      category: 'Housing',
      description: 'Apartment Lease & Building Maintenance',
      date: `${year}-${month}-02`,
      createdAt: Date.now() - 19 * 86400000,
    },
    {
      id: 'tx-exp-2',
      type: 'expense',
      amount: 480 * mult,
      category: 'Food & Dining',
      description: 'Whole Foods Market Bi-weekly Grocery',
      date: `${year}-${month}-04`,
      createdAt: Date.now() - 17 * 86400000,
    },
    {
      id: 'tx-exp-3',
      type: 'expense',
      amount: 135 * mult,
      category: 'Food & Dining',
      description: 'Italian Bistro Dinner with Friends',
      date: `${year}-${month}-08`,
      createdAt: Date.now() - 13 * 86400000,
    },
    {
      id: 'tx-exp-4',
      type: 'expense',
      amount: 220 * mult,
      category: 'Transportation',
      description: 'Metro Transit Card & Regional Rail Passes',
      date: `${year}-${month}-05`,
      createdAt: Date.now() - 16 * 86400000,
    },
    {
      id: 'tx-exp-5',
      type: 'expense',
      amount: 195 * mult,
      category: 'Utilities',
      description: 'Electricity, Water & Fiber Broadband',
      date: `${year}-${month}-09`,
      createdAt: Date.now() - 12 * 86400000,
    },
    {
      id: 'tx-exp-6',
      type: 'expense',
      amount: 160 * mult,
      category: 'Entertainment',
      description: 'Streaming Subscriptions & Concert Ticket',
      date: `${year}-${month}-11`,
      createdAt: Date.now() - 10 * 86400000,
    },
    {
      id: 'tx-exp-7',
      type: 'expense',
      amount: 210 * mult,
      category: 'Shopping',
      description: 'Ergonomic Desk Accessories & Books',
      date: `${year}-${month}-14`,
      createdAt: Date.now() - 7 * 86400000,
    },
    {
      id: 'tx-exp-8',
      type: 'expense',
      amount: 90 * mult,
      category: 'Personal Care',
      description: 'Gym Membership & Grooming Kit',
      date: `${year}-${month}-16`,
      createdAt: Date.now() - 5 * 86400000,
    },
    {
      id: 'tx-exp-9',
      type: 'expense',
      amount: 120 * mult,
      category: 'Healthcare',
      description: 'Prescription Vitamins & Dental Copay',
      date: `${year}-${month}-18`,
      createdAt: Date.now() - 3 * 86400000,
    },
  ];

  const budget: BudgetConfig = {
    monthlyOverallCap: 3400 * mult,
    categoryLimits: {
      Housing: 1500 * mult,
      'Food & Dining': 650 * mult,
      Transportation: 280 * mult,
      Utilities: 220 * mult,
      Healthcare: 200 * mult,
      Entertainment: 180 * mult,
      Shopping: 250 * mult,
      Education: 150 * mult,
      'Personal Care': 120 * mult,
      Miscellaneous: 100 * mult,
    },
  };

  const goals: SavingsGoal[] = [
    {
      id: 'goal-1',
      goal_name: 'Emergency Reserve (6 Months)',
      target_amount: 18000 * mult,
      current_amount: 11400 * mult,
      deadline: `${year + 1}-06-30`,
      createdAt: Date.now() - 90 * 86400000,
    },
    {
      id: 'goal-2',
      goal_name: 'House Down Payment Fund',
      target_amount: 45000 * mult,
      current_amount: 16200 * mult,
      deadline: `${year + 2}-12-31`,
      createdAt: Date.now() - 120 * 86400000,
    },
    {
      id: 'goal-3',
      goal_name: 'Kyoto Cultural Travel Milestone',
      target_amount: 3200 * mult,
      current_amount: 2150 * mult,
      deadline: `${year}-11-15`,
      createdAt: Date.now() - 45 * 86400000,
    },
  ];

  return { transactions, budget, goals };
}

// Storage helpers
export function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export function loadStoredTransactions(currency: CurrencyCode = 'USD'): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Storage load error:', e);
  }
  const seed = getInitialSeedData(currency);
  saveStoredTransactions(seed.transactions);
  return seed.transactions;
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export function loadStoredBudget(currency: CurrencyCode = 'USD'): BudgetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.monthlyOverallCap === 'number') return parsed;
    }
  } catch (e) {
    console.error('Storage load error:', e);
  }
  const seed = getInitialSeedData(currency);
  saveStoredBudget(seed.budget);
  return seed.budget;
}

export function saveStoredBudget(budget: BudgetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export function loadStoredGoals(currency: CurrencyCode = 'USD'): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Storage load error:', e);
  }
  const seed = getInitialSeedData(currency);
  saveStoredGoals(seed.goals);
  return seed.goals;
}

export function saveStoredGoals(goals: SavingsGoal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export function createDemoUser(): User {
  return {
    id: 'demo-user-101',
    name: 'Alex Mercer',
    email: 'alex.mercer@finadvisor.io',
    preferredCurrency: 'USD',
  };
}

export function resetToSampleData(currency: CurrencyCode = 'USD') {
  const seed = getInitialSeedData(currency);
  saveStoredTransactions(seed.transactions);
  saveStoredBudget(seed.budget);
  saveStoredGoals(seed.goals);
  return seed;
}

// Convenient function aliases
export const loadTransactions = loadStoredTransactions;
export const saveTransactions = saveStoredTransactions;
export const loadBudgetConfig = loadStoredBudget;
export const saveBudgetConfig = saveStoredBudget;
export const loadSavingsGoals = loadStoredGoals;
export const saveSavingsGoals = saveStoredGoals;
export const loadCurrentUser = loadStoredUser;
export const saveCurrentUser = saveStoredUser;

