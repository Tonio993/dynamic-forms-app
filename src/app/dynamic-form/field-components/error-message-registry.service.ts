import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ERROR_MESSAGE_CONFIGS } from './error-message.config';

/**
 * Function type for generating error messages from validation errors.
 * 
 * @param errors - The full validation errors object from Angular forms
 * @param fieldLabel - The display label of the field (for use in error messages)
 * @returns The formatted error message string
 * 
 * @public
 */
export type ErrorMessageFunction = (errors: ValidationErrors, fieldLabel: string) => string;

/**
 * Service for managing common validation error messages.
 * 
 * Provides a centralized registry of error message functions for standard Angular
 * validators (required, email, min, max, etc.) and custom validators. Messages
 * are registered automatically on first access using lazy initialization from the
 * centralized configuration.
 * 
 * This service enables consistent error messaging across all field components
 * without requiring each component to implement its own error message logic.
 * 
 * @example
 * ```typescript
 * // Get an error message
 * const message = errorMessageRegistry.getErrorMessage('required', errors, 'Email');
 * // Returns: "Email is required"
 * ```
 * 
 * @public
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorMessageRegistryService {
  private readonly errorMessageMap = new Map<string, ErrorMessageFunction>();
  private initialized = false;

  /**
   * Gets the error message for a specific error key.
   * 
   * Automatically initializes the registry if it hasn't been initialized yet.
   * 
   * @param errorKey - The validation error key (e.g., 'required', 'email', 'min')
   * @param errors - The full validation errors object from the form control
   * @param fieldLabel - The display label of the field (for use in error messages)
   * @returns The error message string, or null if no message is registered for the key
   */
  getErrorMessage(errorKey: string, errors: ValidationErrors, fieldLabel: string): string | null {
    this.ensureInitialized();
    const messageFunction = this.errorMessageMap.get(errorKey);
    if (!messageFunction) {
      return null;
    }
    return messageFunction(errors, fieldLabel);
  }

  /**
   * Registers a custom error message function for a specific error key.
   * 
   * This allows extending the error message system with custom validators or
   * overriding default messages for specific error types.
   * 
   * @param errorKey - The validation error key to register
   * @param messageFunction - The function that generates the error message
   */
  register(errorKey: string, messageFunction: ErrorMessageFunction): void {
    this.errorMessageMap.set(errorKey, messageFunction);
  }

  /**
   * Checks if an error message is registered for a specific key.
   * 
   * Automatically initializes the registry if it hasn't been initialized yet.
   * 
   * @param errorKey - The error key to check
   * @returns True if a message function is registered, false otherwise
   */
  has(errorKey: string): boolean {
    this.ensureInitialized();
    return this.errorMessageMap.has(errorKey);
  }

  /**
   * Gets all registered error keys.
   * 
   * Automatically initializes the registry if it hasn't been initialized yet.
   * 
   * @returns Array of all registered error key strings
   */
  getRegisteredKeys(): string[] {
    this.ensureInitialized();
    return Array.from(this.errorMessageMap.keys());
  }

  /**
   * Clears all registered error messages.
   * 
   * Useful for testing or resetting the registry state.
   */
  clear(): void {
    this.errorMessageMap.clear();
  }

  /**
   * Ensures the registry is initialized before use.
   * 
   * Uses lazy initialization to register all error messages from the centralized
   * configuration on first access. This approach ensures messages are only
   * registered when needed.
   */
  private ensureInitialized(): void {
    if (this.initialized) {
      return;
    }

    ERROR_MESSAGE_CONFIGS.forEach(config => {
      this.register(config.key, config.messageFunction);
    });

    this.initialized = true;
  }
}
