import { Component, computed, input } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { FormField } from '../../models/form-config.model';

/**
 * Defines the type of Angular form control that a field component uses.
 * 
 * - `'control'`: Uses FormControl for simple single-value inputs (text, email, number, etc.)
 * - `'group'`: Uses FormGroup for nested object structures
 * - `'array'`: Uses FormArray for dynamic lists of items (subforms)
 * 
 * @public
 */
export type ControlType = 'control' | 'group' | 'array';

/**
 * Abstract base class for all field components in the dynamic form system.
 * 
 * This class provides common functionality and computed properties that all field components
 * need, such as field ID generation, label resolution, and validation state management.
 * 
 * Each concrete field component must:
 * 1. Extend this base class
 * 2. Override `getControlType()` if it uses a control type other than 'control'
 * 3. Implement the component template and styling
 * 4. Apply validators in `ngOnInit()` if needed
 * 
 * @example
 * ```typescript
 * @Component({...})
 * export class TextInputComponent extends BaseFieldComponent {
 *   override getControlType(): ControlType {
 *     return 'control';
 *   }
 * }
 * ```
 * 
 * @public
 */
@Component({template: ''})
export class BaseFieldComponent {
  /** Field configuration containing type, validation rules, and display options */
  readonly field = input.required<FormField>();
  
  /** Parent form group that contains this field's control */
  readonly formGroup = input.required<FormGroup>();
  
  /** The form control instance for this field (FormControl, FormGroup, or FormArray) */
  readonly formControl = input.required<AbstractControl>();
  
  /** Whether the field currently has validation errors */
  readonly isInvalid = input.required<boolean>();
  
  /** Unique identifier for the form instance, used to generate unique field IDs */
  readonly formId = input<string>('');

  /**
   * Computed unique identifier for this field.
   * 
   * Generated as `{formId}-{fieldName}` to ensure uniqueness when multiple forms
   * are rendered on the same page. Used for HTML element IDs and ARIA attributes.
   * 
   * @returns Unique field identifier string
   */
  readonly fieldId = computed(() => {
    const id = this.formId() || 'field';
    return `${id}-${this.field().name}`;
  });

  /**
   * Computed placeholder text for the input field.
   * 
   * @returns Placeholder string from field config, or empty string if not provided
   */
  readonly placeholder = computed(() => {
    return this.field().placeholder || '';
  });

  /**
   * Computed required status of the field.
   * 
   * @returns True if the field is marked as required, false otherwise
   */
  readonly required = computed(() => {
    return this.field().required ?? false;
  });

  /**
   * Computed display label for the field.
   * 
   * Falls back to the field name if no explicit label is provided in the configuration.
   * 
   * @returns Display label string
   */
  readonly label = computed(() => {
    return this.field().label || this.field().name;
  });

  /**
   * Computed ARIA described-by attribute value.
   * 
   * Points to the error message element when the field is invalid, providing
   * accessibility support for screen readers.
   * 
   * @returns Error message element ID if invalid, null otherwise
   */
  readonly ariaDescribedBy = computed(() => {
    return this.isInvalid() ? `${this.fieldId()}-error` : null;
  });

  /**
   * Returns the type of form control this component uses.
   * 
   * This method is used by the dynamic form component to determine which type of
   * Angular form control to create (FormControl, FormGroup, or FormArray).
   * 
   * Child components should override this method if they use a control type other
   * than the default 'control'.
   * 
   * @returns The control type: 'control' for FormControl, 'group' for FormGroup, 'array' for FormArray
   * 
   * @example
   * ```typescript
   * // For a subform component that uses FormArray
   * override getControlType(): ControlType {
   *   return 'array';
   * }
   * ```
   */
  getControlType(): ControlType {
    return 'control';
  }

  /**
   * Returns the initial value for the form control.
   * 
   * This method allows components to specify a default initial value when the
   * form control is created. The dynamic form component uses this value when
   * creating the FormControl if no explicit value is provided.
   * 
   * Child components should override this method if they need a specific initial
   * value other than null. For example, checkbox components typically default to false.
   * 
   * @returns The initial value for the form control, or null if no default is needed
   * 
   * @example
   * ```typescript
   * // For a checkbox component that defaults to false
   * override getInitialValue(): unknown {
   *   return false;
   * }
   * ```
   */
  getInitialValue(): unknown {
    return null;
  }
}
