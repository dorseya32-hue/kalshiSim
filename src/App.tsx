import React, { useState, useMemo } from 'react';
import { MarketProvider, useMarket, ADMIN_CODE } from './context/MarketContext';
import { Header } from './components/Header';
import { MarketCard } from './components/MarketCard';
import { MarketDetailModal } from './components/MarketDetailModal';
import { CreateMarketModal } from './components/CreateMarketModal';
import { AdminModal } from './components/AdminModal';
import { AuthModal } from './components/AuthModal';
import { PortfolioModal } from './components/PortfolioModal';
import { ToastContainer } from './components/ToastContainer';
import { Market, MarketCategory } from './types/market';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Activity, 
  Coins, 
  Users, 
  Clock, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUpDown
} from 'lucide-react';

const CATEGORIES: ('All' | MarketCategory)[] = [
  'All',
  'Tech & AI',
  'Science & Space',
  'Crypto & Finance',
  'World & Politics',
  'Culture & Sports'
];

const MainApp: React.FC = () => {
  const { markets, activities, currentUser, isAdmin } = useMarket();

  // Navigation & Modal states
  const [activeNavTab, setActiveNavTab] = useState<'markets' | 'portfolio'>('markets');
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTargetMarketId, setAdminTargetMarketId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | MarketCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved' | 'my_bets'>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'closing' | 'newest' | 'probability'>('volume');

  // Compute Aggregate Stats
  const marketList = Object.values(markets);
  const openCount = marketList.filter(m => m.status === 'open' && new Date(m.closesAt).getTime() > Date.now()).length;
  const resolvedCount = marketList.filter(m => m.status === 'resolved').length;

  const totalPlatformVolume = useMemo(() => {
    return marketList.reduce((sum, m) => {
      const positions = Object.values(m.positions || {});
      return sum + positions.reduce((pSum, p) => pSum + Number(p.stake || 0), 0);
    }, 0);
  }, [marketList]);

  // Filtered & Sorted Markets
  const filteredMarkets = useMemo(() => {
    return marketList.filter(m => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuestion = m.question.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesCat = m.category.toLowerCase().includes(q);
        if (!matchesQuestion && !matchesDesc && !matchesCat) return false;
      }

      // Category
      if (selectedCategory !== 'All' && m.category !== selectedCategory) {
        return false;
      }

      // Status
      const isClosed = new Date(m.closesAt).getTime() <= Date.now() && m.status === 'open';
      if (statusFilter === 'open') {
        return m.status === 'open' && !isClosed;
      }
      if (statusFilter === 'resolved') {
        return m.status === 'resolved';
      }
      if (statusFilter === 'my_bets') {
        if (!currentUser) return false;
        return !!m.positions[currentUser.uid];
      }

      return true;
    }).sort((a, b) => {
      // Sort logic
      const aPositions = Object.values(a.positions || {});
      const bPositions = Object.values(b.positions || {});
      const aVol = aPositions.reduce((s, p) => s + p.stake, 0);
      const bVol = bPositions.reduce((s, p) => s + p.stake, 0);

      if (sortBy === 'volume') {
        return bVol - aVol;
      }
      if (sortBy === 'closing') {
        return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'probability') {
        const aYes = aPositions.filter(p => p.side === 'YES').reduce((s, p) => s + p.stake, 0);
        const bYes = bPositions.filter(p => p.side === 'YES').reduce((s, p) => s + p.stake, 0);
        const aProb = aVol > 0 ? (aYes / aVol) : 0.5;
        const bProb = bVol > 0 ? (bYes / bVol) : 0.5;
        return bProb - aProb;
      }
      return 0;
    });
  }, [marketList, searchQuery, selectedCategory, statusFilter, sortBy, currentUser]);

  const handleOpenMarket = (market: Market) => {
    setSelectedMarketId(market.id);
  };

  const handleOpenAdminWithMarket = (marketId: string) => {
    setAdminTargetMarketId(marketId);
    setIsAdminOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Primary Top Bar */}
      <Header
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenAdminModal={() => {
          setAdminTargetMarketId(null);
          setIsAdminOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenPortfolioModal={() => setIsPortfolioOpen(true)}
        activeTab={activeNavTab}
        setActiveTab={(t) => {
          setActiveNavTab(t as 'markets' | 'portfolio');
          if (t === 'portfolio') setIsPortfolioOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section & Domain Mechanism Storytelling */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-6 sm:p-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DECISION ENGINE & COLLECTIVE INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight text-balance">
              Predict real-world outcomes. Back your conviction with play credits.
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Play Market lets you trade binary YES/NO contracts on technology, AI breakthroughs, space, finance, and global events. Prices reflect real-time collective probability. Winning positions receive stake + 10% bonus payouts.
            </p>
          </div>

          {/* Key Metrics Strip (Tabular Figures) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 font-mono tabular-nums">
            <div>
              <span className="text-[11px] font-sans text-slate-400 block mb-0.5">Total Volume Traded</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                {totalPlatformVolume.toLocaleString()}
              </span>
              <span className="text-[10px] font-sans text-slate-500 block mt-0.5">credits</span>
            </div>

            <div>
              <span className="text-[11px] font-sans text-slate-400 block mb-0.5">Active Prediction Markets</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-100">
                {openCount}
              </span>
              <span className="text-[10px] font-sans text-slate-500 block mt-0.5">open for betting</span>
            </div>

            <div>
              <span className="text-[11px] font-sans text-slate-400 block mb-0.5">Resolved Outcomes</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-100">
                {resolvedCount}
              </span>
              <span className="text-[10px] font-sans text-slate-500 block mt-0.5">payouts distributed</span>
            </div>

            <div>
              <span className="text-[11px] font-sans text-slate-400 block mb-0.5">Your Account Balance</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                {currentUser ? currentUser.balance.toLocaleString() : '---'}
              </span>
              <span className="text-[10px] font-sans text-slate-500 block mt-0.5">
                {currentUser ? currentUser.username : 'Sign in to trade'}
              </span>
            </div>
          </div>
        </section>

        {/* Filter Strip & Search Bar (Zero-pill discipline: interactive segmented buttons) */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search prediction questions, topics, criteria..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Segmented Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-medium self-start md:self-auto overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({marketList.length})
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'open'
                    ? 'bg-slate-800 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Open ({openCount})
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'resolved'
                    ? 'bg-slate-800 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
              {currentUser && (
                <button
                  onClick={() => setStatusFilter('my_bets')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === 'my_bets'
                      ? 'bg-slate-800 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  My Bets
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium whitespace-nowrap hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-medium"
              >
                <option value="volume">Highest Pool Volume</option>
                <option value="closing">Closing Soonest</option>
                <option value="newest">Recently Added</option>
                <option value="probability">Highest YES Probability</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-900 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Markets Grid */}
        <section>
          {filteredMarkets.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
              <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No prediction markets match your criteria</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try modifying your search keywords or switching filters, or create a brand new prediction question!
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  Create Market
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMarkets.map(market => (
                <MarketCard
                  key={market.id}
                  market={market}
                  onOpenDetail={handleOpenMarket}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Market Activity & Transparency Log */}
        <section className="p-6 bg-slate-900/70 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">Live Trade Stream & Market Activity</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Real-time ledger updates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activities.slice(0, 6).map(act => (
              <div
                key={act.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-200">{act.title}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">Play Market</span>
            <span>·</span>
            <span>Educational play-money prediction simulation. Credits hold no monetary cash value.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setAdminTargetMarketId(null);
                setIsAdminOpen(true);
              }}
              className="hover:text-slate-300 transition-colors flex items-center gap-1 font-mono"
            >
              <Lock className="w-3 h-3" />
              Admin Portal ({ADMIN_CODE})
            </button>
            <span>·</span>
            <button
              onClick={() => setIsPortfolioOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Portfolio
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MarketDetailModal
        marketId={selectedMarketId}
        onClose={() => setSelectedMarketId(null)}
        onOpenAdminWithMarket={handleOpenAdminWithMarket}
      />

      <CreateMarketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(id) => setSelectedMarketId(id)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        preselectedMarketId={adminTargetMarketId}
      />

      <PortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        onSelectMarket={(m) => setSelectedMarketId(m.id)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainApp />
    </MarketProvider>
  );
}
