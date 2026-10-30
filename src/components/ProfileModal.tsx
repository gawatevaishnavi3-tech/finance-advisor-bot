import React from 'react';
import {
  User as UserIcon,
  Globe,
  RotateCcw,
  Download,
  LogOut,
  X,
  Shield,
  Coins,
} from 'lucide-react';
import { User, CurrencyCode } from '../types';
import { SUPPORTED_CURRENCIES } from '../utils/currency';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  onResetData: () => void;
  onExportData: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  currency,
  onSelectCurrency,
  onResetData,
  onExportData,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {user ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {user ? user.name : 'Guest User'}
              </h2>
              <p className="text-xs text-slate-500">
                {user ? user.email : 'Local Session Mode'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Switcher Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Multi-Currency Preference</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(SUPPORTED_CURRENCIES).map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  id={`profile-currency-${c.code}`}
                  onClick={() => onSelectCurrency(c.code)}
                  className={`p-2 rounded-lg border text-left text-xs transition-colors flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-mono text-sm">{c.symbol}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ledger Management Controls */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="block text-xs font-bold text-slate-900">Data Management</span>
          <div className="flex flex-col gap-2 text-xs">
            <button
              onClick={() => {
                if (window.confirm('Reset all ledger transactions, budgets, and goals to sample dataset?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Reset to Sample Ledger Data</span>
              </span>
              <span className="text-[11px] text-slate-400">Restore</span>
            </button>

            <button
              onClick={onExportData}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-600" />
                <span>Export Ledger (JSON Backup)</span>
              </span>
              <span className="text-[11px] text-slate-400">Download</span>
            </button>
          </div>
        </div>

        {/* Sign Out */}
        {user && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Session</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
