import React, { useState } from 'react';
import { X, Send, Bike, ShieldCheck, CheckCheck } from 'lucide-react';
import { DriverInfo, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sounds } from '../utils/sound';

interface DriverChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverInfo;
  language: SupportedLanguage;
}

interface Message {
  id: string;
  sender: 'customer' | 'driver';
  text: string;
  time: string;
}

export const DriverChatModal: React.FC<DriverChatModalProps> = ({
  isOpen,
  onClose,
  driver,
  language,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'driver',
      text:
        language === 'de'
      ? `Hallo! Ich habe deine Bestellung abgeholt und bin mit dem E-Bike unterwegs.`
      : language === 'fr'
      ? `Bonjour ! J’ai récupéré votre commande au restaurant et je suis en route avec mon vélo électrique.`
      : `Hello! I picked up your order and I'm en route on my e-cargo bike.`,
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      text: inputVal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    sounds.playPushPing();

    // Automated courier smart reply
    setTimeout(() => {
      const driverReplies =
        language === 'de'
          ? [
              'Super, danke für die Info! Ich klingle gleich.',
              'Alles klar, ich bin in 3 Minuten da.',
              'Verstanden, habe die Liefernotiz gesehen.',
            ]
          : language === 'fr'
          ? [
              'Parfait, merci pour l’indication ! Je sonne à votre arrivée.',
              'C’est bien noté, j’arrive dans environ 3 minutes.',
              'Compris, je fais attention aux emballages.',
            ]
          : [
              'Got it! Thanks for the note. Ringing your bell in 3 mins.',
              'Understood, on my way up!',
              'Perfect, thanks for letting me know.',
            ];

      const randomReply = driverReplies[Math.floor(Math.random() * driverReplies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: `drv-${Date.now()}`,
          sender: 'driver',
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      sounds.playPushPing();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={driver.avatar}
                alt={driver.name}
                className="w-10 h-10 rounded-xl object-cover border border-emerald-500"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-stone-900 rounded-full" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-100 flex items-center space-x-1.5">
                <span>{driver.name}</span>
                <span className="text-[10px] bg-stone-800 text-emerald-400 font-bold px-1.5 py-0.2 rounded">
                  ★ {driver.rating}
                </span>
              </h4>
              <p className="text-[11px] text-stone-400 flex items-center space-x-1">
                <Bike className="w-3 h-3 text-emerald-400" />
                <span>VoltDash Express Courier</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message bubble stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'customer' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs ${
                  m.sender === 'customer'
                    ? 'bg-amber-500 text-stone-950 font-medium rounded-br-xs shadow-xs'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs shadow-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-stone-400 mt-1 px-1 flex items-center space-x-1">
                <span>{m.time}</span>
                {m.sender === 'customer' && <CheckCheck className="w-3 h-3 text-amber-600" />}
              </span>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-stone-200 flex items-center space-x-2 shrink-0"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={t.typeMessage}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl transition-colors cursor-pointer shadow-xs"
            aria-label="Send message to courier"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
