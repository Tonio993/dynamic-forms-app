import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ERROR_MESSAGE_CONFIGS } from './error-message.config';

/**
 * Function type for generating error messages from validation errors
 */
export type ErrorMessageFunction = (errors: ValidationErrors, fieldLabel: string) => string;

/**
 * Service for managing common validation error messages
 * Provides a centralized registry of error message functions for standard Angular validators
 * Messages are registered automatically on first access
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorMessageRegistryService {
  private readonly errorMessageMap = new Map<string, ErrorMessageFunction>();
  private initialized = false;

  /**
   * Get error message for a specific error key
   * Automatically initializes registry if not already initialized
   * @param errorKey The validation error key (e.g., 'required', 'email', 'min')
   * @param errors The full validation errors object
   * @param fieldLabel The label of the field (for use in error messages)
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
   * Register a custom error message function for a specific error key
   * @param errorKey The validation error key
   * @param messageFunction The function that generates the error message
   */
  register(errorKey: string, messageFunction: ErrorMessageFunction): void {
    this.errorMessageMap.set(errorKey, messageFunction);
  }

  /**
   * Check if an error message is registered for a specific key
   * Automatically initializes registry if not already initialized
   */
  has(errorKey: string): boolean {
    this.ensureInitialized();
    return this.errorMessageMap.has(errorKey);
  }

  /**
   * Get all registered error keys
   * Automatically initializes registry if not already initialized
   */
  getRegisteredKeys(): string[] {
    this.ensureInitialized();
    return Array.from(this.errorMessageMap.keys());
  }

  /**
   * Clear all registered error messages (useful for testing)
   */
  clear(): void {
    this.errorMessageMap.clear();
  }

  /**
   * Ensure the registry is initialized before use
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
