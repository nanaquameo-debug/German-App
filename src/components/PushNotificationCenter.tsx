import React from 'react';
import { X, Bell, Check, Tag, Truck, Sparkles, Volume2 } from 'lucide-react';
import { PushNotification, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sounds } from '../utils/sound';

interface PushNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllRead: () => void;
  language: SupportedLanguage;
  onSendTestPromo: () => void;
}

export const PushNotificationCenter: React.FC<PushNotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  language,
  onSendTestPromo,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-end p-4 sm:p-6 bg-stone-950/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full mt-14 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center">
              <Bell className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm">{t.notifications}</h4>
              <p className="text-[10px] text-stone-400">Real-time status & promo push service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick action strip */}
        <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllRead}
            className="text-stone-600 hover:text-stone-900 font-semibold cursor-pointer flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t.markAllRead}</span>
          </button>

          <button
            onClick={() => {
              sounds.playPushPing();
              onSendTestPromo();
            }}
            className="text-amber-700 hover:text-amber-900 font-semibold cursor-pointer flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Simulate Promo Push</span>
          </button>
        </div>

        {/* Notifications list */}
        <div className="p-3 overflow-y-auto space-y-2.5 flex-1 divide-y divide-stone-100">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              {t.noNotifications}
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`pt-2.5 first:pt-0 p-2 rounded-xl transition-colors ${
                  !n.isRead ? 'bg-amber-50/60 font-medium' : 'text-stone-600'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                      n.type === 'promotion'
                        ? 'bg-rose-100 text-rose-600'
                        : n.type === 'order_status'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {n.type === 'promotion' ? (
                      <Tag className="w-3.5 h-3.5" />
                    ) : (
                      <Truck className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-stone-900 truncate">{n.title}</h5>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-1">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-snug">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
