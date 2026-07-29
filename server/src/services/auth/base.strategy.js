/**
 * Base Auth Strategy
 *
 * All authentication strategies must extend this class.
 * Provides the contract that the auth system expects.
 */

export class BaseAuthStrategy {
  /**
   * @param {string} methodType - Unique identifier matching auth_configs.auth_method
   */
  constructor(methodType) {
    if (new.target === BaseAuthStrategy) {
      throw new Error("BaseAuthStrategy cannot be instantiated directly");
    }
    this.methodType = methodType;
  }

  /**
   * Authenticate a user with this method.
   * Must be implemented by subclasses.
   *
   * @param {object} payload - Request body / auth data
   * @param {object} config - Method-specific config from auth_configs.config
   * @returns {Promise<{ user: object, isNewUser?: boolean }>}
   * @throws {AuthError} on failure
   */
  // eslint-disable-next-line no-unused-vars
  async authenticate(payload, config) {
    throw new Error(`authenticate() not implemented for ${this.methodType}`);
  }
}

/**
 * Auth-specific error with status code and error code.
 */
export class AuthError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Machine-readable error code
   * @param {object} [extra] - Additional data (e.g., retry_after, remaining_attempts)
   */
  constructor(message, statusCode = 401, code = "AUTH_ERROR", extra = {}) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.code = code;
    this.extra = extra;
  }
}
