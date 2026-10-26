import React, { useState } from 'react';
import {
  X,
  Users,
  Link,
  Copy,
  Check,
  QrCode,
  Clock,
  ShieldCheck,
  UserPlus,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  Share2,
} from 'lucide-react';
import {
  GroupMember,
  GroupOrderSession,
  Restaurant,
  SupportedLanguage,
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { generateGroupCode, aggregateGroupCart } from '../utils/groupOrder';
import { sounds } from '../utils/sound';

interface GroupOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  activeSession: GroupOrderSession | null;
  onStartSession: (
    restaurant: Restaurant,
    spendingLimit: number | undefined,
    cutoffMinutes: number,
    splitMode: GroupOrderSession['splitMode']
  ) => void;
  onLockSession: () => void;
  onEndSession: () => void;
  onSimulateFriendJoin: () => void;
  language: SupportedLanguage;
}

export const GroupOrderModal: React.FC<GroupOrderModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  currentRestaurant,
  activeSession,
  onStartSession,
  onLockSession,
  onEndSession,
  onSimulateFriendJoin,
  language,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const [selectedRestId, setSelectedRestId] = useState(
    currentRestaurant?.id || restaurants[0]?.id || ''
  );
  const [spendingLimitChoice, setSpendingLimitChoice] = useState<'none' | '15' | '20' | '25'>('20');
  const [cutoffMinutes, setCutoffMinutes] = useState<number>(20);
  const [splitMode, setSplitMode] = useState<GroupOrderSession['splitMode']>('host_pays');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const selectedRest =
    restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  const handleCopyLink = () => {
    if (activeSession) {
      navigator.clipboard.writeText(activeSession.joinUrl).catch(() => {});
      setCopiedLink(true);
      sounds.playPushPing();
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = spendingLimitChoice === 'none' ? undefined : Number(spendingLimitChoice);
    onStartSession(selectedRest, limit, cutoffMinutes, splitMode);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-base">Group Order Session</h3>
                {activeSession && (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                    {activeSession.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80">
                {activeSession
                  ? `Active shared basket with ${activeSession.members.length} members`
                  : 'Invite friends, coworker or family to order together'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Close group order modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-stone-700">
          {activeSession ? (
            /* Active Group Session View */
            <div className="space-y-5">
              {/* Join Link & Share Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 flex items-center space-x-1.5">
                    <Link className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Shareable Join Link</span>
                  </span>
                  <button
                    onClick={() => setShowQr(!showQr)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={activeSession.joinUrl}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-white font-mono text-[11px] text-stone-600 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                    aria-label="Copy group join link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {showQr && (
                  <div className="p-4 bg-white rounded-xl border border-stone-200 text-center space-y-2 animate-fade-in">
                    <div className="w-36 h-36 mx-auto bg-stone-900 rounded-xl p-2 flex items-center justify-center text-white">
                      {/* Stylized QR representation */}
                      <div className="w-full h-full bg-white p-2 rounded grid grid-cols-6 grid-rows-6 gap-1">
                        <div className="bg-stone-900 col-span-2 row-span-2 rounded-xs" />
                        <div className="bg-stone-900 col-start-5 col-span-2 row-span-2 rounded-xs" />
                        <div className="bg-stone-900 row-start-5 col-span-2 row-span-2 rounded-xs" />
                        <div className="bg-stone-900 col-start-3 row-start-3 col-span-2 row-span-2 rounded-full" />
                        <div className="bg-stone-900 col-start-3 row-start-1" />
                        <div className="bg-stone-900 col-start-4 row-start-5" />
                        <div className="bg-stone-900 col-start-6 row-start-4" />
                      </div>
                    </div>
                    <p className="text-[10px] text-stone-500 font-mono">Scan with phone camera to join</p>
                  </div>
                )}
              </div>

              {/* Members List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>Participants ({activeSession.members.length})</span>
                  </h4>
                  <span className="text-stone-500 font-mono text-[11px]">
                    Restaurant: <strong>{activeSession.restaurantName}</strong>
                  </span>
                </div>

                <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white overflow-hidden">
                  {activeSession.members.map((m) => (
                    <div key={m.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-8 h-8 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <span className="font-bold text-stone-900 block">
                            {m.name} {m.isHost && '(Host)'}
                          </span>
                          <span className="text-[10px] text-stone-400">Joined at {m.joinedAt}</span>
                        </div>
                      </div>

                      {m.isHost && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Controls & Friend Simulation Action */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Demo & Testing Accelerator</span>
                  </span>
                </div>
                <p className="text-amber-900 text-[11px]">
                  Want to see the group order in action right now? Click below to simulate friends joining and choosing dishes:
                </p>
                <button
                  onClick={onSimulateFriendJoin}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Simulate Friend (Sophie / Max) Adding Dishes</span>
                </button>
              </div>

              {/* Lock & End Session Actions */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-200">
                <button
                  onClick={onLockSession}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                    activeSession.status === 'locked'
                      ? 'bg-stone-200 text-stone-700'
                      : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                  }`}
                >
                  {activeSession.status === 'locked' ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock Cart</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Cart (Cutoff)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onEndSession}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-rose-200"
                >
                  End Session
                </button>
              </div>
            </div>
          ) : (
            /* Start New Group Session Form */
            <form onSubmit={handleCreate} className="space-y-5">
              {/* 1. Restaurant */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Select Restaurant for Group Order
                </label>
                <select
                  value={selectedRestId}
                  onChange={(e) => setSelectedRestId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white font-medium text-xs focus:ring-2 focus:ring-amber-500"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.city} &bull; {r.cuisine})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Spending Limit */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Spending Limit per Friend
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', '15', '20', '25'] as const).map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setSpendingLimitChoice(choice)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        spendingLimitChoice === choice
                          ? 'bg-amber-500 text-stone-950 shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {choice === 'none' ? 'No Limit' : `€${choice}.00`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Deadline Timer */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
                  <span>Order Cutoff Window</span>
                  <span className="font-mono text-stone-500 font-bold">{cutoffMinutes} minutes</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={cutoffMinutes}
                  onChange={(e) => setCutoffMinutes(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                  <span>10 mins (Fast)</span>
                  <span>30 mins</span>
                  <span>60 mins (Relaxed)</span>
                </div>
              </div>

              {/* 4. Bill Splitting Option */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Payment & Split Preference
                </label>
                <div className="space-y-2">
                  <label className="p-3 rounded-xl border border-stone-200 flex items-center space-x-3 cursor-pointer hover:bg-stone-50">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'host_pays'}
                      onChange={() => setSplitMode('host_pays')}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">Host Covers Bill (Treat / Company)</span>
                      <p className="text-[11px] text-stone-500">Host pays 100% of the basket at checkout</p>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl border border-stone-200 flex items-center space-x-3 cursor-pointer hover:bg-stone-50">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'pay_own'}
                      onChange={() => setSplitMode('pay_own')}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">Everyone Pays For Their Own Dishes</span>
                      <p className="text-[11px] text-stone-500">Delivery fee and taxes are split proportionally</p>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl border border-stone-200 flex items-center space-x-3 cursor-pointer hover:bg-stone-50">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'split_evenly'}
                      onChange={() => setSplitMode('split_evenly')}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">Split Evenly Among All Friends</span>
                      <p className="text-[11px] text-stone-500">Total bill divided equally by the number of participants</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Create */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Create Group Order & Generate Link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
