import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Market } from '../types/market';
import { 
  X, 
  Wallet, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMarket: (market: Market) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  onSelectMarket
}) => {
  const { currentUser, markets } = useMarket();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  if (!isOpen || !currentUser) return null;

  // Extract all positions held by current user across all markets
  const userPositions = Object.values(markets).flatMap(m => {
    const pos = m.positions[currentUser.uid];
    if (!pos) return [];
    return [{
      market: m,
      position: pos
    }];
  });

  const openPositions = userPositions.filter(p => p.market.status === 'open');
  const resolvedPositions = userPositions.filter(p => p.market.status === 'resolved');

  const totalOpenStake = openPositions.reduce((sum, p) => sum + p.position.stake, 0);
  const totalPotentialPayout = openPositions.reduce((sum, p) => sum + Math.floor(p.position.stake * 1.1), 0);
  
  const wonPositions = resolvedPositions.filter(p => p.position.side === p.market.outcome);
  const totalCreditsWon = wonPositions.reduce((sum, p) => sum + Math.floor(p.position.stake * 1.1), 0);

  const displayedPositions = userPositions.filter(p => {
    if (filter === 'open') return p.market.status === 'open';
    if (filter === 'resolved') return p.market.status === 'resolved';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Your Positions & Bets Portfolio
              </h2>
              <p className="text-xs text-slate-400">
                Trader: <strong className="text-slate-200">{currentUser.username}</strong> ({currentUser.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[11px] font-sans text-slate-400 block mb-1">Available Balance</span>
              <span className="text-lg font-bold text-emerald-400">
                {currentUser.balance.toLocaleString()}
              </span>
              <span className="text-[10px] font-sans text-slate-500 block mt-0.5">Play credits</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[11px] font-sans text-slate-400 block mb-1">Active At-Risk</span>
              <span className="text-lg font-bold text-slate-200">
                {totalOpenStake.toLocaleString()}
              </span>
              <span className="text-[10px] font-sans text-slate-500 block mt-0.5">{openPositions.length} open bets</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[11px] font-sans text-slate-400 block mb-1">Potential Payout</span>
              <span className="text-lg font-bold text-emerald-400">
                {totalPotentialPayout.toLocaleString()}
              </span>
              <span className="text-[10px] font-sans text-slate-500 block mt-0.5">With 10% bonus</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[11px] font-sans text-slate-400 block mb-1">Total Won Payouts</span>
              <span className="text-lg font-bold text-emerald-400">
                +{totalCreditsWon.toLocaleString()}
              </span>
              <span className="text-[10px] font-sans text-slate-500 block mt-0.5">{wonPositions.length} winning bets</span>
            </div>
          </div>

          {/* Filter Bar (Zero-pill discipline: interactive buttons styled cleanly) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-slate-800 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Bets ({userPositions.length})
              </button>
              <button
                onClick={() => setFilter('open')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filter === 'open'
                    ? 'bg-slate-800 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active Open ({openPositions.length})
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filter === 'resolved'
                    ? 'bg-slate-800 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resolved ({resolvedPositions.length})
              </button>
            </div>

            <span className="text-xs text-slate-500">
              Rule: Winning bets return stake + 10% bonus
            </span>
          </div>

          {/* List of Positions */}
          {displayedPositions.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-slate-800">
              <p className="text-sm text-slate-400">No bets found in this view.</p>
              <p className="text-xs text-slate-500 mt-1">
                Explore the markets on the homepage to place predictions on YES or NO.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedPositions.map(({ market, position }) => {
                const isWon = market.status === 'resolved' && market.outcome === position.side;
                const isLost = market.status === 'resolved' && market.outcome !== null && market.outcome !== position.side;
                const potential = Math.floor(position.stake * 1.1);

                return (
                  <div
                    key={market.id}
                    onClick={() => {
                      onClose();
                      onSelectMarket(market);
                    }}
                    className="p-4 bg-slate-950 hover:bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="text-emerald-400 font-medium">{market.category}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px]">{market.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 hover:text-emerald-300 transition-colors">
                        {market.question}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Placed: {new Date(position.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 font-mono tabular-nums">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-xs font-sans text-slate-400">Position:</span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            position.side === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {position.side}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-200 mt-0.5">
                          {position.stake} credits
                        </div>
                      </div>

                      <div className="text-right border-l border-slate-800 pl-4 min-w-[110px]">
                        {market.status === 'open' ? (
                          <>
                            <span className="text-[11px] font-sans text-slate-500 block">Est. Payout</span>
                            <span className="text-sm font-bold text-emerald-400">
                              {potential} cr
                            </span>
                          </>
                        ) : isWon ? (
                          <>
                            <span className="text-[11px] font-sans text-emerald-400 font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              WON (+10%)
                            </span>
                            <span className="text-sm font-bold text-emerald-400">
                              +{potential} cr
                            </span>
                          </>
                        ) : isLost ? (
                          <>
                            <span className="text-[11px] font-sans text-slate-500 block">LOST</span>
                            <span className="text-sm font-bold text-slate-500">
                              0 cr
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
