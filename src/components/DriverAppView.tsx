import React, { useState } from 'react';
import {
  Bike,
  Navigation,
  CheckCircle,
  Phone,
  MessageSquare,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Leaf,
  Award,
  Zap,
} from 'lucide-react';
import { Order, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sounds } from '../utils/sound';

interface DriverAppViewProps {
  orders: Order[];
  language: SupportedLanguage;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onOpenCustomerChat: () => void;
}

export const DriverAppView: React.FC<DriverAppViewProps> = ({
  orders,
  language,
  onUpdateOrderStatus,
  onOpenCustomerChat,
}) => {
  const t = TRANSLATIONS[language];
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'radar' | 'earnings'>('active');

  const activeOrder = orders.find((o) =>
    ['kitchen_preparing', 'ready_for_pickup', 'driver_en_route', 'arriving'].includes(o.status)
  );

  const handleAdvanceDelivery = () => {
    if (!activeOrder) return;
    sounds.playPushPing();

    if (activeOrder.status === 'kitchen_preparing' || activeOrder.status === 'ready_for_pickup') {
      onUpdateOrderStatus(activeOrder.id, 'driver_en_route');
    } else if (activeOrder.status === 'driver_en_route') {
      onUpdateOrderStatus(activeOrder.id, 'arriving');
    } else if (activeOrder.status === 'arriving') {
      sounds.playDeliveredFanfare();
      onUpdateOrderStatus(activeOrder.id, 'delivered');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Courier Shift Status Bar */}
      <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-xl border border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
              alt="Lucas Courier"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-stone-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-lg text-white">Lucas Richter</h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span>★ 4.96</span>
                <span className="text-stone-400 font-normal">&bull; Top Dasher EU</span>
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Vehicle: Specialized Turbo E-Cargo Bike &bull; Berlin Zone 1
            </p>
          </div>
        </div>

        {/* Online / Offline switch */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-stone-300">
            {isOnline ? 'Active On Shift' : 'Offline'}
          </span>
          <button
            onClick={() => {
              setIsOnline(!isOnline);
              sounds.playPushPing();
            }}
            className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
              isOnline ? 'bg-emerald-500' : 'bg-stone-700'
            }`}
            aria-label="Toggle online shift status"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                isOnline ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'active' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
          }`}
        >
          Active Job & Navigation
        </button>
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'radar' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
          }`}
        >
          Dispatch Radar (Nearby Offers)
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'earnings' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
          }`}
        >
          Daily Earnings & Eco Stats
        </button>
      </div>

      {/* Tab 1: Active Job & GPS Navigation HUD */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeOrder ? (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-6">
              {/* Job Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      #{activeOrder.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 capitalize">
                      {activeOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-stone-900 mt-1">
                    Deliver to {activeOrder.deliveryAddress.street}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 block font-semibold">Guaranteed Pay</span>
                  <span className="font-mono font-extrabold text-xl text-stone-900">
                    €{(activeOrder.deliveryFee + activeOrder.tipAmount + 3.0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Turn-by-turn instruction box */}
              <div className="bg-stone-900 text-white rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Navigation className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 uppercase font-mono tracking-wider">
                      Turn-by-Turn GPS
                    </span>
                    <h4 className="font-bold text-sm text-stone-100">
                      In 120m, turn left onto {activeOrder.deliveryAddress.street}
                    </h4>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs text-emerald-400 font-bold block">1.4 km</span>
                  <span className="text-[11px] text-stone-400">4 mins</span>
                </div>
              </div>

              {/* Waypoint details */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">
                      Pick Up: {activeOrder.restaurant.name}
                    </span>
                    <p className="text-stone-500">{activeOrder.restaurant.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">
                      Drop Off: {activeOrder.deliveryAddress.street}, {activeOrder.deliveryAddress.city}
                    </span>
                    <p className="text-stone-500">
                      {activeOrder.deliveryAddress.doorCode || 'Doorbell on arrival'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex space-x-2">
                  <button
                    onClick={onOpenCustomerChat}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    <span>Message Customer</span>
                  </button>
                  <a
                    href="tel:+4917699281142"
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Call Customer</span>
                  </a>
                </div>

                <button
                  onClick={handleAdvanceDelivery}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {activeOrder.status === 'kitchen_preparing' || activeOrder.status === 'ready_for_pickup'
                      ? 'Confirm Pickup & Start Ride'
                      : activeOrder.status === 'driver_en_route'
                      ? 'Arrived at Customer Door'
                      : 'Complete Order & Collect Fare ✓'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <Bike className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-800 text-base">No active delivery job</h3>
              <p className="text-xs text-stone-500 mt-1">
                Check the Dispatch Radar tab to accept new incoming delivery requests!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Dispatch Radar */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="bg-stone-900 text-white rounded-3xl p-5 border border-stone-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-white">Live Courier Dispatch Radar</h4>
              <p className="text-xs text-stone-400">2 high-demand surge offers near you</p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">
              Surge +€1.50 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500 shadow-md space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-stone-900 text-white px-2 py-0.5 rounded">
                    OFFER #VD-894
                  </span>
                  <h4 className="font-extrabold text-stone-900 text-sm mt-1">
                    Bistrot Montmartre &bull; 2 items
                  </h4>
                  <p className="text-xs text-stone-500">2.4 km total trip &bull; est. 12 mins</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-emerald-600">€7.80</span>
                  <span className="text-[10px] text-stone-400 block font-medium">incl. €2.50 tip</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    sounds.playPushPing();
                    setActiveTab('active');
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Accept Offer
                </button>
                <button className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs rounded-xl cursor-pointer">
                  Decline
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3 opacity-90">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-stone-900 text-white px-2 py-0.5 rounded">
                    OFFER #VD-895
                  </span>
                  <h4 className="font-extrabold text-stone-900 text-sm mt-1">
                    Curry 36 & Bio-Wurst &bull; 1 item
                  </h4>
                  <p className="text-xs text-stone-500">1.8 km total trip &bull; est. 8 mins</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-emerald-600">€6.20</span>
                  <span className="text-[10px] text-stone-400 block font-medium">incl. €1.50 tip</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    sounds.playPushPing();
                    setActiveTab('active');
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Accept Offer
                </button>
                <button className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs rounded-xl cursor-pointer">
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Earnings & Eco Stats */}
      {activeTab === 'earnings' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-400 font-bold uppercase block">Today's Earnings</span>
              <span className="text-3xl font-black font-mono text-stone-900 block mt-1">
                €94.50
              </span>
              <span className="text-xs text-emerald-600 font-medium mt-1 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14% vs yesterday</span>
              </span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-400 font-bold uppercase block">Completed Trips</span>
              <span className="text-3xl font-black font-mono text-stone-900 block mt-1">11</span>
              <span className="text-xs text-stone-500 font-medium mt-1">Avg 14 mins / order</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-400 font-bold uppercase block">CO2 Saved</span>
              <span className="text-3xl font-black font-mono text-emerald-600 block mt-1">
                14.2 kg
              </span>
              <span className="text-xs text-stone-500 font-medium mt-1 flex items-center space-x-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% E-Bike Zero Emission</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
