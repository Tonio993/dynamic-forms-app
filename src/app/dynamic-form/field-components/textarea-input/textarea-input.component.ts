import { Component, input, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '../../../models/form-config.model';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Configuration interface for textarea input component.
 * 
 * @public
 */
export interface TextareaInputConfig {
  /** Minimum allowed length for the textarea content */
  minLength?: number;
  
  /** Maximum allowed length for the textarea content */
  maxLength?: number;
  
  /** Number of visible text rows */
  rows?: number;
  
  /** Number of visible text columns (width) */
  cols?: number;
}

/**
 * Textarea input field component for multi-line text input.
 * 
 * This component renders a Material Design textarea field with support for
 * length validation and customizable dimensions. It's ideal for longer text
 * input such as descriptions, comments, or biographies.
 * 
 * @example
 * ```typescript
 * {
 *   name: 'bio',
 *   type: 'textarea',
 *   required: false,
 *   label: 'Biography',
 *   placeholder: 'Tell us about yourself...',
 *   config: {
 *     minLength: 10,
 *     maxLength: 500,
 *     rows: 5
 *   }
 * }
 * ```
 * 
 * @public
 */
@Component({
  selector: 'app-textarea-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './textarea-input.html',
  styleUrls: ['./textarea-input.scss']
})
export class TextareaInputComponent extends BaseFieldComponent implements OnInit {
  /** Computed configuration object for this textarea input */
  readonly config = computed(() => (this.field().config || {}) as TextareaInputConfig);

  /**
   * Initializes the component and applies validators to the form control.
   * 
   * This method sets up validation rules including:
   * - Required validator (if field is marked as required)
   * - MinLength validator (if minLength is specified in config)
   * - MaxLength validator (if maxLength is specified in config)
   * - Custom validators (if provided in field.validators)
   */
  ngOnInit(): void {
    const validators: ValidatorFn[] = [];
    const field = this.field();
    const config = this.config();

    if (field.required === true) {
      validators.push(Validators.required);
    }

    if (config.minLength !== undefined) {
      validators.push(Validators.minLength(Number(config.minLength)));
    }
    if (config.maxLength !== undefined) {
      validators.push(Validators.maxLength(Number(config.maxLength)));
    }

    if (field.validators) {
      if (Array.isArray(field.validators)) {
        validators.push(...field.validators);
      } else {
        validators.push(field.validators);
      }
    }

    if (validators.length > 0) {
      this.formControl().setValidators(validators);
      this.formControl().updateValueAndValidity();
    }
  }
}
