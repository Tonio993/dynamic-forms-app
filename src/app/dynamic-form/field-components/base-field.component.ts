import { Component, computed, input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { FormField } from '../../models/form-config.model';

/**
 * Control type that a field component uses
 */
export type ControlType = 'control' | 'group' | 'array';

/**
 * Base class for field components providing common functionality
 * Each component must implement getControlType() to define the type of form control it uses
 */
@Component({template: ''})
export class BaseFieldComponent {

  readonly field = input.required<FormField>();
  readonly formGroup = input.required<FormGroup>();
  readonly formControl = input.required<AbstractControl>();
  readonly isInvalid = input.required<boolean>();
  readonly formId = input<string>('');

  /**
   * Creates a computed signal for the field ID
   */
  readonly fieldId = computed(() => {
    const id = this.formId() || 'field';
    return `${id}-${this.field().name}`;
  });

  /**
   * Creates a computed signal for the placeholder
   */
  readonly placeholder = computed(() => this.field().placeholder || '');

  /**
   * Creates a computed signal for the required status
   */
  readonly required = computed(() => this.field().required ?? false);

  /**
   * Creates a computed signal for the label
   */
  readonly label = computed(() => this.field().label || this.field().name);

  /**
   * Creates a computed signal for aria-describedby
   */
  readonly ariaDescribedBy = computed(() => this.isInvalid() ? `${this.fieldId()}-error` : null);

  /**
   * Returns the type of form control this component uses.
   * Defaults to 'control' (FormControl). Override in child components if different control type is needed.
   * @returns 'control' for FormControl, 'group' for FormGroup, 'array' for FormArray
   */
  getControlType(): ControlType {
    return 'control';
  }

}
