import { ValidationErrors } from '@angular/forms';
import { ErrorMessageFunction } from './error-message-registry.service';

/**
 * Configuration for an error message registration
 */
export interface ErrorMessageConfig {
  /** The error key (e.g., 'required', 'email', 'min') */
  key: string;
  /** The function that generates the error message */
  messageFunction: ErrorMessageFunction;
}

/**
 * Centralized configuration for all error messages
 * To add a new error message, simply add a new entry to this array
 */
export const ERROR_MESSAGE_CONFIGS: ErrorMessageConfig[] = [
  {
    key: 'required',
    messageFunction: (errors: ValidationErrors, fieldLabel: string) => {
      return `${fieldLabel} is required`;
    }
  },
  {
    key: 'email',
    messageFunction: (errors: ValidationErrors, fieldLabel: string) => {
      return `Invalid email address`;
    }
  },
  {
    key: 'min',
    messageFunction: (errors: ValidationErrors, fieldLabel: string) => {
      const minValue = errors['min']?.min;
      return `Minimum value is ${minValue}`;
    }
  },
  {
    key: 'max',
    messageFunction: (errors: ValidationErrors, fieldLabel: string) => {
      const maxValue = errors['max']?.max;
      return `Maximum value is ${maxValue}`;
    }
  },
  {
    key: 'minlength',
    messageFunction: (errors: ValidationErrors, fieldLabel: string) => {
      const requiredLength = errors['minlength']?.requiredLength;
      return `Minimum length is ${requiredLength} characters`;
    }
  },
  {
    key: 'maxlength',
    messageFunction: (errors: ValidationErrors, fieldLabel: string) => {
      const requiredLength = errors['maxlength']?.requiredLength;
      return `Maximum length is ${requiredLength} characters`;
    }
  },
  {
    key: 'pattern',
    messageFunction: (errors: ValidationErrors, fieldLabel: string) => {
      return `Invalid format`;
    }
  },
  {
    key: 'notANumber',
    messageFunction: (errors: ValidationErrors, fieldLabel: string) => {
      return `Must be a valid number`;
    }
  }
];
