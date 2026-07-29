/**
 * Auth Strategy Registry
 *
 * Central registry that maps method names to their strategy implementations.
 * Adding a new auth provider = create a new strategy file + register it here.
 */

import { PasswordStrategy } from "./password.strategy.js";
import { OtpStrategy } from "./otp.strategy.js";
import { SocialStrategy } from "./social.strategy.js";

class AuthStrategyRegistry {
  constructor() {
    /** @type {Map<string, import('./base.strategy.js').BaseAuthStrategy>} */
    this.strategies = new Map();
  }

  /**
   * Register a strategy instance.
   * @param {import('./base.strategy.js').BaseAuthStrategy} strategy
   */
  register(strategy) {
    this.strategies.set(strategy.methodType, strategy);
  }

  /**
   * Get strategy by method type.
   * @param {string} methodType
   * @returns {import('./base.strategy.js').BaseAuthStrategy | undefined}
   */
  get(methodType) {
    return this.strategies.get(methodType);
  }

  /**
   * Check if a strategy exists.
   * @param {string} methodType
   * @returns {boolean}
   */
  has(methodType) {
    return this.strategies.has(methodType);
  }

  /**
   * Get all registered method types.
   * @returns {string[]}
   */
  getRegisteredMethods() {
    return Array.from(this.strategies.keys());
  }
}

// Create and populate the registry
const registry = new AuthStrategyRegistry();

registry.register(new PasswordStrategy());
registry.register(new OtpStrategy());

// Social strategies — one instance per provider
registry.register(new SocialStrategy("google"));
registry.register(new SocialStrategy("facebook"));
registry.register(new SocialStrategy("x"));

export default registry;
