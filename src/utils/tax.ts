import { CartItem, SupportedCountry, SupportedCurrency, SupportedLanguage, TaxBreakdown } from '../types';

export const PROMO_CODES: Record<string, { discountPercent?: number; discountFixed?: number; minSpend: number; freeDelivery?: boolean; label: string }> = {
  BONJOUR10: {
    discountPercent: 10,
    minSpend: 15.0,
    label: '10% off entire order (France Launch Special)',
  },
  WILLKOMMEN15: {
    discountPercent: 15,
    minSpend: 20.0,
    label: '15% off entire order (German Market Welcome)',
  },
  FREEDELIVERY: {
    freeDelivery: true,
    minSpend: 12.0,
    label: 'Free Eco-Courier Delivery',
  },
  EUROFAST5: {
    discountFixed: 5.0,
    minSpend: 25.0,
    label: '€5.00 off orders over €25.00',
  },
};

export const MEHRWEG_DEPOSIT_EUR = 1.5;

/**
 * Calculates itemized taxes according to German (MwSt) or French (TVA) tax rules.
 */
export function calculateOrderTaxes(
  items: CartItem[],
  deliveryFee: number,
  country: SupportedCountry,
  isMehrwegOptIn: boolean,
  cutleryOptedIn: boolean
): TaxBreakdown {
  let foodGross = 0;
  let standardGross = 0;

  for (const item of items) {
    const isStandardTax = item.menuItem.taxCategory === 'beverage_alcohol';
    if (isStandardTax) {
      standardGross += item.itemSubtotal;
    } else {
      foodGross += item.itemSubtotal;
    }
  }

  // Delivery service is taxed at standard rate
  standardGross += deliveryFee;

  let foodRatePercent = 7.0; // default German food MwSt
  let standardRatePercent = 19.0; // default German standard MwSt
  const complianceNotes: string[] = [];

  if (country === 'DE') {
    foodRatePercent = 7.0;
    standardRatePercent = 19.0;
    complianceNotes.push('DE §12 UStG: 7% ermäßigter Steuersatz für Speisen, 19% Regelsatz für Getränke & Liefergebühr');
    if (isMehrwegOptIn) {
      complianceNotes.push('DE §33/34 VerpackG: Mehrwegbehälter gewählt (+1,50 € Pfand, rückzahlbar)');
    } else {
      complianceNotes.push('DE VerpackG: Einwegverpackung (Mehrwegoption verfügbar)');
    }
  } else if (country === 'FR') {
    foodRatePercent = 10.0; // French prepared meals TVA
    standardRatePercent = 20.0; // French standard TVA (drinks/delivery)
    complianceNotes.push('FR Art. 278-0 bis CGI: TVA 10% sur la restauration préparée, 20% sur les boissons alcoolisées et la livraison');
    if (cutleryOptedIn) {
      complianceNotes.push('FR Loi AGEC: Couverts demandés expressément par le client');
    } else {
      complianceNotes.push('FR Loi AGEC (Anti-gaspillage): Zéro couvert jetable fourni par défaut');
    }
  } else {
    // INTL / Generic EU
    foodRatePercent = 8.0;
    standardRatePercent = 20.0;
    complianceNotes.push('Standard Cross-Border EU VAT compliant invoicing');
  }

  // Inclusive VAT calculation: Tax = Gross - (Gross / (1 + rate / 100))
  const foodTaxAmount = Number((foodGross - foodGross / (1 + foodRatePercent / 100)).toFixed(2));
  const standardTaxAmount = Number(
    (standardGross - standardGross / (1 + standardRatePercent / 100)).toFixed(2)
  );
  const totalTax = Number((foodTaxAmount + standardTaxAmount).toFixed(2));
  const mehrwegDeposit = isMehrwegOptIn ? MEHRWEG_DEPOSIT_EUR : 0;

  const taxLabel =
    country === 'DE'
      ? `inkl. ${foodRatePercent}% & ${standardRatePercent}% MwSt.`
      : country === 'FR'
      ? `TVA incluse (${foodRatePercent}% & ${standardRatePercent}%)`
      : `Incl. ${foodRatePercent}% / ${standardRatePercent}% VAT`;

  return {
    country,
    foodRatePercent,
    foodTaxAmount,
    standardRatePercent,
    standardTaxAmount,
    totalTax,
    mehrwegDeposit,
    cutleryOptedIn,
    taxLabel,
    complianceNotes,
  };
}

/**
 * Validates and calculates discount amount for promo code
 */
export function calculatePromoDiscount(
  subtotal: number,
  deliveryFee: number,
  promoCodeInput?: string
): { discountAmount: number; adjustedDeliveryFee: number; message?: string; error?: string } {
  if (!promoCodeInput) {
    return { discountAmount: 0, adjustedDeliveryFee: deliveryFee };
  }

  const code = promoCodeInput.trim().toUpperCase();
  const rule = PROMO_CODES[code];

  if (!rule) {
    return { discountAmount: 0, adjustedDeliveryFee: deliveryFee, error: 'Invalid promotion code' };
  }

  if (subtotal < rule.minSpend) {
    return {
      discountAmount: 0,
      adjustedDeliveryFee: deliveryFee,
      error: `Minimum order of €${rule.minSpend.toFixed(2)} required for this promo`,
    };
  }

  let discountAmount = 0;
  let adjustedDeliveryFee = deliveryFee;

  if (rule.freeDelivery) {
    adjustedDeliveryFee = 0;
  }
  if (rule.discountPercent) {
    discountAmount = Number(((subtotal * rule.discountPercent) / 100).toFixed(2));
  }
  if (rule.discountFixed) {
    discountAmount = Math.min(subtotal, rule.discountFixed);
  }

  return {
    discountAmount,
    adjustedDeliveryFee,
    message: rule.label,
  };
}

/**
 * Formats a monetary number into locale-aware currency representation
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'EUR',
  lang: SupportedLanguage = 'en'
): string {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
  };

  const locale = localeMap[lang] || 'de-DE';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}
