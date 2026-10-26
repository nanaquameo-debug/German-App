import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceKm,
  estimateDeliveryMinutes,
  interpolatePosition,
  validateLuhn,
  aggregateDriverScore,
} from './delivery';

test('calculateDistanceKm returns valid positive distance', () => {
  const coordA = { x: 100, y: 100 };
  const coordB = { x: 400, y: 500 };
  const dist = calculateDistanceKm(coordA, coordB);
  assert.ok(dist > 0);
  assert.equal(dist >= 0.4, true);
});

test('estimateDeliveryMinutes accounts for transit and kitchen prep', () => {
  const { etaMinutes, transitMinutes } = estimateDeliveryMinutes(3.0, 1.2, 10, 20);
  assert.ok(transitMinutes >= 3);
  assert.equal(etaMinutes, 10 + transitMinutes);
});

test('interpolatePosition smoothly interpolates and computes bearing', () => {
  const start = { x: 0, y: 0 };
  const end = { x: 100, y: 0 };
  const mid = interpolatePosition(start, end, 0.5);

  assert.equal(mid.x, 50);
  assert.equal(mid.y, 0);
  // Heading East (dx > 0, dy = 0) => bearing 90 degrees
  assert.equal(mid.bearing, 90);
});

test('validateLuhn validates valid cards and rejects invalid sequences', () => {
  // Standard test card numbers (Luhn check)
  assert.equal(validateLuhn('4532015112830366'), true); // Visa test
  assert.equal(validateLuhn('4532015112830367'), false); // bad check digit
  assert.equal(validateLuhn('123'), false); // too short
});

test('aggregateDriverScore computes average and assigns appropriate badge', () => {
  const ratings = [5, 5, 5, 4, 5, 5, 5, 5, 5, 5];
  const stats = aggregateDriverScore(ratings);
  assert.equal(stats.averageRating, 4.9);
  assert.equal(stats.totalCount, 10);
  assert.equal(stats.badge, 'Elite Partner');

  const emptyStats = aggregateDriverScore([]);
  assert.equal(emptyStats.averageRating, 5.0);
  assert.equal(emptyStats.badge, 'Rising Star');
});
