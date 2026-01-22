import { Component, input, computed, effect, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '../../../models/form-config.model';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Configuration interface for text input component.
 * 
 * @public
 */
export interface TextInputConfig {
  /** Minimum allowed length for the text input */
  minLength?: number;
  
  /** Maximum allowed length for the text input */
  maxLength?: number;
  
  /** Regular expression pattern that the input must match */
  pattern?: string;
}

/**
 * Text input field component for single-line text input.
 * 
 * This component renders a Material Design text input field with support for
 * length validation and pattern matching. It applies validators based on the
 * field configuration and custom validators provided in the field definition.
 * 
 * @example
 * ```typescript
 * {
 *   name: 'firstName',
 *   type: 'text',
 *   required: true,
 *   label: 'First Name',
 *   config: {
 *     minLength: 2,
 *     maxLength: 50,
 *     pattern: '^[A-Za-z]+$'
 *   }
 * }
 * ```
 * 
 * @public
 */
@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './text-input.html',
  styleUrls: ['./text-input.css']
})
export class TextInputComponent extends BaseFieldComponent implements OnInit {
  /** Computed configuration object for this text input */
  readonly config = computed(() => (this.field().config || {}) as TextInputConfig);

  /**
   * Initializes the component and applies validators to the form control.
   * 
   * This method sets up validation rules including:
   * - Required validator (if field is marked as required)
   * - MinLength validator (if minLength is specified in config)
   * - MaxLength validator (if maxLength is specified in config)
   * - Pattern validator (if pattern is specified in config)
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
    if (config.pattern) {
      validators.push(Validators.pattern(String(config.pattern)));
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
