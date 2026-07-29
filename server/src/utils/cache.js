/**
 * In-Memory TTL Cache
 * Simple Map-based cache with expiration for development.
 *
 * NOTE: Process-local only. Replace with Redis for production.
 */

class MemoryCache {
  constructor() {
    /** @type {Map<string, { value: any, expiresAt: number }>} */
    this.store = new Map();
    // Purge expired entries every 30s
    this.purgeInterval = setInterval(() => this.purge(), 30_000);
    this.purgeInterval.unref();
  }

  /**
   * Get a value from cache.
   * @param {string} key
   * @returns {any|null} Cached value or null if expired/missing
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a value in cache with TTL.
   * @param {string} key
   * @param {any} value
   * @param {number} ttlMs - Time to live in milliseconds (default: 60s)
   */
  set(key, value, ttlMs = 60_000) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Delete a specific key.
   * @param {string} key
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Delete all keys matching a prefix.
   * @param {string} prefix
   */
  deleteByPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Check if a key exists and is not expired.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Get or set pattern: returns cached value, or calls factory and caches result.
   * @param {string} key
   * @param {() => Promise<any>} factory - Async function to produce the value
   * @param {number} ttlMs
   * @returns {Promise<any>}
   */
  async getOrSet(key, factory, ttlMs = 60_000) {
    const cached = this.get(key);
    if (cached !== null) return cached;

    const value = await factory();
    this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Remove all expired entries.
   */
  purge() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear entire cache.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Destroy cache and stop purge interval.
   */
  destroy() {
    clearInterval(this.purgeInterval);
    this.store.clear();
  }
}

// Singleton instance
const cache = new MemoryCache();

export default cache;
