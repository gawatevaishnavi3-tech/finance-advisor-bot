import React, { useState } from 'react';
import {
  Wallet,
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  PieChart,
  PiggyBank,
  Bot,
  FileSpreadsheet,
  GraduationCap,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { CurrencyCode, User } from '../types';
import { SUPPORTED_CURRENCIES } from '../utils/currency';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenDocs,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expense', label: 'Expenses', icon: CreditCard },
    { id: 'budget', label: 'Budgeting', icon: PieChart },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'advisor', label: 'AI Advisor', icon: Bot, badge: 'Gemini' },
    { id: 'reports', label: 'Statements', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden"
              id="brand-logo-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  FinAdvisor <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">AI</span>
                </span>
                <p className="text-[11px] text-slate-500 font-medium">Personal Finance Engine</p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <button
                id="currency-selector-btn"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                title="Change display currency"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{currency} ({SUPPORTED_CURRENCIES[currency].symbol})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {currencyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setCurrencyDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select Currency
                    </div>
                    {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                      <button
                        key={c.code}
                        id={`currency-opt-${c.code}`}
                        onClick={() => {
                          setCurrency(c.code);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          currency === c.code ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="font-mono text-slate-500">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Academic Viva Suite Button */}
            <button
              id="open-viva-docs-btn"
              onClick={onOpenDocs}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 transition-colors"
              title="Academic Architecture, Viva Q&A & Python Backend"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Viva & Docs</span>
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <button
                id="user-profile-btn"
                onClick={onOpenProfile}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-slate-700 max-w-[90px] truncate hidden md:inline">
                  {user.name}
                </span>
              </button>
            ) : (
              <button
                id="header-login-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2">
              <button
                onClick={() => {
                  onOpenDocs();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 py-1"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Academic Viva Suite & Architecture</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
