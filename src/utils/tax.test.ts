import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderTaxes, calculatePromoDiscount, formatCurrency } from './tax';
import { CartItem } from '../types';

const mockItems: CartItem[] = [
  {
    cartItemId: 'item-1',
    menuItem: {
      id: 'dish-1',
      name: 'Classic Smash Burger',
      nameDe: 'Klassischer Smash Burger',
      nameFr: 'Smash Burger Classique',
      description: 'Beef patty with cheddar',
      descriptionDe: 'Rindfleisch mit Cheddar',
      descriptionFr: 'Steak haché et cheddar',
      price: 10.0,
      imageUrl: '',
      category: 'Burgers',
      taxCategory: 'food_standard',
      dietaryTags: ['Halal'],
    },
    restaurantId: 'rest-1',
    restaurantName: 'Burger Meister',
    quantity: 2,
    selectedOptions: [],
    itemSubtotal: 20.0,
  },
  {
    cartItemId: 'item-2',
    menuItem: {
      id: 'drink-1',
      name: 'Craft IPA Beer',
      nameDe: 'Craft IPA Bier',
      nameFr: 'Bière Artisanale IPA',
      description: 'Craft beer 330ml',
      descriptionDe: 'Handwerksbier 330ml',
      descriptionFr: 'Bière artisanale 330ml',
      price: 5.0,
      imageUrl: '',
      category: 'Drinks',
      taxCategory: 'beverage_alcohol',
      dietaryTags: ['Vegan'],
    },
    restaurantId: 'rest-1',
    restaurantName: 'Burger Meister',
    quantity: 1,
    selectedOptions: [],
    itemSubtotal: 5.0,
  },
];

test('German (DE) tax calculation applies 7% to food and 19% to alcohol and delivery fee', () => {
  const deliveryFee = 3.5;
  const result = calculateOrderTaxes(mockItems, deliveryFee, 'DE', true, false);

  assert.equal(result.country, 'DE');
  assert.equal(result.foodRatePercent, 7.0);
  assert.equal(result.standardRatePercent, 19.0);
  assert.equal(result.mehrwegDeposit, 1.5); // Mehrweg opted in
  assert.equal(result.cutleryOptedIn, false);

  // Food gross = 20.0, tax = 20 - 20 / 1.07 = 1.308 -> 1.31
  assert.equal(result.foodTaxAmount, 1.31);
  // Standard gross = 5.0 (beer) + 3.50 (delivery) = 8.50, tax = 8.5 - 8.5 / 1.19 = 1.357 -> 1.36
  assert.equal(result.standardTaxAmount, 1.36);
  assert.equal(result.totalTax, 2.67);
  assert.ok(result.complianceNotes.some((n) => n.includes('VerpackG')));
});

test('French (FR) tax calculation applies 10% to prepared food and 20% to alcohol/delivery with AGEC note', () => {
  const deliveryFee = 2.9;
  const result = calculateOrderTaxes(mockItems, deliveryFee, 'FR', false, true);

  assert.equal(result.country, 'FR');
  assert.equal(result.foodRatePercent, 10.0);
  assert.equal(result.standardRatePercent, 20.0);
  assert.equal(result.cutleryOptedIn, true);
  assert.equal(result.mehrwegDeposit, 0);

  // Food gross = 20.0, tax = 20 - 20 / 1.10 = 1.82
  assert.equal(result.foodTaxAmount, 1.82);
  // Standard gross = 5.0 + 2.9 = 7.9, tax = 7.9 - 7.9 / 1.20 = 1.32
  assert.equal(result.standardTaxAmount, 1.32);
  assert.ok(result.complianceNotes.some((n) => n.includes('AGEC')));
});

test('calculatePromoDiscount validates min spend and computes correct discounts', () => {
  // WILLKOMMEN15 requires €20 min spend
  const failMinSpend = calculatePromoDiscount(15.0, 3.0, 'WILLKOMMEN15');
  assert.equal(failMinSpend.discountAmount, 0);
  assert.ok(failMinSpend.error?.includes('Minimum order'));

  // Passed min spend for WILLKOMMEN15
  const validPercent = calculatePromoDiscount(40.0, 3.0, 'WILLKOMMEN15');
  assert.equal(validPercent.discountAmount, 6.0); // 15% of 40 = 6.0
  assert.equal(validPercent.adjustedDeliveryFee, 3.0);

  // FREEDELIVERY zeroes delivery fee
  const freeDel = calculatePromoDiscount(25.0, 4.5, 'FREEDELIVERY');
  assert.equal(freeDel.adjustedDeliveryFee, 0);
});

test('formatCurrency handles EUR and localized output', () => {
  const formattedDe = formatCurrency(24.5, 'EUR', 'de');
  assert.ok(formattedDe.includes('24,50') || formattedDe.includes('€'));
});
