import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Bike,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Flame,
  Volume2,
} from 'lucide-react';
import { Order, Restaurant, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sounds } from '../utils/sound';

interface RestaurantKdsViewProps {
  orders: Order[];
  restaurants: Restaurant[];
  language: SupportedLanguage;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

export const RestaurantKdsView: React.FC<RestaurantKdsViewProps> = ({
  orders,
  restaurants,
  language,
  onUpdateOrderStatus,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.id || '');
  const activeRestaurant =
    restaurants.find((r) => r.id === selectedRestaurantId) || restaurants[0];

  // Stock status tracking
  const [itemStock, setItemStock] = useState<Record<string, boolean>>(() => {
    const stock: Record<string, boolean> = {};
    activeRestaurant?.items.forEach((it) => {
      stock[it.id] = true;
    });
    return stock;
  });

  const toggleStock = (itemId: string) => {
    setItemStock((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    sounds.playPushPing();
  };

  const handleStatusAdvance = (orderId: string, currentStatus: Order['status']) => {
    sounds.playPushPing();
    if (currentStatus === 'placed') {
      onUpdateOrderStatus(orderId, 'kitchen_preparing');
    } else if (currentStatus === 'kitchen_preparing') {
      onUpdateOrderStatus(orderId, 'ready_for_pickup');
    } else if (currentStatus === 'ready_for_pickup') {
      onUpdateOrderStatus(orderId, 'driver_en_route');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top KDS Controls */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl border border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-xl text-white">Kitchen Display System (KDS)</h2>
              <span className="text-[10px] bg-rose-500/30 text-rose-300 font-bold px-2 py-0.5 rounded-full uppercase">
                Live Kitchen
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Real-time order ticket routing, preparation timing, and menu stock controls
            </p>
          </div>
        </div>

        {/* Restaurant selector */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-stone-400 font-medium">Merchant:</label>
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="bg-stone-800 text-white border border-stone-700 text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer focus:ring-2 focus:ring-rose-500"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-Column Kitchen Ticket Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: New Incoming Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-stone-900 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>1. New Tickets (To Prep)</span>
            </h3>
            <span className="bg-amber-100 text-amber-900 font-mono text-xs font-bold px-2 py-0.5 rounded-full">
              {orders.filter((o) => o.status === 'placed').length}
            </span>
          </div>

          <div className="space-y-3">
            {orders
              .filter((o) => o.status === 'placed')
              .map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-4 border-2 border-amber-400 shadow-md space-y-3 animate-fade-in"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold bg-stone-900 text-white px-2 py-0.5 rounded">
                      #{ord.orderNumber}
                    </span>
                    <span className="text-stone-500 font-mono flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{ord.estimatedDeliveryTime}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-800">
                    {ord.items.map((it) => (
                      <div key={it.cartItemId} className="font-semibold flex justify-between">
                        <span>
                          {it.quantity}x {it.menuItem.name}
                        </span>
                        {it.selectedOptions.length > 0 && (
                          <span className="text-[10px] text-stone-500">
                            ({it.selectedOptions.map((o) => o.optionName).join(', ')})
                          </span>
                        )}
                      </div>
                    ))}
                    {ord.cutleryIncluded ? (
                      <span className="inline-block text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold">
                        ⚠️ AGEC: Please provide cutlery
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        🌱 Zero Waste: No Cutlery
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleStatusAdvance(ord.id, ord.status)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Accept & Start Cooking
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Column 2: In Kitchen Preparation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-rose-500">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-stone-900 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>2. Cooking on Griddle</span>
            </h3>
            <span className="bg-rose-100 text-rose-900 font-mono text-xs font-bold px-2 py-0.5 rounded-full">
              {orders.filter((o) => o.status === 'kitchen_preparing').length}
            </span>
          </div>

          <div className="space-y-3">
            {orders
              .filter((o) => o.status === 'kitchen_preparing')
              .map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-stone-900">#{ord.orderNumber}</span>
                    <span className="text-rose-600 font-bold text-xs flex items-center space-x-1 animate-pulse">
                      <Flame className="w-3.5 h-3.5" />
                      <span>In Oven / Griddle</span>
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-stone-800">
                    {ord.items.map((it) => (
                      <div key={it.cartItemId} className="font-semibold">
                        {it.quantity}x {it.menuItem.name}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleStatusAdvance(ord.id, ord.status)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Mark Ready for Pickup ✓
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Column 3: Ready & Dispatched to Driver */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-stone-900 flex items-center space-x-2">
              <Bike className="w-4 h-4 text-emerald-600" />
              <span>3. Handed to Courier</span>
            </h3>
            <span className="bg-emerald-100 text-emerald-900 font-mono text-xs font-bold px-2 py-0.5 rounded-full">
              {
                orders.filter((o) =>
                  ['ready_for_pickup', 'driver_en_route', 'arriving', 'delivered'].includes(o.status)
                ).length
              }
            </span>
          </div>

          <div className="space-y-3">
            {orders
              .filter((o) =>
                ['ready_for_pickup', 'driver_en_route', 'arriving', 'delivered'].includes(o.status)
              )
              .map((ord) => (
                <div
                  key={ord.id}
                  className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-stone-900">#{ord.orderNumber}</span>
                    <span className="text-emerald-700 font-bold capitalize">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-stone-500">
                    Assigned Courier: <strong className="text-stone-800">{ord.driver?.name || 'Lucas'}</strong> (★{' '}
                    {ord.driver?.rating || 4.95})
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Menu Stock Availability Toggles */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-stone-900 flex items-center space-x-2">
          <UtensilsCrossed className="w-5 h-5 text-amber-500" />
          <span>Real-Time Menu Stock & Availability Manager</span>
        </h3>
        <p className="text-xs text-stone-500">
          Toggle dishes out of stock instantly if fresh ingredients run out in the kitchen
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {activeRestaurant?.items.map((item) => {
            const isInStock = itemStock[item.id] !== false;
            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 bg-stone-50/50"
              >
                <div>
                  <h4 className="font-bold text-xs text-stone-900">{item.name}</h4>
                  <span className="font-mono text-xs text-stone-500">€{item.price.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => toggleStock(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isInStock
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                  aria-label={`Toggle stock status for ${item.name}`}
                >
                  {isInStock ? 'In Stock' : 'Sold Out'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
