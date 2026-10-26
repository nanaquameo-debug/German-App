import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle,
  Truck,
  Tag,
  AlertCircle,
  Smartphone,
  Info,
  ChevronRight,
} from 'lucide-react';
import { CartItem, GroupOrderSession, Order, PaymentDetails, SupportedCountry, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { calculateOrderTaxes, calculatePromoDiscount, MEHRWEG_DEPOSIT_EUR } from '../utils/tax';
import { validateLuhn, formatCardNumber } from '../utils/delivery';
import { aggregateGroupCart, calculateBillSplit } from '../utils/groupOrder';
import { sounds } from '../utils/sound';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  country: SupportedCountry;
  language: SupportedLanguage;
  deliveryFee: number;
  isMehrwegOptIn: boolean;
  isCutleryOptIn: boolean;
  onOrderCompleted: (newOrder: Order) => void;
  activeGroupSession?: GroupOrderSession | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  country,
  language,
  deliveryFee,
  isMehrwegOptIn,
  isCutleryOptIn,
  onOrderCompleted,
  activeGroupSession,
}) => {
  if (!isOpen || items.length === 0) return null;

  const t = TRANSLATIONS[language];
  const restaurantName = items[0].restaurantName;
  const restaurantId = items[0].restaurantId;

  // Address State (pre-filled with realistic European addresses)
  const [street, setStreet] = useState(
    country === 'DE' ? 'Kollwitzstraße 45' : '42 Rue Saint-André des Arts'
  );
  const [city, setCity] = useState(country === 'DE' ? 'Berlin' : 'Paris');
  const [postalCode, setPostalCode] = useState(country === 'DE' ? '10405' : '75006');
  const [doorCode, setDoorCode] = useState(
    country === 'DE' ? 'Klingel Weber, 3. OG' : 'Code porte 402B'
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [activePromo, setActivePromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Tip presets (€0, €1.50, €3.00, €5.00)
  const [tipAmount, setTipAmount] = useState(2.0);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentDetails['method']>('card');
  const [cardNumber, setCardNumber] = useState('4532 0151 1283 0366'); // demo valid Luhn card
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('842');
  const [isProcessing, setIsProcessing] = useState(false);
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Computations
  const subtotal = items.reduce((acc, curr) => acc + curr.itemSubtotal, 0);
  const promoResult = calculatePromoDiscount(subtotal, deliveryFee, activePromo || undefined);
  const effectiveDeliveryFee = promoResult.adjustedDeliveryFee;
  const discountAmount = promoResult.discountAmount;
  const taxes = calculateOrderTaxes(
    items,
    effectiveDeliveryFee,
    country,
    isMehrwegOptIn,
    isCutleryOptIn
  );
  const mehrwegPackagingFee = isMehrwegOptIn ? MEHRWEG_DEPOSIT_EUR : 0;
  const totalAmount = Number(
    (subtotal - discountAmount + effectiveDeliveryFee + mehrwegPackagingFee + tipAmount).toFixed(2)
  );

  const handleApplyPromo = () => {
    setPromoError(null);
    const res = calculatePromoDiscount(subtotal, deliveryFee, promoInput);
    if (res.error) {
      setPromoError(res.error);
    } else {
      setActivePromo(promoInput.trim().toUpperCase());
      sounds.playPushPing();
    }
  };

  const handleStartCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      const isCardValid = validateLuhn(cardNumber);
      if (!isCardValid) {
        alert('Please enter a valid card number');
        return;
      }
      // Show European PSD2 / 3D Secure 2.0 authentication verification simulation
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setShow3DSModal(true);
      }, 700);
    } else {
      // 1-Click Apple Pay / PayPal / Sofort flow
      finalizeOrder(true);
    }
  };

  const finalizeOrder = (is3DSVerified: boolean) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShow3DSModal(false);
      sounds.playOrderPlaced();

      const newOrder: Order = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        orderNumber: `VD-${country}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        restaurant: {
          id: restaurantId,
          name: restaurantName,
          address: country === 'DE' ? 'Oranienstraße 194, Berlin' : '14 Rue Sainte-Anne, Paris',
          country: country,
          coordinates: country === 'DE' ? { x: 280, y: 320 } : { x: 710, y: 260 },
        },
        deliveryAddress: {
          street,
          city,
          postalCode,
          country,
          doorCode,
          instructions: deliveryInstructions,
          coordinates: country === 'DE' ? { x: 380, y: 200 } : { x: 790, y: 340 },
        },
        items: [...items],
        subtotal,
        deliveryFee: effectiveDeliveryFee,
        discountAmount,
        promoCode: activePromo || undefined,
        mehrwegPackagingFee,
        cutleryIncluded: isCutleryOptIn,
        tipAmount,
        totalAmount,
        currency: 'EUR',
        taxBreakdown: taxes,
        status: 'placed',
        statusHistory: [
          {
            status: 'placed',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: 'Order confirmed and paid with 3D Secure 2.0 verification',
          },
        ],
        estimatedDeliveryTime: '25-35 mins',
        etaMinutes: 24,
        driver: {
          id: 'drv-lucas',
          name: country === 'DE' ? 'Lucas Richter' : 'Alexandre Dubois',
          avatar:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          phone: country === 'DE' ? '+49 176 9928 1142' : '+33 6 42 19 88 02',
          vehicleType: 'e-bike',
          rating: 4.96,
          totalDeliveries: 1420,
          currentCoordinates:
            country === 'DE' ? { x: 280, y: 320 } : { x: 710, y: 260 },
          speedKmh: 24,
          bearing: 45,
        },
        payment: {
          method: paymentMethod,
          last4: cardNumber.replace(/\D/g, '').slice(-4) || '4242',
          cardBrand: 'Visa / Carte Bancaire',
          transactionId: `tx_vd_${Math.random().toString(36).substring(2, 10)}`,
          is3DSVerified,
        },
        groupSession: activeGroupSession
          ? {
              id: activeGroupSession.id,
              code: activeGroupSession.code,
              hostName: activeGroupSession.host.name,
              membersCount: activeGroupSession.members.length,
              splitMode: activeGroupSession.splitMode,
              memberSummaries: aggregateGroupCart(
                items,
                activeGroupSession.members
              ).memberSummaries.map((m) => ({
                memberName: m.memberName,
                itemCount: m.itemCount,
                total: m.subtotal,
              })),
            }
          : undefined,
      };

      onOrderCompleted(newOrder);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                {country === 'DE' ? 'Sichere Kasse' : 'Paiement Sécurisé'}
              </h3>
              <p className="text-xs text-stone-400">
                {restaurantName} • 256-bit SSL Encrypted Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleStartCheckout} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {activeGroupSession && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-indigo-950 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Group Order ({activeGroupSession.code})</span>
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700 uppercase font-mono">
                    {activeGroupSession.splitMode === 'host_pays'
                      ? 'Host Pays All'
                      : activeGroupSession.splitMode === 'split_evenly'
                      ? 'Split Evenly'
                      : 'Pay Own Items'}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-900">
                  Checking out on behalf of <strong>{activeGroupSession.members.length} participants</strong>: {activeGroupSession.members.map((m) => m.name).join(', ')}.
                </p>
              </div>
            )}

            {/* Section 1: Delivery Address & Instructions */}
            <div>
              <h4 className="font-bold text-sm text-stone-900 mb-3 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>1. {t.deliveryAddress}</span>
              </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Street & House Number
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Doorbell / Floor Code
                </label>
                <input
                  type="text"
                  value={doorCode}
                  onChange={(e) => setDoorCode(e.target.value)}
                  placeholder="e.g. 3rd floor, Weber"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Driver Notes
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. please do not ring after 9pm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Promo Code & Courier Tip */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Promo Code input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.promoCode}</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="BONJOUR10 or WILLKOMMEN15"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {t.apply}
                </button>
              </div>
              {promoError && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{promoError}</span>
                </p>
              )}
              {activePromo && !promoError && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Promo {activePromo} applied! (-€{discountAmount.toFixed(2)})</span>
                </p>
              )}
            </div>

            {/* Courier Tip Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Courier Eco Tip (100% goes to driver)
              </label>
              <div className="flex space-x-1.5">
                {[0, 1.5, 2.5, 4.0].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTipAmount(amount)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      tipAmount === amount
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {amount === 0 ? '€0' : `€${amount.toFixed(2)}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Payment Gateway Selector */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="font-bold text-sm text-stone-900 mb-3 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>2. {t.paymentMethod}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs font-bold text-stone-900'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <span className="text-xs block">Card / CB</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'apple_pay'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs font-bold text-stone-900'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-stone-900" />
                <span className="text-xs block">Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'paypal'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs font-bold text-stone-900'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-base font-bold text-blue-600 block mb-0.5">P</span>
                <span className="text-xs block">PayPal</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('sofort_klarna')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'sofort_klarna'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs font-bold text-stone-900'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-xs font-bold text-pink-600 block mb-1">SOFORT</span>
                <span className="text-xs block">Klarna / Bank</span>
              </button>
            </div>

            {/* Card Inputs */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Card Number (Visa / Mastercard / Carte Bancaire)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Itemized Tax & Regulatory Breakdown Table */}
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200/80 space-y-2 text-xs">
            <h5 className="font-bold text-stone-900 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t.taxBreakdown}</span>
              </span>
              <span className="font-mono text-stone-600">{taxes.taxLabel}</span>
            </h5>

            <div className="space-y-1 text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>
                  {country === 'DE' ? 'Speisen (7% MwSt. DE §12)' : 'Restauration (10% TVA FR)'}
                </span>
                <span className="font-mono">€{taxes.foodTaxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {country === 'DE'
                    ? 'Getränke & Service (19% MwSt.)'
                    : 'Boissons & Service (20% TVA)'}
                </span>
                <span className="font-mono">€{taxes.standardTaxAmount.toFixed(2)}</span>
              </div>
              {isMehrwegOptIn && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Mehrwegverpackung Pfand (§33 VerpackG)</span>
                  <span className="font-mono">+€{MEHRWEG_DEPOSIT_EUR.toFixed(2)}</span>
                </div>
              )}
              {isCutleryOptIn ? (
                <div className="text-[11px] text-amber-700 italic">
                  ✓ Einwegbesteck & Servietten beigelegt (Loi AGEC conforme)
                </div>
              ) : (
                <div className="text-[11px] text-emerald-700 italic">
                  ✓ Zéro déchet : aucun couvert jetable inclus (Loi AGEC)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Order Sticky Bottom Bar */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
            <div>
              <span className="text-xs text-stone-500 font-medium">Total to Pay</span>
              <div className="text-2xl font-bold font-mono text-stone-950">
                €{totalAmount.toFixed(2)}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
              aria-label={`Pay €${totalAmount.toFixed(2)} and place order`}
            >
              {isProcessing ? (
                <span>Authorizing 3D Secure...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t.paySecurely}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* European 3D Secure 2.0 PSD2 Modal Simulation */}
        {show3DSModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-stone-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-stone-900">
                  Verified by Visa / CB 3D Secure
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Confirm transaction of €{totalAmount.toFixed(2)} to VoltDash Logistics EU
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 font-mono">
                SMS One-Time Passcode sent to +33 •••• 8802
              </div>

              <input
                type="text"
                placeholder="Enter 6-digit code (e.g. 123456)"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center px-3 py-2 rounded-xl border border-stone-300 font-mono text-base tracking-widest focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShow3DSModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => finalizeOrder(true)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Approve Auth
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
