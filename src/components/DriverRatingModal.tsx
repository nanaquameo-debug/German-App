import React, { useState } from 'react';
import { X, Star, Heart, ThumbsUp, Sparkles, Check, MessageSquare } from 'lucide-react';
import { Order, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sounds } from '../utils/sound';

interface DriverRatingModalProps {
  order: Order | null;
  language: SupportedLanguage;
  onClose: () => void;
  onSubmitRating: (orderId: string, driverStars: number, tags: string[], comment: string, foodStars: number) => void;
}

const DRIVER_TAGS = [
  'Super Fast & Punctual',
  'Food Kept Piping Hot',
  'Friendly & Courteous',
  'Followed Delivery Notes',
  'Handled With Care',
  'Eco-Friendly Bike Rider',
];

export const DriverRatingModal: React.FC<DriverRatingModalProps> = ({
  order,
  language,
  onClose,
  onSubmitRating,
}) => {
  if (!order) return null;

  const t = TRANSLATIONS[language];
  const [driverStars, setDriverStars] = useState(5);
  const [foodStars, setFoodStars] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([DRIVER_TAGS[0], DRIVER_TAGS[1]]);
  const [comment, setComment] = useState('');
  const [extraTip, setExtraTip] = useState(0);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPushPing();
    onSubmitRating(order.id, driverStars, selectedTags, comment, foodStars);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={
                order.driver?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
              }
              alt="Courier"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
            />
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {t.driverRatingTitle} {order.driver?.name || 'Lucas'}
              </h3>
              <p className="text-xs text-stone-900/80 font-medium">
                {order.restaurant.name} • {order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-900 hover:bg-amber-400/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Close rating modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Driver Stars */}
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-2">
              {t.rateDriverPrompt}
            </span>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setDriverStars(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  aria-label={`Rate driver ${star} stars`}
                >
                  <Star
                    className={`w-9 h-9 ${
                      star <= driverStars
                        ? 'text-amber-500 fill-amber-400 drop-shadow-xs'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-stone-700 mt-2">
              {driverStars === 5
                ? 'Outstanding Courier Service! ★ 5.0'
                : driverStars >= 4
                ? 'Great delivery experience'
                : 'Could be improved'}
            </p>
          </div>

          {/* Compliment Tags */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              What went great? (Select badges)
            </label>
            <div className="flex flex-wrap gap-2">
              {DRIVER_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restaurant Food Quality Rating */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {t.rateFoodPrompt} {order.restaurant.name}
                </span>
                <span className="text-[11px] text-stone-500">Food taste & packaging</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFoodStars(star)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= foodStars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review comment */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Review notes for driver and restaurant
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Courier was very courteous and the smash burger was hot and delicious!"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            {t.submitRating}
          </button>
        </form>
      </div>
    </div>
  );
};
