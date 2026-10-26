import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { CartItemOption, MenuItem, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  restaurantId: string;
  restaurantName: string;
  language: SupportedLanguage;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    restaurantId: string,
    restaurantName: string,
    quantity: number,
    selectedOptions: CartItemOption[],
    specialInstructions: string
  ) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  restaurantId,
  restaurantName,
  language,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const t = TRANSLATIONS[language];
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() => {
    // default selections
    const initial: Record<string, string[]> = {};
    if (item.optionGroups) {
      item.optionGroups.forEach((group) => {
        if (group.minSelect > 0 && group.options.length > 0) {
          initial[group.id] = [group.options[0].id];
        } else {
          initial[group.id] = [];
        }
      });
    }
    return initial;
  });
  const [specialInstructions, setSpecialInstructions] = useState('');

  const displayName =
    language === 'de' ? item.nameDe : language === 'fr' ? item.nameFr : item.name;
  const displayDescription =
    language === 'de'
      ? item.descriptionDe
      : language === 'fr'
      ? item.descriptionFr
      : item.description;

  // Toggle options
  const handleToggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      if (maxSelect === 1) {
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (current.length < maxSelect) {
        return { ...prev, [groupId]: [...current, optionId] };
      }
      return prev;
    });
  };

  // Compute total unit price
  let optionsPrice = 0;
  const flatSelectedOptions: CartItemOption[] = [];

  if (item.optionGroups) {
    item.optionGroups.forEach((group) => {
      const selectedIds = selectedOptions[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          optionsPrice += opt.price;
          flatSelectedOptions.push({
            groupId: group.id,
            groupName: language === 'de' && group.nameDe ? group.nameDe : language === 'fr' && group.nameFr ? group.nameFr : group.name,
            optionId: opt.id,
            optionName: language === 'de' && opt.nameDe ? opt.nameDe : language === 'fr' && opt.nameFr ? opt.nameFr : opt.name,
            price: opt.price,
          });
        }
      });
    });
  }

  const unitTotal = item.price + optionsPrice;
  const grandTotal = unitTotal * quantity;

  const handleConfirm = () => {
    onAddToCart(item, restaurantId, restaurantName, quantity, flatSelectedOptions, specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        {/* Header Image & Close */}
        <div className="relative h-52 bg-stone-100 shrink-0">
          <img
            src={item.imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
            {item.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="bg-stone-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-stone-900">{displayName}</h3>
              <span className="text-lg font-mono font-bold text-amber-600 shrink-0">
                €{item.price.toFixed(2)}
              </span>
            </div>
            <p className="text-stone-600 text-sm mt-1 leading-relaxed">{displayDescription}</p>

            {item.calories && (
              <div className="flex items-center space-x-1.5 text-xs text-stone-500 mt-2 font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{item.calories} kcal • Freshly Prepared</span>
              </div>
            )}
          </div>

          {/* Option groups */}
          {item.optionGroups &&
            item.optionGroups.map((group) => {
              const groupTitle =
                language === 'de' && group.nameDe
                  ? group.nameDe
                  : language === 'fr' && group.nameFr
                  ? group.nameFr
                  : group.name;
              const isSingleSelect = group.maxSelect === 1;
              const selectedGroupIds = selectedOptions[group.id] || [];

              return (
                <div key={group.id} className="pt-4 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-stone-900">{groupTitle}</h4>
                    <span className="text-xs text-stone-500">
                      {isSingleSelect
                        ? group.minSelect > 0
                          ? 'Select 1 (Required)'
                          : 'Optional'
                        : `Up to ${group.maxSelect}`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const optTitle =
                        language === 'de' && opt.nameDe
                          ? opt.nameDe
                          : language === 'fr' && opt.nameFr
                          ? opt.nameFr
                          : opt.name;
                      const isChecked = selectedGroupIds.includes(opt.id);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleToggleOption(group.id, opt.id, group.maxSelect)}
                          className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                            isChecked
                              ? 'border-amber-500 bg-amber-50/60 text-stone-900 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                isChecked
                                  ? 'bg-amber-500 border-amber-500 text-white'
                                  : 'border-stone-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-sm font-medium">{optTitle}</span>
                          </div>

                          {opt.price > 0 && (
                            <span className="text-xs font-mono font-semibold text-stone-600">
                              +€{opt.price.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {/* Special kitchen notes */}
          <div className="pt-4 border-t border-stone-200">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {language === 'de'
                ? 'Besondere Wünsche für die Küche'
                : language === 'fr'
                ? 'Instructions spéciales pour la cuisine'
                : 'Special kitchen instructions'}
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={
                language === 'de'
                  ? 'z.B. Sauce bitte separat verpacken'
                  : language === 'fr'
                  ? 'ex: sauce à part, sans oignons'
                  : 'e.g. sauce on the side, extra crispy'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bottom bar with Quantity & Add to Cart button */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-2 bg-white border border-stone-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm font-mono text-stone-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm rounded-xl flex items-center justify-between shadow-md transition-all cursor-pointer"
            aria-label={`Add ${quantity} to cart for €${grandTotal.toFixed(2)}`}
          >
            <span>{t.addToCart}</span>
            <span className="font-mono bg-amber-400/80 px-2 py-0.5 rounded text-xs font-extrabold">
              €{grandTotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
