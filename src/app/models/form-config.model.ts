import { ValidatorFn } from '@angular/forms';

/**
 * Supported field types for dynamic forms
 */
export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'date' 
  | 'password' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio';

/**
 * Form field configuration
 * The config field contains component-specific configuration.
 * Each field component defines its own config interface.
 */
export interface FormField {
  name: string;
  type: FieldType;
  required?: boolean; // Optional: defaults to false if not provided
  config?: Record<string, unknown>; // Component-specific configuration
  validators?: ValidatorFn | ValidatorFn[]; // Custom validators to apply to the field
  label?: string; // Display label (defaults to name if not provided)
  placeholder?: string;
}

/**
 * Complete form configuration
 */
export interface FormConfig {
  name: string;
  fields: FormField[];
}
