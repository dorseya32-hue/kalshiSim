import React, { useState } from 'react';
import { Market, Outcome } from '../types/market';
import { useMarket } from '../context/MarketContext';
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  Copy, 
  Check, 
  Send, 
  Info,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface MarketDetailModalProps {
  marketId: string | null;
  onClose: () => void;
  onOpenAdminWithMarket?: (marketId: string) => void;
}

export const MarketDetailModal: React.FC<MarketDetailModalProps> = ({
  marketId,
  onClose,
  onOpenAdminWithMarket
}) => {
  const { markets, currentUser, placeBet, addComment, isAdmin } = useMarket();
  const [selectedSide, setSelectedSide] = useState<Outcome>('YES');
  const [stakeAmount, setStakeAmount] = useState<number | ''>(100);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!marketId || !markets[marketId]) return null;
  const market = markets[marketId];

  // Pools
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

  const handleCopyId = () => {
    navigator.clipboard.writeText(market.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBet = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(stakeAmount);
    if (!amount || amount < 1) return;
    placeBet(market.id, selectedSide, amount);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(market.id, commentText);
    setCommentText('');
  };

  const stakeNum = Number(stakeAmount) || 0;
  const potentialPayout = Math.floor(stakeNum * 1.1);
  const potentialProfit = potentialPayout - stakeNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{market.category}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
              ID: {market.id}
              <button 
                onClick={handleCopyId} 
                className="hover:text-slate-200 transition-colors p-0.5 rounded"
                title="Copy Market ID"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Question & Resolution Description */}
          <div>
            <h2 className="text-xl font-bold text-slate-100 leading-snug">
              {market.question}
            </h2>
            <div className="mt-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-200 block mb-1">Resolution Criteria:</span>
              {market.description}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Closes: {new Date(market.closesAt).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Created: {new Date(market.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                By: {market.createdByName || market.createdBy}
              </span>
            </div>
          </div>

          {/* Probability & Pools Display */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  {yesPercent}%
                </span>
                <span className="text-xs font-semibold text-slate-400 ml-1.5">YES</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 mr-1.5">NO</span>
                <span className="text-3xl font-extrabold text-rose-400 font-mono tabular-nums">
                  {noPercent}%
                </span>
              </div>
            </div>

            {/* Gauge */}
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${yesPercent}%` }}
              />
              <div 
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${noPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center font-mono tabular-nums text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">YES Pool</span>
                <span className="font-semibold text-emerald-400">{yesPool.toLocaleString()} cr</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Total Volume</span>
                <span className="font-semibold text-slate-200">{totalVolume.toLocaleString()} cr</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">NO Pool</span>
                <span className="font-semibold text-rose-400">{noPool.toLocaleString()} cr</span>
              </div>
            </div>
          </div>

          {/* Outcome Status / Won Notice */}
          {isResolved && (
            <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
              market.outcome === 'YES' 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}>
              <div>
                <span className="font-bold block">Market Outcome Resolved: {market.outcome}</span>
                <span className="text-xs opacity-80">
                  Resolved on {new Date(market.resolvedAt || market.closesAt).toLocaleDateString()}. Payouts distributed with 10% bonus.
                </span>
              </div>
              {userPosition && (
                <div className="text-right">
                  {userPosition.side === market.outcome ? (
                    <span className="text-emerald-400 font-bold font-mono">
                      + {Math.floor(userPosition.stake * 1.1)} credits won!
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-mono">
                      Position resolved (0 payout)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bet Slip Section */}
          {isOpen && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Place Your Prediction
              </h3>

              {userPosition && (
                <div className="mb-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
                  You already hold a <strong className={userPosition.side === 'YES' ? 'text-emerald-400' : 'text-rose-400'}>{userPosition.stake} credits</strong> position on <strong className={userPosition.side === 'YES' ? 'text-emerald-400' : 'text-rose-400'}>{userPosition.side}</strong>. Additional bets must be on {userPosition.side}.
                </div>
              )}

              <form onSubmit={handleBet} className="space-y-3">
                {/* Side Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={userPosition?.side === 'NO'}
                    onClick={() => setSelectedSide('YES')}
                    className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedSide === 'YES'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    } ${userPosition?.side === 'NO' ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <span>YES</span>
                    <span className="font-mono text-xs opacity-90">{yesPercent}%</span>
                  </button>

                  <button
                    type="button"
                    disabled={userPosition?.side === 'YES'}
                    onClick={() => setSelectedSide('NO')}
                    className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedSide === 'NO'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    } ${userPosition?.side === 'YES' ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <span>NO</span>
                    <span className="font-mono text-xs opacity-90">{noPercent}%</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[25, 50, 100, 250, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setStakeAmount(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                        stakeAmount === val
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => setStakeAmount(currentUser.balance)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono uppercase font-bold bg-slate-900 hover:bg-slate-800 text-slate-300"
                    >
                      Max ({currentUser.balance})
                    </button>
                  )}
                </div>

                {/* Amount input & Calculator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Stake Amount (Credits)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={stakeAmount}
                      onChange={e => setStakeAmount(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="Whole credit amount"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Potential Payout (10% Bonus):</span>
                      <span className="text-emerald-400 font-bold">{potentialPayout} cr</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Potential Profit:</span>
                      <span className="text-emerald-400">+{potentialProfit} cr</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!currentUser || stakeNum < 1 || (currentUser && stakeNum > currentUser.balance)}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-md"
                >
                  {!currentUser 
                    ? 'Log In to Place Bet' 
                    : currentUser.balance < stakeNum
                    ? 'Insufficient Credits'
                    : `Confirm Bet: ${stakeNum} credits on ${selectedSide}`
                  }
                </button>
              </form>
            </div>
          )}

          {/* Positions Table (List of Traders) */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2.5 flex items-center justify-between">
              <span>Active Traders & Positions</span>
              <span className="text-xs font-mono text-slate-500">{positions.length} entries</span>
            </h3>

            {positions.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
                No bets have been placed on this market yet. Be the first to place a prediction!
              </p>
            ) : (
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2 font-medium">Trader</th>
                      <th className="px-3 py-2 font-medium">Side</th>
                      <th className="px-3 py-2 font-medium text-right">Stake</th>
                      <th className="px-3 py-2 font-medium text-right">Potential Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                    {positions.map(p => (
                      <tr key={p.uid} className={currentUser?.uid === p.uid ? 'bg-emerald-500/5' : ''}>
                        <td className="px-3 py-2 font-sans text-slate-300">
                          {p.username} {currentUser?.uid === p.uid && <span className="text-emerald-400 text-[10px] ml-1">(You)</span>}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`font-bold ${p.side === 'YES' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {p.side}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-slate-200">
                          {p.stake} cr
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-400/90">
                          {Math.floor(p.stake * 1.1)} cr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Market Discussion */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2.5">Discussion & Analysis</h3>
            
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {market.comments && market.comments.length > 0 ? (
                market.comments.map(c => (
                  <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-slate-200">{c.username}</span>
                        {c.side && (
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            c.side === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {c.side} Bettor
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No comments yet. Share your reasoning or insights below.</p>
              )}
            </div>

            {currentUser ? (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add your analysis or prediction..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500">Log in to participate in the discussion.</p>
            )}
          </div>

          {/* Admin shortcut if admin active */}
          {isAdmin && onOpenAdminWithMarket && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-400">Admin Mode Active</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminWithMarket(market.id);
                }}
                className="text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Resolve or Manage this Market in Admin Panel &rarr;
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
