import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, Leaf, Recycle, Users, UserPlus, Lock, Sparkles, AlertTriangle } from 'lucide-react';
import { CartItem, GroupOrderSession, SupportedCountry, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { calculateOrderTaxes, MEHRWEG_DEPOSIT_EUR } from '../utils/tax';
import { aggregateGroupCart } from '../utils/groupOrder';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  country: SupportedCountry;
  language: SupportedLanguage;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  isMehrwegOptIn: boolean;
  onToggleMehrweg: (val: boolean) => void;
  isCutleryOptIn: boolean;
  onToggleCutlery: (val: boolean) => void;
  deliveryFee: number;
  onProceedToCheckout: () => void;
  activeGroupSession?: GroupOrderSession | null;
  onOpenGroupModal?: () => void;
  onSimulateFriendAdd?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  country,
  language,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isMehrwegOptIn,
  onToggleMehrweg,
  isCutleryOptIn,
  onToggleCutlery,
  deliveryFee,
  onProceedToCheckout,
  activeGroupSession,
  onOpenGroupModal,
  onSimulateFriendAdd,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const subtotal = items.reduce((acc, curr) => acc + curr.itemSubtotal, 0);
  const taxes = calculateOrderTaxes(items, deliveryFee, country, isMehrwegOptIn, isCutleryOptIn);
  const total = subtotal + deliveryFee + (isMehrwegOptIn ? MEHRWEG_DEPOSIT_EUR : 0);

  const groupAggregation = activeGroupSession
    ? aggregateGroupCart(
        items,
        activeGroupSession.members,
        activeGroupSession.spendingLimitPerPerson
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      <div
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900">{t.yourOrder}</h3>
                <p className="text-xs text-stone-500">
                  {items.length > 0 ? items[0].restaurantName : '0 items'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Clear basket"
                  aria-label="Clear basket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-500 hover:bg-stone-200 transition-colors cursor-pointer"
                aria-label="Close basket"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart item list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Group Order Active Header Banner */}
            {activeGroupSession && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/15 border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-extrabold text-xs text-indigo-950">
                      Group Order ({activeGroupSession.code})
                    </span>
                  </div>
                  <button
                    onClick={onOpenGroupModal}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                  >
                    Manage & Invite
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <div className="flex items-center space-x-1">
                    <span className="text-stone-500">Host:</span>
                    <strong className="text-stone-900">{activeGroupSession.host.name}</strong>
                  </div>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {activeGroupSession.members.map((m) => (
                      <img
                        key={m.id}
                        src={m.avatar}
                        alt={m.name}
                        title={m.name}
                        className="inline-block h-5 w-5 rounded-full ring-2 ring-white"
                      />
                    ))}
                  </div>
                </div>

                {activeGroupSession.spendingLimitPerPerson && (
                  <div className="text-[10px] text-amber-800 font-medium">
                    Limit: €{activeGroupSession.spendingLimitPerPerson.toFixed(2)} per person
                  </div>
                )}

                {/* Quick Add Friend Item Simulation button inside drawer */}
                <button
                  type="button"
                  onClick={onSimulateFriendAdd}
                  className="w-full py-1.5 bg-white/80 hover:bg-white text-indigo-950 text-[11px] font-bold rounded-lg border border-indigo-200 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Simulate Friend (Sophie / Max) Adding Dish</span>
                </button>
              </div>
            )}

            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-stone-400" />
                </div>
                <h4 className="font-bold text-stone-800 text-base mb-1">{t.emptyCart}</h4>
                <p className="text-xs text-stone-500 max-w-xs">{t.emptyCartSubtitle}</p>
              </div>
            ) : (
              <>
                {items.map((item) => {
                  const displayName =
                    language === 'de'
                      ? item.menuItem.nameDe
                      : language === 'fr'
                      ? item.menuItem.nameFr
                      : item.menuItem.name;

                  return (
                    <div
                      key={item.cartItemId}
                      className="p-3 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col space-y-2"
                    >
                      {/* Added By Friend Tag if in group order */}
                      {item.addedBy && (
                        <div className="flex items-center space-x-1.5 pb-1 border-b border-stone-200/60">
                          <img
                            src={item.addedBy.avatar}
                            alt={item.addedBy.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-[10px] font-bold text-stone-700">
                            Added for: <strong className="text-indigo-600">{item.addedBy.name}</strong>
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-stone-900">{displayName}</h4>
                          {item.selectedOptions.length > 0 && (
                            <p className="text-xs text-stone-500 mt-0.5">
                              {item.selectedOptions.map((o) => o.optionName).join(', ')}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-[11px] text-amber-700 italic mt-0.5">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <span className="font-mono font-bold text-sm text-stone-900 shrink-0">
                          €{item.itemSubtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => onRemoveItem(item.cartItemId)}
                          className="text-stone-400 hover:text-rose-500 text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>

                        <div className="flex items-center space-x-2 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs font-mono text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Group Order Member Subtotals Breakdown */}
                {groupAggregation && groupAggregation.memberSummaries.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Member Order Breakdown</span>
                      </span>
                      <span className="text-[10px] text-indigo-700 font-mono">
                        {groupAggregation.memberSummaries.length} members
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {groupAggregation.memberSummaries.map((m) => (
                        <div key={m.memberId} className="flex justify-between items-center text-[11px]">
                          <span className="text-stone-700 flex items-center space-x-1.5">
                            <img src={m.avatar} alt={m.memberName} className="w-4 h-4 rounded-full" />
                            <span>{m.memberName} ({m.itemCount} items)</span>
                            {m.exceedsSpendingLimit && (
                              <span className="text-rose-600 font-bold">⚠️ Exceeds limit!</span>
                            )}
                          </span>
                          <span className="font-mono font-bold text-stone-900">
                            €{m.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Localized Compliance: Mehrweg & Cutlery Toggles */}
                <div className="mt-4 pt-4 border-t border-stone-200 space-y-3">
                  {/* Mehrweg reusable container toggle (DE VerpackG §33/34) */}
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMehrwegOptIn}
                        onChange={(e) => onToggleMehrweg(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-xs text-emerald-950 flex items-center space-x-1.5">
                          <Recycle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.mehrwegTitle}</span>
                        </span>
                        <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                          {t.mehrwegDesc}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Cutlery Opt-in checkbox (FR AGEC law compliance) */}
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCutleryOptIn}
                        onChange={(e) => onToggleCutlery(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-xs text-stone-900 flex items-center space-x-1.5">
                          <Leaf className="w-3.5 h-3.5 text-amber-600" />
                          <span>{t.cutleryOptionTitle}</span>
                        </span>
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                          {country === 'FR' ? t.cutleryOptionDescFR : t.cutleryOptionDescDE}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer calculation & checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-mono text-stone-900 font-semibold">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.deliveryFee}</span>
                  <span className="font-mono text-stone-900 font-semibold">€{deliveryFee.toFixed(2)}</span>
                </div>
                {isMehrwegOptIn && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Mehrweg-Pfand (§33 VerpackG)</span>
                    <span className="font-mono font-semibold">+€{MEHRWEG_DEPOSIT_EUR.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <span>{taxes.taxLabel}</span>
                  <span className="font-mono">€{taxes.totalTax.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium">Total (EUR)</span>
                  <div className="text-xl font-bold font-mono text-stone-950">
                    €{total.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-sm rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                  aria-label="Proceed to secure checkout"
                >
                  <span>{t.checkout}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
