import React from 'react';
import {
  Zap,
  ShoppingBag,
  Clock,
  Bell,
  Smartphone,
  UtensilsCrossed,
  Bike,
  ShieldCheck,
  FileText,
  Users,
} from 'lucide-react';
import { ActiveAppView, DevicePreviewMode, GroupOrderSession, SupportedCountry, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  country: SupportedCountry;
  onCountryChange: (country: SupportedCountry) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  activeView: ActiveAppView;
  onViewChange: (view: ActiveAppView) => void;
  deviceMode: DevicePreviewMode;
  onDeviceModeChange: (mode: DevicePreviewMode) => void;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onOpenHistory: () => void;
  onOpenNotifications: () => void;
  onOpenLegal: () => void;
  unreadNotificationsCount: number;
  activeGroupSession?: GroupOrderSession | null;
  onOpenGroupOrder: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  country,
  onCountryChange,
  language,
  onLanguageChange,
  activeView,
  onViewChange,
  deviceMode,
  onDeviceModeChange,
  cartCount,
  cartSubtotal,
  onOpenCart,
  onOpenHistory,
  onOpenNotifications,
  onOpenLegal,
  unreadNotificationsCount,
  activeGroupSession,
  onOpenGroupOrder,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top micro-bar: Compliance & Market Switcher */}
      <div className="bg-stone-900 text-stone-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 font-medium text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {country === 'DE' ? t.germanyComplianceBadge : t.franceComplianceBadge}
            </span>
          </span>
          <span className="text-stone-500 hidden sm:inline">|</span>
          <button
            onClick={onOpenLegal}
            className="text-stone-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            aria-label="View legal notices and compliance"
          >
            {t.legalNotices}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Market / Country Toggle */}
          <div className="flex items-center space-x-1.5 bg-stone-800 px-2 py-0.5 rounded-sm">
            <span className="text-stone-400 text-[11px]">Market:</span>
            <button
              onClick={() => onCountryChange('DE')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                country === 'DE' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
              aria-label="Switch market to Germany"
            >
              🇩🇪 Germany (DE)
            </button>
            <button
              onClick={() => onCountryChange('FR')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                country === 'FR' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
              aria-label="Switch market to France"
            >
              🇫🇷 France (FR)
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-1">
            {(['en', 'de', 'fr'] as SupportedLanguage[]).map((lng) => (
              <button
                key={lng}
                onClick={() => onLanguageChange(lng)}
                className={`uppercase text-[11px] px-1.5 py-0.5 rounded font-mono font-medium transition-colors cursor-pointer ${
                  language === lng ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
                aria-label={`Switch language to ${lng}`}
              >
                {lng}
              </button>
            ))}
          </div>

          {/* Device Frame Simulator Toggle (iOS / Android / Desktop) */}
          <div className="hidden md:flex items-center space-x-1 bg-stone-800 px-1.5 py-0.5 rounded-sm">
            <Smartphone className="w-3 h-3 text-stone-400" />
            <button
              onClick={() => onDeviceModeChange('responsive')}
              className={`text-[11px] px-1 rounded transition-colors cursor-pointer ${
                deviceMode === 'responsive' ? 'bg-stone-600 text-white font-semibold' : 'text-stone-400 hover:text-white'
              }`}
              title="Full Desktop Responsive"
            >
              Desktop
            </button>
            <button
              onClick={() => onDeviceModeChange('iphone')}
              className={`text-[11px] px-1 rounded transition-colors cursor-pointer ${
                deviceMode === 'iphone' ? 'bg-stone-600 text-white font-semibold' : 'text-stone-400 hover:text-white'
              }`}
              title="iPhone 16 Pro Viewport Frame"
            >
              iOS
            </button>
            <button
              onClick={() => onDeviceModeChange('android')}
              className={`text-[11px] px-1 rounded transition-colors cursor-pointer ${
                deviceMode === 'android' ? 'bg-stone-600 text-white font-semibold' : 'text-stone-400 hover:text-white'
              }`}
              title="Android Galaxy Viewport Frame"
            >
              Android
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onViewChange('customer')}
            className="flex items-center space-x-2 text-left group cursor-pointer focus:outline-hidden"
            aria-label="VoltDash Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-stone-900">VoltDash</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-stone-100 text-stone-700 font-bold rounded border border-stone-200">
                  {country}
                </span>
              </div>
              <span className="text-[11px] text-stone-500 block leading-none">
                {country === 'DE' ? 'Berlin • München Express' : 'Paris • Lyon Express'}
              </span>
            </div>
          </button>
        </div>

        {/* Portal switcher: Customer / Restaurant KDS / Driver / Admin */}
        <nav className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 overflow-x-auto" aria-label="Portal Navigation">
          <button
            onClick={() => onViewChange('customer')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'customer'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-label="Switch to Customer App"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.modeCustomer}</span>
          </button>

          <button
            onClick={() => onViewChange('restaurant_kds')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'restaurant_kds'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-label="Switch to Restaurant Kitchen KDS"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.modeRestaurantKds}</span>
          </button>

          <button
            onClick={() => onViewChange('driver_app')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'driver_app'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-label="Switch to Courier Driver App"
          >
            <Bike className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.modeDriverApp}</span>
          </button>

          <button
            onClick={() => onViewChange('admin_portal')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'admin_portal'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-label="Switch to Admin & Tax Compliance Portal"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.modeAdminPortal}</span>
          </button>
        </nav>

        {/* Right action controls */}
        <div className="flex items-center space-x-2.5">
          {/* Group Order Button */}
          <button
            onClick={onOpenGroupOrder}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeGroupSession
                ? 'bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-indigo-950 border border-indigo-300 shadow-2xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
            aria-label={activeGroupSession ? `Group Order ${activeGroupSession.code} active` : 'Start Group Order session'}
          >
            <Users className={`w-4 h-4 ${activeGroupSession ? 'text-indigo-600 animate-pulse' : 'text-stone-600'}`} />
            <span className="hidden sm:inline">
              {activeGroupSession ? `Group (${activeGroupSession.members.length})` : 'Group Order'}
            </span>
          </button>

          {/* Order history button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            aria-label="View order history and receipts"
          >
            <Clock className="w-4 h-4 text-stone-600" />
            <span className="hidden sm:inline">{t.orderHistory}</span>
          </button>

          {/* Notifications bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            aria-label={`View notifications (${unreadNotificationsCount} unread)`}
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            aria-label={`Open shopping basket with ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{cartCount}</span>
            {cartSubtotal > 0 && (
              <span className="font-mono bg-amber-400/60 px-1.5 py-0.5 rounded text-[11px]">
                €{cartSubtotal.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
