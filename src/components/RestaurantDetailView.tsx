import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  ShieldCheck,
  Plus,
  Flame,
  Info,
  MapPin,
  Recycle,
  Leaf,
  Users,
} from 'lucide-react';
import { MenuItem, Restaurant, SupportedLanguage, DietaryTag } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface RestaurantDetailViewProps {
  restaurant: Restaurant;
  language: SupportedLanguage;
  onBack: () => void;
  onSelectItem: (item: MenuItem) => void;
  onOpenGroupOrder?: () => void;
}

export const RestaurantDetailView: React.FC<RestaurantDetailViewProps> = ({
  restaurant,
  language,
  onBack,
  onSelectItem,
  onOpenGroupOrder,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<DietaryTag | 'ALL'>('ALL');

  const filteredItems = restaurant.items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesDietary =
      activeDietaryFilter === 'ALL' || item.dietaryTags.includes(activeDietaryFilter);
    return matchesCategory && matchesDietary;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-stone-600 hover:text-stone-950 font-bold text-xs px-3 py-2 bg-white rounded-xl border border-stone-200 shadow-2xs transition-colors cursor-pointer"
          aria-label="Back to all restaurants"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.allRestaurants}</span>
        </button>

        {onOpenGroupOrder && (
          <button
            onClick={onOpenGroupOrder}
            className="flex items-center space-x-2 text-indigo-950 hover:text-indigo-900 font-bold text-xs px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 rounded-xl border border-indigo-200 shadow-2xs transition-all cursor-pointer"
            aria-label="Start Group Order with friends"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Start Group Order</span>
          </button>
        )}
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white shadow-xl">
        <div className="h-64 sm:h-72 w-full overflow-hidden relative">
          <img
            src={restaurant.heroImage}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-stone-950 font-black text-xs px-2.5 py-0.5 rounded-full font-mono uppercase">
                {restaurant.country === 'DE' ? '🇩🇪 Germany' : '🇫🇷 France'}
              </span>
              <span className="text-xs text-stone-300 font-medium">
                {restaurant.city} &bull; {restaurant.address}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {restaurant.name}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300">
              {language === 'de'
                ? restaurant.taglineDe
                : language === 'fr'
                ? restaurant.taglineFr
                : restaurant.tagline}
            </p>

            {/* Compliance Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {restaurant.country === 'DE' ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium flex items-center space-x-1.5">
                  <Recycle className="w-3.5 h-3.5" />
                  <span>VerpackG §33 Mehrwegbehälter verfügbar (+1,50 € Pfand)</span>
                </span>
              ) : (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-medium flex items-center space-x-1.5">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Conforme Loi AGEC &bull; Zéro plastique à usage unique</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-stone-900/90 backdrop-blur-md p-4 rounded-2xl border border-stone-800 flex items-center space-x-5 text-center">
            <div>
              <span className="text-[11px] text-stone-400 block font-medium">Rating</span>
              <div className="flex items-center space-x-1 justify-center text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span>{restaurant.rating}</span>
              </div>
              <span className="text-[10px] text-stone-500">({restaurant.ratingCount})</span>
            </div>

            <div className="border-l border-stone-800 pl-4">
              <span className="text-[11px] text-stone-400 block font-medium">Delivery</span>
              <span className="text-sm font-bold text-white block">
                {restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} min
              </span>
              <span className="text-[10px] text-stone-400">€{restaurant.deliveryFee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Dietary Filters */}
      <div className="space-y-3 sticky top-20 z-20 bg-stone-50/90 backdrop-blur-md py-3 -mx-4 px-4 border-b border-stone-200">
        {/* Categories */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All Menu ({restaurant.items.length})
          </button>
          {restaurant.menuCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dietary Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-stone-400 font-medium text-[11px] shrink-0">Dietary:</span>
          {(['ALL', 'Halal', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Bio/Organic'] as const).map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setActiveDietaryFilter(tag)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeDietaryFilter === tag
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* Menu Dish Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const displayName =
            language === 'de' ? item.nameDe : language === 'fr' ? item.nameFr : item.name;
          const displayDescription =
            language === 'de'
              ? item.descriptionDe
              : language === 'fr'
              ? item.descriptionFr
              : item.description;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group bg-white rounded-3xl p-4 border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex items-start justify-between gap-4 cursor-pointer"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-base text-stone-900 group-hover:text-amber-600 transition-colors">
                    {displayName}
                  </h3>
                  {item.isPopular && (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {displayDescription}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="font-mono font-bold text-stone-950 text-sm">
                    €{item.price.toFixed(2)}
                  </span>

                  {item.calories && (
                    <span className="text-[11px] text-stone-400 font-mono">
                      {item.calories} kcal
                    </span>
                  )}

                  {item.dietaryTags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dish Photo Thumbnail & Quick Add Button */}
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-stone-100">
                <img
                  src={item.imageUrl}
                  alt={displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-xl bg-white shadow-md text-stone-900 hover:bg-amber-500 hover:text-stone-950 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label={`Add ${displayName} to basket`}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
