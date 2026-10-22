import React, { useState } from 'react';
import { Market, Outcome } from '../types/market';
import { useMarket, calculateEstimatedPayout } from '../context/MarketContext';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onOpenDetail: (market: Market) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onOpenDetail }) => {
  const { currentUser, placeBet } = useMarket();
  const [stakeInput, setStakeInput] = useState<number | ''>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute Pools & Probabilities
  const positions = Object.values(market.positions || {});
  const yesPool = positions
    .filter(p => p.side === 'YES')
    .reduce((sum, p) => sum + Number(p.stake || 0), 0);
  const noPool = positions
    .filter(p => p.side === 'NO')
    .reduce((sum, p) => sum + Number(p.stake || 0), 0);
  const totalVolume = yesPool + noPool;

  const yesPercent = totalVolume > 0 ? Math.round((yesPool * 100) / totalVolume) : 50;
  const noPercent = totalVolume > 0 ? 100 - yesPercent : 50;

  const isClosedByDate = new Date(market.closesAt).getTime() <= Date.now();
  const isOpen = market.status === 'open' && !isClosedByDate;
  const isResolved = market.status === 'resolved';

  const userPosition = currentUser ? market.positions[currentUser.uid] : null;

  const handleQuickBet = (e: React.MouseEvent, side: Outcome) => {
    e.stopPropagation();
    const amount = Number(stakeInput);
    if (!amount || amount < 1) return;
    setIsSubmitting(true);
    placeBet(market.id, side, amount);
    setIsSubmitting(false);
  };

  const setPresetStake = (e: React.MouseEvent, val: number) => {
    e.stopPropagation();
    setStakeInput(val);
  };

  const setMaxStake = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) {
      setStakeInput(currentUser.balance > 0 ? currentUser.balance : 50);
    }
  };

  // Format close date nicely
  const closeDate = new Date(market.closesAt);
  const isCloseImminent = (closeDate.getTime() - Date.now()) < (3 * 24 * 60 * 60 * 1000) && isOpen;

  return (
    <article 
      onClick={() => onOpenDetail(market)}
      className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-slate-950/40"
    >
      <div>
        {/* Unboxed Metadata (Zero-pill rule: clean text with typographic separators) */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-400 font-semibold">{market.category}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {isClosedByDate && market.status === 'open' ? (
                <span className="text-amber-400">Closed (Pending Resolution)</span>
              ) : isResolved ? (
                <span className="text-slate-400">Resolved</span>
              ) : (
                <span className={isCloseImminent ? 'text-amber-400 font-medium' : ''}>
                  Closes {closeDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono tabular-nums">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-500" />
              {positions.length}
            </span>
            {market.comments && market.comments.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-slate-500" />
                {market.comments.length}
              </span>
            )}
          </div>
        </div>

        {/* Question Title */}
        <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
          {market.question}
        </h3>

        {/* Short resolution description snippet */}
        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {market.description}
        </p>
      </div>

      {/* Middle: Odds & Visual Probability Gauge */}
      <div className="my-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {yesPercent}%
            </span>
            <span className="text-xs font-semibold text-slate-400">YES</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold text-slate-400">NO</span>
            <span className="text-lg font-bold text-rose-400 font-mono tabular-nums">
              {noPercent}%
            </span>
          </div>
        </div>

        {/* Dual Progress Bar */}
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${yesPercent}%` }}
          />
          <div 
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${noPercent}%` }}
          />
        </div>

        {/* Volume & Pool Figures */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums mt-2">
          <span>Vol: {totalVolume.toLocaleString()} credits</span>
          <span>YES {yesPool} · NO {noPool}</span>
        </div>
      </div>

      {/* User's existing stake notification */}
      {userPosition && (
        <div className="mb-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Your bet:</span>
            <span className={`font-mono font-bold ${userPosition.side === 'YES' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {userPosition.stake} cr on {userPosition.side}
            </span>
          </div>
          {isResolved && market.outcome && (
            <span className={`font-semibold ${userPosition.side === market.outcome ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-400'}`}>
              {userPosition.side === market.outcome ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Winner! Payout credited
                </>
              ) : (
                'Resolved'
              )}
            </span>
          )}
        </div>
      )}

      {/* Bottom Area: Controls or Outcome State */}
      <div className="pt-2 border-t border-slate-800/70" onClick={e => e.stopPropagation()}>
        {isResolved ? (
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-slate-400">Outcome Resolved:</span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
              market.outcome === 'YES' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              RESULT: {market.outcome}
            </span>
          </div>
        ) : isOpen ? (
          <div className="flex flex-col gap-2">
            {/* Quick Stake Preset Controls */}
            <div className="flex items-center justify-between gap-1 text-[11px]">
              <span className="text-slate-500 font-medium">Stake:</span>
              <div className="flex items-center gap-1">
                {[25, 50, 100, 250].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={e => setPresetStake(e, val)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      stakeInput === val
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={setMaxStake}
                  className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Custom Input + Action Buttons */}
            <div className="grid grid-cols-12 gap-1.5 items-center">
              <input
                type="number"
                min="1"
                step="1"
                value={stakeInput}
                onChange={e => setStakeInput(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
                placeholder="Stake"
                className="col-span-4 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono tabular-nums text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={e => handleQuickBet(e, 'YES')}
                className="col-span-4 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors text-center whitespace-nowrap shadow-sm"
              >
                Bet YES
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={e => handleQuickBet(e, 'NO')}
                className="col-span-4 py-1.5 px-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors text-center whitespace-nowrap shadow-sm"
              >
                Bet NO
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>2% fee spread applied</span>
              <span>50/50 odds pays 49 on 50</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between py-1 text-xs text-amber-400/90">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Betting closed
            </span>
            <span className="text-slate-400 text-[11px]">Awaiting admin resolution</span>
          </div>
        )}
      </div>
    </article>
  );
};
