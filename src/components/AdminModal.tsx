import React, { useState, useEffect } from 'react';
import { useMarket, ADMIN_CODE } from '../context/MarketContext';
import { MarketCategory, Outcome } from '../types/market';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  Award, 
  PlusCircle, 
  Coins, 
  Trash2, 
  RotateCcw,
  CheckCircle2,
  Users
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMarketId?: string | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  preselectedMarketId
}) => {
  const { 
    isAdmin, 
    unlockAdmin, 
    lockAdmin, 
    markets, 
    setOutcome, 
    deleteMarket, 
    users, 
    adjustUserCredits, 
    createMarket, 
    resetToDefaultData,
    currentUser
  } = useMarket();

  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'resolve' | 'create' | 'credits' | 'manage'>('resolve');

  // Resolve State
  const [resolveMarketId, setResolveMarketId] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome>('YES');

  // Create Market State
  const [newQuestion, setNewQuestion] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<MarketCategory>('Tech & AI');
  const [newClosesAt, setNewClosesAt] = useState('');

  // Credits State
  const [targetUserId, setTargetUserId] = useState('');
  const [creditAmount, setCreditAmount] = useState<number | ''>(500);

  useEffect(() => {
    if (preselectedMarketId) {
      setResolveMarketId(preselectedMarketId);
      setActiveTab('resolve');
    }
  }, [preselectedMarketId]);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    unlockAdmin(passcode);
    setPasscode('');
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveMarketId) return;
    setOutcome(resolveMarketId, selectedOutcome);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createMarket({
      question: newQuestion,
      description: newDescription,
      category: newCategory,
      closesAt: newClosesAt,
      adminCode: ADMIN_CODE
    });
    if (res.success) {
      setNewQuestion('');
      setNewDescription('');
      setNewClosesAt('');
      setActiveTab('manage');
    }
  };

  const handleDelete = (id: string, question: string) => {
    if (window.confirm(`Delete market: "${question.slice(0, 40)}..."?`)) {
      deleteMarket(id);
      if (resolveMarketId === id) setResolveMarketId('');
    }
  };

  const selectedResolveMarket = markets[resolveMarketId];
  const openMarkets = Object.values(markets).filter(m => m.status === 'open');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isAdmin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Admin Console
                {isAdmin && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    AUTHORIZED
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Resolution authority, market governance & user credit balance ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={lockAdmin}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 transition-colors"
              >
                Lock Admin
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!isAdmin ? (
            /* Passcode Gate Screen */
            <div className="max-w-md mx-auto text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-300">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Enter Admin Passcode</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Default developer code is <strong className="text-emerald-400 font-mono">123457</strong>
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3 pt-2">
                <input
                  type="password"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter passcode (123457)"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-mono tracking-widest text-slate-100 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
                >
                  Unlock Admin Controls
                </button>
              </form>
            </div>
          ) : (
            /* Admin Panels */
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('resolve')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'resolve'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Set Outcome</span>
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'create'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Market</span>
                </button>
                <button
                  onClick={() => setActiveTab('credits')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'credits'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>User Credits</span>
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'manage'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Manage & Delete</span>
                </button>
              </div>

              {/* TAB 1: Set Market Outcome */}
              {activeTab === 'resolve' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-200">
                      Select Market to Resolve
                    </h3>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Pick an Open Market</label>
                      <select
                        value={resolveMarketId}
                        onChange={e => setResolveMarketId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Select from open markets ({openMarkets.length}) --</option>
                        {openMarkets.map(m => (
                          <option key={m.id} value={m.id}>
                            [{m.id}] {m.question}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">or enter Market ID manually:</span>
                      <input
                        type="text"
                        value={resolveMarketId}
                        onChange={e => setResolveMarketId(e.target.value.trim())}
                        placeholder="e.g. mkt_swe_bench"
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {selectedResolveMarket ? (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-emerald-400 block mb-1">
                          Market Selected:
                        </span>
                        <h4 className="text-sm font-bold text-slate-100">
                          {selectedResolveMarket.question}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedResolveMarket.description}
                        </p>
                      </div>

                      {/* Beneficiaries Preview */}
                      <div className="pt-3 border-t border-slate-800">
                        <span className="text-xs font-semibold text-slate-300 block mb-2">
                          Resolution Outcome & Payout Calculator (10% Bonus Rule)
                        </span>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            type="button"
                            onClick={() => setSelectedOutcome('YES')}
                            className={`p-3 rounded-xl border text-sm font-bold transition-all text-center ${
                              selectedOutcome === 'YES'
                                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            Resolve to YES
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedOutcome('NO')}
                            className={`p-3 rounded-xl border text-sm font-bold transition-all text-center ${
                              selectedOutcome === 'NO'
                                ? 'bg-rose-600 border-rose-400 text-white shadow'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            Resolve to NO
                          </button>
                        </div>

                        {/* List of winners for this chosen outcome */}
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                          <p className="text-slate-400 text-[11px] mb-2">
                            Simulated Payout for Outcome = <strong>{selectedOutcome}</strong>:
                          </p>
                          {(() => {
                            const winners = Object.values(selectedResolveMarket.positions || {}).filter(
                              p => p.side === selectedOutcome
                            );
                            if (winners.length === 0) {
                              return <p className="text-slate-500 italic">No bettors on {selectedOutcome}. No payout will be distributed.</p>;
                            }
                            const total = winners.reduce((sum, w) => sum + Math.floor(w.stake * 1.1), 0);
                            return (
                              <div className="space-y-1">
                                {winners.map(w => (
                                  <div key={w.uid} className="flex justify-between text-slate-300">
                                    <span>{w.username} ({w.stake} staked)</span>
                                    <span className="text-emerald-400 font-bold">+{Math.floor(w.stake * 1.1)} cr payout</span>
                                  </div>
                                ))}
                                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-200">
                                  <span>Total Distributed Winnings:</span>
                                  <span className="text-emerald-400">{total} credits</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <button
                        onClick={handleResolve}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-md"
                      >
                        Confirm & Distribute Payouts for {selectedOutcome}
                      </button>
                    </div>
                  ) : resolveMarketId ? (
                    <p className="text-xs text-rose-400">Market ID "{resolveMarketId}" not found or already closed.</p>
                  ) : null}
                </div>
              )}

              {/* TAB 2: Create Market */}
              {activeTab === 'create' && (
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Prediction Question
                    </label>
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      placeholder="e.g. Will a commercial nuclear fusion plant supply grid power by 2030?"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value as MarketCategory)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Tech & AI">Tech & AI</option>
                        <option value="Crypto & Finance">Crypto & Finance</option>
                        <option value="Science & Space">Science & Space</option>
                        <option value="World & Politics">World & Politics</option>
                        <option value="Culture & Sports">Culture & Sports</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Closes At (Future Date & Time)
                      </label>
                      <input
                        type="datetime-local"
                        value={newClosesAt}
                        onChange={e => setNewClosesAt(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Resolution Criteria & Verification Source
                    </label>
                    <textarea
                      value={newDescription}
                      onChange={e => setNewDescription(e.target.value)}
                      placeholder="Explain precisely how the outcome will be decided, which authoritative sources will be consulted, and specific edge case rules."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
                  >
                    Publish Market
                  </button>
                </form>
              )}

              {/* TAB 3: User Credits Management */}
              {activeTab === 'credits' && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-200">Adjust Trader Balance</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Select Trader</label>
                        <select
                          value={targetUserId}
                          onChange={e => setTargetUserId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">-- Choose User --</option>
                          {Object.values(users).map(u => (
                            <option key={u.uid} value={u.uid}>
                              {u.username} ({u.balance} cr) - [{u.uid}]
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Whole Credit Amount</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={creditAmount}
                          onChange={e => setCreditAmount(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
                          placeholder="e.g. 500"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono tabular-nums text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500">or manual UID input:</span>
                      <input
                        type="text"
                        value={targetUserId}
                        onChange={e => setTargetUserId(e.target.value.trim())}
                        placeholder="e.g. usr_alice"
                        className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => adjustUserCredits(targetUserId, Number(creditAmount), 'add')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        + Add Credits
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustUserCredits(targetUserId, Number(creditAmount), 'remove')}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        - Remove Credits
                      </button>
                    </div>
                  </div>

                  {/* Registered Users Table */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                      <span>Trader Ledger</span>
                      <span className="font-mono text-slate-500">{Object.keys(users).length} registered users</span>
                    </h4>
                    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/80 text-slate-400 text-[11px] border-b border-slate-800">
                          <tr>
                            <th className="px-3 py-2 font-medium">User UID</th>
                            <th className="px-3 py-2 font-medium">Name & Email</th>
                            <th className="px-3 py-2 font-medium text-right">Balance</th>
                            <th className="px-3 py-2 font-medium text-right">Quick Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {Object.values(users).map(u => (
                            <tr key={u.uid} className="hover:bg-slate-900/40">
                              <td className="px-3 py-2 text-slate-400 text-[11px]">{u.uid}</td>
                              <td className="px-3 py-2 font-sans text-slate-200">
                                <div>{u.username}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                              </td>
                              <td className="px-3 py-2 text-right text-emerald-400 font-bold tabular-nums">
                                {u.balance.toLocaleString()} cr
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTargetUserId(u.uid);
                                    setCreditAmount(250);
                                  }}
                                  className="text-[11px] text-slate-400 hover:text-emerald-400 font-sans"
                                >
                                  Select &rarr;
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Manage & Delete */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Existing Markets ({Object.keys(markets).length})
                  </h3>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {Object.values(markets).map(m => (
                      <div
                        key={m.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                            <span>ID: {m.id}</span>
                            <span>·</span>
                            <span className={m.status === 'open' ? 'text-emerald-400' : 'text-slate-400'}>
                              {m.status.toUpperCase()}
                            </span>
                            {m.outcome && <span className="text-white font-bold">({m.outcome})</span>}
                          </div>
                          <h4 className="font-bold text-slate-200 truncate mt-0.5">
                            {m.question}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {m.status === 'open' && (
                            <button
                              type="button"
                              onClick={() => {
                                setResolveMarketId(m.id);
                                setActiveTab('resolve');
                              }}
                              className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id, m.question)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded-lg transition-colors"
                            title="Delete Market"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reset platform demo data */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">Reset Demo State</span>
                      <span className="text-[11px] text-slate-500">
                        Restore initial default markets, balances, and positions
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Reset all markets, balances, and history back to default demo state?')) {
                          resetToDefaultData();
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Platform Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
