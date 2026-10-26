import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Navigation,
  Bike,
  Car,
  Clock,
  Compass,
  Phone,
  MessageSquare,
  Play,
  Pause,
  FastForward,
  ShieldCheck,
  BatteryCharging,
  Leaf,
  Store,
  Home,
  ChevronRight,
} from 'lucide-react';
import { Order, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { interpolatePosition, calculateDistanceKm } from '../utils/delivery';

interface LiveGpsMapProps {
  order: Order;
  language: SupportedLanguage;
  onUpdateStatus?: (newStatus: Order['status']) => void;
  onOpenDriverChat: () => void;
  onOpenRatingModal: () => void;
}

export const LiveGpsMap: React.FC<LiveGpsMapProps> = ({
  order,
  language,
  onUpdateStatus,
  onOpenDriverChat,
  onOpenRatingModal,
}) => {
  const t = TRANSLATIONS[language];
  const restaurantCoord = order.restaurant.coordinates;
  const customerCoord = order.deliveryAddress.coordinates;

  // Create intermediate waypoints to simulate realistic street turns
  const routeWaypoints = useMemo(() => {
    const p1 = restaurantCoord;
    const p4 = customerCoord;
    // 2 synthetic street turn corners
    const p2 = { x: p1.x + (p4.x - p1.x) * 0.45, y: p1.y };
    const p3 = { x: p1.x + (p4.x - p1.x) * 0.45, y: p4.y };
    return [p1, p2, p3, p4];
  }, [restaurantCoord, customerCoord]);

  // Route path SVG string
  const routePathString = useMemo(() => {
    return `M ${routeWaypoints[0].x} ${routeWaypoints[0].y} L ${routeWaypoints[1].x} ${routeWaypoints[1].y} L ${routeWaypoints[2].x} ${routeWaypoints[2].y} L ${routeWaypoints[3].x} ${routeWaypoints[3].y}`;
  }, [routeWaypoints]);

  // Animation progress state (0 = at restaurant, 1 = at customer)
  const [progress, setProgress] = useState(
    order.status === 'delivered' ? 1.0 : order.status === 'arriving' ? 0.92 : 0.35
  );
  const [isPlaying, setIsPlaying] = useState(order.status !== 'delivered');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const requestRef = useRef<number | null>(null);

  // Compute live courier position and bearing along waypoints
  const courierPos = useMemo(() => {
    if (progress <= 0.33) {
      const frac = progress / 0.33;
      return interpolatePosition(routeWaypoints[0], routeWaypoints[1], frac);
    } else if (progress <= 0.66) {
      const frac = (progress - 0.33) / 0.33;
      return interpolatePosition(routeWaypoints[1], routeWaypoints[2], frac);
    } else {
      const frac = (progress - 0.66) / 0.34;
      return interpolatePosition(routeWaypoints[2], routeWaypoints[3], frac);
    }
  }, [progress, routeWaypoints]);

  // Total distance & remaining distance
  const totalDistanceKm = useMemo(() => {
    return calculateDistanceKm(restaurantCoord, customerCoord);
  }, [restaurantCoord, customerCoord]);

  const remainingDistanceKm = useMemo(() => {
    const rem = totalDistanceKm * (1 - progress);
    return Math.max(0.05, Number(rem.toFixed(1)));
  }, [totalDistanceKm, progress]);

  // Current dynamic ETA minutes
  const dynamicEtaMinutes = useMemo(() => {
    if (progress >= 1.0) return 0;
    const mins = Math.max(1, Math.ceil((1 - progress) * (order.etaMinutes || 15)));
    return mins;
  }, [progress, order.etaMinutes]);

  // Current instantaneous speed
  const currentSpeedKmh = useMemo(() => {
    if (progress >= 1.0) return 0;
    if (!isPlaying) return 0;
    return Math.round(21 + Math.sin(progress * 18) * 4);
  }, [progress, isPlaying]);

  // Next maneuver instruction
  const currentManeuver = useMemo(() => {
    if (progress >= 0.95) {
      return language === 'de'
        ? 'Am Zielort angekommen! Bitte entgegennehmen'
        : language === 'fr'
        ? 'Arrivé à destination ! Présentez-vous pour la livraison'
        : 'Arrived at your doorstep! Meet courier outside';
    }
    if (progress >= 0.66) {
      return language === 'de'
        ? `In 120m links abbiegen auf ${order.deliveryAddress.street}`
        : language === 'fr'
        ? `Dans 120m, tournez à gauche sur ${order.deliveryAddress.street}`
        : `In 120m, turn left onto ${order.deliveryAddress.street}`;
    }
    if (progress >= 0.33) {
      return language === 'de'
        ? 'Geradeaus auf dem Radschnellweg (18 km/h)'
        : language === 'fr'
        ? 'Tout droit sur la piste cyclable protégée'
        : 'Straight ahead on eco bike corridor (22 km/h)';
    }
    return language === 'de'
      ? `Bestellung bei ${order.restaurant.name} abgeholt`
      : language === 'fr'
      ? `Commande retirée chez ${order.restaurant.name}`
      : `Order picked up from ${order.restaurant.name}`;
  }, [progress, language, order.deliveryAddress.street, order.restaurant.name]);

  // Tick courier progress over time
  useEffect(() => {
    if (!isPlaying || progress >= 1.0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.008 * speedMultiplier;
        if (next >= 1.0) {
          setIsPlaying(false);
          onUpdateStatus?.('delivered');
          return 1.0;
        } else if (next >= 0.88 && order.status !== 'arriving') {
          onUpdateStatus?.('arriving');
        }
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, progress, order.status, onUpdateStatus]);

  return (
    <div className="bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 text-white">
      {/* Top telemetry bar */}
      <div className="px-5 py-4 bg-stone-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Navigation className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
                {t.liveTracking}
              </span>
              <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                GPS 60Hz RTK
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-200">{currentManeuver}</p>
          </div>
        </div>

        {/* HUD Quick Stats */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-right">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">{t.etaRemaining}</span>
            <div className="flex items-center space-x-1 justify-end">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-lg font-mono font-bold text-amber-400">
                {progress >= 1.0 ? '0 min' : `${dynamicEtaMinutes} min`}
              </span>
            </div>
          </div>

          <div className="border-l border-stone-800 pl-4 sm:pl-6">
            <span className="text-[11px] text-stone-400 block font-medium">{t.distanceRemaining}</span>
            <span className="text-lg font-mono font-bold text-stone-100">
              {progress >= 1.0 ? '0.0 km' : `${remainingDistanceKm} km`}
            </span>
          </div>

          <div className="border-l border-stone-800 pl-4 sm:pl-6 hidden sm:block">
            <span className="text-[11px] text-stone-400 block font-medium">{t.courierSpeed}</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {currentSpeedKmh} km/h
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Surface */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-[#1a1f29] overflow-hidden select-none">
        {/* City Street Grid & Geography rendered via SVG */}
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Grid Pattern for Urban City Blocks */}
            <pattern id="street-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#181e28" />
              <rect x="5" y="5" width="90" height="90" rx="6" fill="#1f2735" opacity="0.7" />
              <circle cx="50" cy="50" r="1.5" fill="#2d3748" />
            </pattern>

            {/* Glowing route gradient */}
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Courier Radar Pulse Animation */}
            <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base urban blocks */}
          <rect width="1000" height="1000" fill="url(#street-grid)" />

          {/* Major Urban River / Waterway (e.g. Spree in Berlin / Seine in Paris) */}
          <path
            d="M 0 520 Q 300 480 500 550 T 1000 490 L 1000 590 Q 700 660 500 610 T 0 580 Z"
            fill="#13273d"
            opacity="0.85"
          />
          <text x="510" y="575" fill="#2563eb" fontSize="13" fontFamily="sans-serif" opacity="0.6" letterSpacing="3">
            {order.restaurant.country === 'DE' ? 'SPREE WATERWAY' : 'SEINE WATERWAY'}
          </text>

          {/* City Green Park */}
          <path
            d="M 120 100 C 220 80 320 160 300 240 C 280 320 160 300 110 220 Z"
            fill="#162e26"
            opacity="0.6"
          />
          <text x="170" y="190" fill="#10b981" fontSize="11" fontFamily="sans-serif" opacity="0.5" letterSpacing="1.5">
            {order.restaurant.country === 'DE' ? 'TIERGARTEN PARK' : 'JARDIN DU LUXEMBOURG'}
          </text>

          {/* Major Avenues / Street Arteries */}
          <g stroke="#334155" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
            <line x1="0" y1="200" x2="1000" y2="200" />
            <line x1="0" y1="400" x2="1000" y2="400" />
            <line x1="0" y1="700" x2="1000" y2="700" />
            <line x1="250" y1="0" x2="250" y2="1000" />
            <line x1="500" y1="0" x2="500" y2="1000" />
            <line x1="750" y1="0" x2="750" y2="1000" />
          </g>

          {/* Secondary streets */}
          <g stroke="#263242" strokeWidth="6" strokeLinecap="round" opacity="0.8">
            <line x1="0" y1="100" x2="1000" y2="100" />
            <line x1="0" y1="300" x2="1000" y2="300" />
            <line x1="0" y1="800" x2="1000" y2="800" />
            <line x1="380" y1="0" x2="380" y2="1000" />
            <line x1="620" y1="0" x2="620" y2="1000" />
            <line x1="880" y1="0" x2="880" y2="1000" />
          </g>

          {/* Street Labels */}
          <text x="260" y="190" fill="#64748b" fontSize="10" fontFamily="sans-serif" opacity="0.8">
            {order.restaurant.country === 'DE' ? 'Friedrichstraße' : 'Boulevard Saint-Germain'}
          </text>
          <text x="510" y="390" fill="#64748b" fontSize="10" fontFamily="sans-serif" opacity="0.8">
            {order.restaurant.country === 'DE' ? 'Karl-Marx-Allee' : 'Rue de Rivoli'}
          </text>
          <text x="760" y="690" fill="#64748b" fontSize="10" fontFamily="sans-serif" opacity="0.8">
            {order.restaurant.country === 'DE' ? 'Kastanienallee' : 'Avenue Montaigne'}
          </text>

          {/* 1. Planned Delivery Route Polyline */}
          <path
            d={routePathString}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={routePathString}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10 6"
            className="animate-dash"
          />

          {/* 2. Restaurant Pickup Pin */}
          <g transform={`translate(${restaurantCoord.x}, ${restaurantCoord.y})`}>
            <circle r="22" fill="#ef4444" opacity="0.2" className="animate-ping" />
            <circle r="14" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              🍴
            </text>
            <rect x="-60" y="-36" width="120" height="22" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
            <text x="0" y="-22" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              {order.restaurant.name.substring(0, 18)}
            </text>
          </g>

          {/* 3. Customer Destination Pin */}
          <g transform={`translate(${customerCoord.x}, ${customerCoord.y})`}>
            <circle r="24" fill="#10b981" opacity="0.25" className="animate-ping" />
            <circle r="15" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
              📍
            </text>
            <rect x="-50" y="-36" width="100" height="22" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
            <text x="0" y="-22" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              {language === 'de' ? 'Deine Adresse' : language === 'fr' ? 'Votre adresse' : 'Your Doorstep'}
            </text>
          </g>

          {/* 4. Real-time Animated Courier Vehicle */}
          <g
            transform={`translate(${courierPos.x}, ${courierPos.y}) rotate(${courierPos.bearing})`}
            className="transition-transform duration-300"
          >
            {/* Pulsing GPS halo */}
            <circle r="36" fill="url(#pulseGlow)" />

            {/* Vehicle body */}
            <circle r="18" fill="#0284c7" stroke="#ffffff" strokeWidth="3" />
            {/* Courier icon (centered) */}
            <g transform="translate(-8, -8) scale(0.65)">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z"
                fill="#ffffff"
              />
            </g>

            {/* Forward heading beam triangle */}
            <polygon points="0,-24 -6,-16 6,-16" fill="#38bdf8" />
          </g>
        </svg>

        {/* Live Floating Driver Card Overlay */}
        <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-80 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-800 p-3.5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center space-x-3">
              <img
                src={
                  order.driver?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                }
                alt="Courier avatar"
                className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
              />
              <div>
                <h4 className="font-bold text-sm text-stone-100 flex items-center space-x-1.5">
                  <span>{order.driver?.name || 'Lucas R.'}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                    ★ {order.driver?.rating || 4.95}
                  </span>
                </h4>
                <div className="flex items-center space-x-2 text-xs text-stone-400 mt-0.5">
                  <span className="flex items-center space-x-1">
                    <Bike className="w-3.5 h-3.5 text-stone-300" />
                    <span>Eco E-Cargo Bike</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">1,400+ trips</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2.5 flex items-center justify-between gap-2">
            <button
              onClick={onOpenDriverChat}
              className="flex-1 py-1.5 px-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              aria-label="Open live chat with driver"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.chatWithDriver}</span>
            </button>

            <a
              href="tel:+4917699281142"
              className="py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors"
              aria-label="Call driver phone"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Live Simulation Controls for User / Demo Testing */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto bg-stone-950/90 backdrop-blur-md rounded-2xl border border-stone-800 p-2.5 flex items-center justify-between sm:justify-end space-x-3 shadow-xl">
          <div className="text-xs text-stone-400 font-mono hidden sm:block">
            Simulate GPS:
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause telemetry movement' : 'Play telemetry movement'}
              aria-label="Toggle GPS playback"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => {
                setSpeedMultiplier((prev) => (prev === 1 ? 3 : prev === 3 ? 6 : 1));
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                speedMultiplier > 1 ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
              title="Fast-forward speed multiplier"
              aria-label="Change simulation speed"
            >
              {speedMultiplier}x Speed
            </button>

            <button
              onClick={() => {
                setProgress(1.0);
                setIsPlaying(false);
                onUpdateStatus?.('delivered');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              title="Instantly arrive and deliver"
              aria-label="Trigger instant order delivery"
            >
              {progress >= 1.0 ? 'Delivered ✓' : 'Instant Arrive'}
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Stage Progress Indicator */}
      <div className="px-5 py-4 bg-stone-950 border-t border-stone-800">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className={`p-2 rounded-xl transition-colors ${progress >= 0 ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-stone-500'}`}>
            <span className="block text-sm mb-0.5">1. ✓</span>
            <span>{t.orderStatusPlaced}</span>
          </div>
          <div className={`p-2 rounded-xl transition-colors ${progress >= 0.15 ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-stone-500'}`}>
            <span className="block text-sm mb-0.5">2. 🍳</span>
            <span>{t.orderStatusPreparing}</span>
          </div>
          <div className={`p-2 rounded-xl transition-colors ${progress >= 0.35 && progress < 0.9 ? 'bg-amber-500/15 text-amber-300 font-bold animate-pulse' : progress >= 0.9 ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-stone-500'}`}>
            <span className="block text-sm mb-0.5">3. 🚴</span>
            <span>{t.orderStatusEnRoute}</span>
          </div>
          <div className={`p-2 rounded-xl transition-colors ${progress >= 1.0 ? 'bg-emerald-500 text-stone-950 font-extrabold shadow-lg' : 'text-stone-500'}`}>
            <span className="block text-sm mb-0.5">4. 🎁</span>
            <span>{progress >= 1.0 ? t.orderStatusDelivered : t.orderStatusArriving}</span>
          </div>
        </div>

        {/* Post delivery rating trigger banner when completed */}
        {progress >= 1.0 && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌟</span>
              <div>
                <h5 className="font-extrabold text-sm">
                  {language === 'de'
                    ? 'Bestellung erfolgreich zugestellt!'
                    : language === 'fr'
                    ? 'Commande livrée avec succès !'
                    : 'Order successfully delivered!'}
                </h5>
                <p className="text-xs text-stone-900 font-medium">
                  {language === 'de'
                    ? 'Wie war dein Kurier Lucas? Hinterlasse jetzt eine Bewertung.'
                    : language === 'fr'
                    ? 'Comment s’est passée votre livraison ? Évaluez votre livreur.'
                    : 'How was courier Lucas? Leave a quick rating and tip.'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenRatingModal}
              className="px-4 py-2 bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              aria-label="Open driver rating modal"
            >
              {t.submitRating}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
