/**
 * Common regex patterns for validation
 */

export const REGEX = {
  // Email validation (RFC 5322 simplified)
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Phone numbers
  PHONE_VN: /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/,
  PHONE_INTERNATIONAL: /^\+?[1-9]\d{1,14}$/,

  // Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PASSWORD_MEDIUM: /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,

  // Username: alphanumeric with underscores, 3-20 chars
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,

  // URL validation
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  URL_HTTPS: /^https:\/\/([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,

  // Numbers only
  DIGITS_ONLY: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/,

  // Alphanumeric
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACE: /^[a-zA-Z0-9\s]+$/,

  // Date formats
  DATE_YYYY_MM_DD: /^\d{4}-\d{2}-\d{2}$/,
  DATE_DD_MM_YYYY: /^\d{2}\/\d{2}\/\d{4}$/,

  // Japanese specific
  HIRAGANA: /^[\u3040-\u309F]+$/,
  KATAKANA: /^[\u30A0-\u30FF]+$/,
  KANJI: /^[\u4E00-\u9FAF]+$/,
  JAPANESE_ALL: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,

  // Common text patterns
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // File extensions
  IMAGE_EXTENSION: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  DOCUMENT_EXTENSION: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i,

  // HTML/Script detection (for XSS prevention)
  HTML_TAGS: /<[^>]*>/g,
  SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,

  // Whitespace
  LEADING_TRAILING_SPACES: /^\s+|\s+$/g,
  MULTIPLE_SPACES: /\s{2,}/g,
} as const

/**
 * Helper functions for regex validation
 */
export const validate = {
  email: (value: string) => REGEX.EMAIL.test(value),
  phoneVN: (value: string) => REGEX.PHONE_VN.test(value),
  phoneInternational: (value: string) => REGEX.PHONE_INTERNATIONAL.test(value),
  passwordStrong: (value: string) => REGEX.PASSWORD_STRONG.test(value),
  passwordMedium: (value: string) => REGEX.PASSWORD_MEDIUM.test(value),
  username: (value: string) => REGEX.USERNAME.test(value),
  url: (value: string) => REGEX.URL.test(value),
  urlHttps: (value: string) => REGEX.URL_HTTPS.test(value),
  digitsOnly: (value: string) => REGEX.DIGITS_ONLY.test(value),
  decimal: (value: string) => REGEX.DECIMAL.test(value),
  alphanumeric: (value: string) => REGEX.ALPHANUMERIC.test(value),
  dateYYYYMMDD: (value: string) => REGEX.DATE_YYYY_MM_DD.test(value),
  dateDDMMYYYY: (value: string) => REGEX.DATE_DD_MM_YYYY.test(value),
  hiragana: (value: string) => REGEX.HIRAGANA.test(value),
  katakana: (value: string) => REGEX.KATAKANA.test(value),
  japanese: (value: string) => REGEX.JAPANESE_ALL.test(value),
  slug: (value: string) => REGEX.SLUG.test(value),
  imageFile: (value: string) => REGEX.IMAGE_EXTENSION.test(value),
  documentFile: (value: string) => REGEX.DOCUMENT_EXTENSION.test(value),
} as const

/**
 * Sanitization helpers
 */
export const sanitize = {
  removeHtmlTags: (value: string) => value.replace(REGEX.HTML_TAGS, ''),
  trimSpaces: (value: string) => value.replace(REGEX.LEADING_TRAILING_SPACES, ''),
  normalizeSpaces: (value: string) => value.replace(REGEX.MULTIPLE_SPACES, ' '),
} as const
