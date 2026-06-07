import { format, formatDistanceToNow, isValid, parseISO, addDays } from 'date-fns';

/**
 * Format a date to a readable string
 * @param {string|Date} date
 * @param {string} formatStr - date-fns format string
 * @returns {string}
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, formatStr);
  } catch {
    return '';
  }
}

/**
 * Format a date with time
 */
export function formatDateTime(date) {
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
}

/**
 * Format relative time (e.g. "2 days ago")
 */
export function formatRelative(date) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Get estimated delivery date (N business days from now)
 */
export function getEstimatedDelivery(orderDate, days = 5) {
  try {
    const d = typeof orderDate === 'string' ? parseISO(orderDate) : (orderDate || new Date());
    return format(addDays(d, days), 'EEEE, MMMM dd, yyyy');
  } catch {
    return 'Within 5-7 business days';
  }
}

export default formatDate;
