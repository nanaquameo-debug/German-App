export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Calculates Euclidean distance on map coordinate plane (scaled to kilometers)
 * 100 units on map canvas ~ 1.2 km in urban delivery radius
 */
export function calculateDistanceKm(coordA: Coordinate, coordB: Coordinate): number {
  const dx = coordA.x - coordB.x;
  const dy = coordA.y - coordB.y;
  const pixelDist = Math.sqrt(dx * dx + dy * dy);
  // Scale factor: 500 units ~ 4.5 km
  const km = (pixelDist / 500) * 4.5;
  return Number(Math.max(0.4, km).toFixed(1));
}

/**
 * Estimates delivery duration in minutes based on distance, traffic factor, and kitchen prep
 */
export function estimateDeliveryMinutes(
  distanceKm: number,
  trafficFactor: number = 1.15, // 1.0 (light) to 1.4 (rush hour)
  kitchenPrepMinutes: number = 12,
  averageCourierSpeedKmh: number = 22 // urban e-bike/scooter avg
): { etaMinutes: number; transitMinutes: number } {
  // Transit hours = distance / speed
  const transitHours = distanceKm / Math.max(10, averageCourierSpeedKmh);
  const transitMinutes = Math.ceil(transitHours * 60 * trafficFactor);
  const etaMinutes = kitchenPrepMinutes + transitMinutes;
  return {
    etaMinutes: Math.max(5, etaMinutes),
    transitMinutes: Math.max(3, transitMinutes),
  };
}

/**
 * Linear interpolation between two coordinates
 */
export function interpolatePosition(
  start: Coordinate,
  end: Coordinate,
  fraction: number
): { x: number; y: number; bearing: number } {
  const clampedFraction = Math.max(0, Math.min(1, fraction));
  const x = start.x + (end.x - start.x) * clampedFraction;
  const y = start.y + (end.y - start.y) * clampedFraction;

  // Bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  if (angleDeg < 0) angleDeg += 360;

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    bearing: Number(angleDeg.toFixed(1)),
  };
}

/**
 * Validates credit card number with Luhn algorithm
 */
export function validateLuhn(cardNumberStr: string): boolean {
  const sanitized = cardNumberStr.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Formats card number with spaces every 4 digits
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').substring(0, 16);
  const chunks = digits.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : digits;
}

/**
 * Driver rating calculation and badge evaluation
 */
export function aggregateDriverScore(ratings: number[]): {
  averageRating: number;
  totalCount: number;
  badge: 'Elite Partner' | 'Top Courier' | 'Rising Star' | 'Standard';
} {
  if (!ratings || ratings.length === 0) {
    return { averageRating: 5.0, totalCount: 0, badge: 'Rising Star' };
  }
  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
  const avg = Number((sum / ratings.length).toFixed(2));

  let badge: 'Elite Partner' | 'Top Courier' | 'Rising Star' | 'Standard' = 'Standard';
  if (avg >= 4.9 && ratings.length >= 10) {
    badge = 'Elite Partner';
  } else if (avg >= 4.7) {
    badge = 'Top Courier';
  } else if (ratings.length < 5) {
    badge = 'Rising Star';
  }

  return {
    averageRating: avg,
    totalCount: ratings.length,
    badge,
  };
}
