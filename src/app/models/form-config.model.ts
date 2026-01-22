import { ValidatorFn } from '@angular/forms';

/**
 * Supported field types for dynamic forms.
 * Each type corresponds to a specific input component that handles the field rendering and validation.
 * 
 * @public
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
  | 'radio'
  | 'subform';

/**
 * Configuration interface for a single form field.
 * 
 * The `config` property contains component-specific configuration options.
 * Each field component defines its own configuration interface that extends this base structure.
 * 
 * @example
 * ```typescript
 * const field: FormField = {
 *   name: 'email',
 *   type: 'email',
 *   required: true,
 *   label: 'Email Address',
 *   placeholder: 'Enter your email',
 *   config: {
 *     minLength: 5,
 *     maxLength: 100
 *   }
 * };
 * ```
 * 
 * @public
 */
export interface FormField {
  /** Unique identifier for the field within the form */
  name: string;
  
  /** Type of input component to render for this field */
  type: FieldType;
  
  /** Whether the field is required. Defaults to false if not provided */
  required?: boolean;
  
  /** Component-specific configuration options. Structure depends on the field type */
  config?: Record<string, unknown>;
  
  /** Custom validators to apply to the field. Can be a single validator or an array */
  validators?: ValidatorFn | ValidatorFn[];
  
  /** Display label for the field. Defaults to the field name if not provided */
  label?: string;
  
  /** Placeholder text to display in the input when empty */
  placeholder?: string;
}

/**
 * Complete form configuration that defines the structure and behavior of a dynamic form.
 * 
 * This interface serves as the blueprint for generating forms at runtime. The dynamic form
 * component uses this configuration to create the appropriate form controls and render
 * the corresponding input components.
 * 
 * @example
 * ```typescript
 * const formConfig: FormConfig = {
 *   name: 'User Registration',
 *   fields: [
 *     { name: 'firstName', type: 'text', required: true, label: 'First Name' },
 *     { name: 'email', type: 'email', required: true, label: 'Email' },
 *     { name: 'age', type: 'number', required: false, label: 'Age' }
 *   ]
 * };
 * ```
 * 
 * @public
 */
export interface FormConfig {
  /** Display name of the form */
  name: string;
  
  /** Array of field configurations that define the form structure */
  fields: FormField[];
}
