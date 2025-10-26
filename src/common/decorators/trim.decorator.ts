import { Transform } from 'class-transformer';

/**
 * Trim whitespace from string inputs
 * Helps prevent injection attacks and normalize data
 */
export function Trim() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  });
}

/**
 * Sanitize HTML entities to prevent XSS
 * Converts <, >, &, ", ' to their HTML entity equivalents
 */
export function SanitizeHtml() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    return value;
  });
}
