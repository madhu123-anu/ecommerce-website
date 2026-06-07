/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, currency = 'USD', locale = 'en-US') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number compactly (e.g. 1200 → $1.2K)
 */
export function formatPriceCompact(amount, currency = 'USD') {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return formatPrice(amount, currency);
}

/**
 * Calculate discount percentage
 */
export function calcDiscountPercent(originalPrice, discountedPrice) {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export default formatPrice;
