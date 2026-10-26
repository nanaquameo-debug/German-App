import React from 'react';
import { Star, Clock, Bike, ShieldCheck, Heart } from 'lucide-react';
import { Restaurant, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface RestaurantCardProps {
  restaurant: Restaurant;
  language: SupportedLanguage;
  onClick: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  language,
  onClick,
}) => {
  const t = TRANSLATIONS[language];
  const cuisine =
    language === 'de'
      ? restaurant.cuisineDe
      : language === 'fr'
      ? restaurant.cuisineFr
      : restaurant.cuisine;

  const tagline =
    language === 'de'
      ? restaurant.taglineDe
      : language === 'fr'
      ? restaurant.taglineFr
      : restaurant.tagline;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Hero Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <img
          src={restaurant.heroImage}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span className="bg-stone-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>
              {restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} min
            </span>
          </span>

          {restaurant.deliveryFee === 0 && (
            <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
              {t.freeDelivery}
            </span>
          )}
        </div>

        {/* Country Flag Badge */}
        <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full font-mono font-bold flex items-center space-x-1">
          <span>{restaurant.country === 'DE' ? '🇩🇪 DE' : '🇫🇷 FR'}</span>
        </div>

        {/* Dietary Pills at bottom of image */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {restaurant.dietaryTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-base text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="font-bold text-xs text-stone-900">{restaurant.rating}</span>
              <span className="text-[10px] text-stone-400">({restaurant.ratingCount})</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 font-medium">{cuisine} &bull; {restaurant.city}</p>
          <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{tagline}</p>
        </div>

        {/* Footer info strip */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <span className="flex items-center space-x-1 font-medium">
            <Bike className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {restaurant.deliveryFee > 0 ? `€${restaurant.deliveryFee.toFixed(2)} delivery` : 'Free'}
            </span>
          </span>

          <span className="text-[11px] text-stone-400">
            Min. €{restaurant.minOrder.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
