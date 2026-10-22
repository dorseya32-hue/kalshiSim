import React, { useState } from 'react';
import { useMarket, ADMIN_CODE } from '../context/MarketContext';
import { MarketCategory } from '../types/market';
import { X, PlusCircle, Lock, ShieldCheck } from 'lucide-react';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (marketId: string) => void;
}

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createMarket, currentUser, isAdmin } = useMarket();

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketCategory>('Tech & AI');
  const [closesAt, setClosesAt] = useState('');
  const [adminCodeInput, setAdminCodeInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createMarket({
      question,
      description,
      category,
      closesAt,
      adminCode: adminCodeInput
    });
    if (res.success && res.marketId) {
      setQuestion('');
      setDescription('');
      setClosesAt('');
      setAdminCodeInput('');
      onSuccess(res.marketId);
      onClose();
    }
  };

  const setDatePreset = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(23, 59, 0, 0);
    const isoString = d.toISOString().slice(0, 16);
    setClosesAt(isoString);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Create Prediction Market</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Admin Passcode Gate (Required: 123457) */}
          {isAdmin ? (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Admin Authority Active
              </span>
              <span className="font-mono text-[10px] text-slate-400">Passcode verified</span>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Admin Passcode * (Required: 123457)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Code: 123457</span>
              </label>
              <input
                type="password"
                value={adminCodeInput}
                onChange={e => setAdminCodeInput(e.target.value)}
                placeholder="Enter admin code (123457)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Prediction Question *
            </label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Will humanoid robots be commercially deployed in > 10,000 warehouses by 2027?"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              required
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Clear, binary (YES/NO) question with an unambiguous outcome.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as MarketCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
                Closes At (Closing Deadline) *
              </label>
              <input
                type="datetime-local"
                value={closesAt}
                onChange={e => setClosesAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
              <div className="flex gap-1.5 mt-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDatePreset(7)}
                  className="text-slate-400 hover:text-emerald-400"
                >
                  +1 Week
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => setDatePreset(30)}
                  className="text-slate-400 hover:text-emerald-400"
                >
                  +1 Month
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => setDatePreset(90)}
                  className="text-slate-400 hover:text-emerald-400"
                >
                  +3 Months
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resolution Criteria & Primary Source *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain how the outcome will be decided. Specify which official government, scientific, or industry sources will be considered authoritative."
              rows={4}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-950/20"
            >
              Verify Code & Publish Market
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
