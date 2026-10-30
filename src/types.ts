/**
 * Core type definitions for Personal Finance Advisor Bot
 */

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'KRW';

export type TabType = 'dashboard' | 'income' | 'expense' | 'budget' | 'savings' | 'advisor' | 'reports';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Gifts'
  | 'Rental'
  | 'Side Business'
  | 'Refunds'
  | 'Other';

export type ExpenseCategory =
  | 'Housing'
  | 'Food & Dining'
  | 'Transportation'
  | 'Utilities'
  | 'Healthcare'
  | 'Entertainment'
  | 'Shopping'
  | 'Education'
  | 'Personal Care'
  | 'Miscellaneous';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface BudgetConfig {
  monthlyOverallCap: number;
  categoryLimits: Record<string, number>;
}

export interface SavingsGoal {
  id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // YYYY-MM-DD
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferredCurrency: CurrencyCode;
}

export interface ActionStep {
  step: number;
  title: string;
  description: string;
  impact: string;
}

export interface OverspendingAlert {
  category: string;
  spent: number;
  limit: number;
  excess: number;
  severity: 'Moderate' | 'High' | 'Critical';
}

export interface BudgetAdjustment {
  category: string;
  currentLimit: number;
  suggestedLimit: number;
  reason: string;
}

export interface EmergencyFundRoadmap {
  currentEmergencySavings: number;
  recommendedEmergencyFund: number;
  monthsCovered: number;
  monthlySavingsTarget: number;
  targetMonthsToFull: number;
  recommendation: string;
}

export interface FinancialAuditResult {
  healthScore: number;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  overspendingAlerts: OverspendingAlert[];
  recommendedBudgetAdjustments: BudgetAdjustment[];
  emergencyFundRoadmap: EmergencyFundRoadmap;
  actionPlan: ActionStep[];
  keyMetrics: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    savingsRatePercent: number;
    topExpenseCategory: string;
    topExpensePercentOfIncome: number;
  };
  generatedAt: string;
  source: 'gemini' | 'heuristic';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestions?: string[];
}
