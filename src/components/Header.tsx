import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Lock, 
  Plus, 
  ChevronDown, 
  User, 
  LogOut, 
  Layers,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onOpenAdminModal: () => void;
  onOpenAuthModal: () => void;
  onOpenPortfolioModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onOpenAdminModal,
  onOpenAuthModal,
  onOpenPortfolioModal,
  activeTab,
  setActiveTab
}) => {
  const { currentUser, users, switchUser, logout, isAdmin } = useMarket();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('markets')} 
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap">
                Play Market
              </span>
              <span className="text-[10px] text-emerald-400 font-medium whitespace-nowrap flex items-center gap-1 font-mono">
                Firebase: playmarketdata-575e2
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('markets')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'markets' ? 'text-white border-b-2 border-emerald-400' : 'hover:text-white'
            }`}
          >
            All Markets
          </button>
          <button
            onClick={onOpenPortfolioModal}
            className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'portfolio' ? 'text-white border-b-2 border-emerald-400' : 'hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Your Bets
          </button>
          <button
            onClick={onOpenAdminModal}
            className="whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 hover:text-white"
          >
            {isAdmin ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin (Active)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400 hover:text-slate-200">
                <Lock className="w-3.5 h-3.5" />
                Admin
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: User Balance & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Credits Pill */}
              <div 
                onClick={onOpenPortfolioModal}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                title="Your Play Credits (Click to view portfolio)"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-mono tabular-nums font-semibold text-emerald-400">
                  {currentUser.balance.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400">credits</span>
              </div>

              {/* User Switcher Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-xs font-medium text-slate-200"
                >
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${currentUser.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-[10px] font-bold text-white`}>
                    {currentUser.username[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {currentUser.username}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
                    <div className="px-2.5 py-2 border-b border-slate-800">
                      <p className="font-semibold text-slate-200 truncate">{currentUser.username}</p>
                      <p className="text-slate-400 text-[11px] font-mono truncate">{currentUser.email}</p>
                      <p className="text-[11px] text-emerald-400 mt-1 font-mono tabular-nums">
                        Balance: {currentUser.balance.toLocaleString()} credits
                      </p>
                    </div>

                    <div className="pt-1.5 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg transition-colors whitespace-nowrap"
            >
              Sign Up / Log In
            </button>
          )}

          {/* Create Market Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Market</span>
          </button>
        </div>

      </div>
    </header>
  );
};
