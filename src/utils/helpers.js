/**
 * Convert a full name to school email format.
 * FIX: original used .replace(' ', '.') which only replaced the FIRST space.
 * "Sarah Jane Smith" → "sarah.jane.smith@school.edu" (correct)
 */
export const nameToEmail = (name) =>
  `${name.toLowerCase().replace(/\s+/g, '.')}@school.edu`;

/**
 * Sanitize user input — strip characters that could cause XSS in emails / audit logs.
 */
export const sanitize = (str = '') =>
  str.replace(/[<>'"&]/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
    '&': '&amp;',
  }[c]));

/**
 * Generate a random ID with a given prefix.
 * e.g. genId('APT') → 'APT-83712'
 */
export const genId = (prefix) =>
  `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

/**
 * Format ISO date string to a readable local date.
 */
export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : '—';

/**
 * Format ISO date to time string.
 */
export const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  }) : '—';
