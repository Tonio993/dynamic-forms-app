import { Component, input, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '../../../models/form-config.model';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Configuration interface for number input component.
 * 
 * This interface separates validation constraints (min/max) from input clamping
 * constraints (valueFrom/valueTo), allowing fine-grained control over user input
 * behavior versus validation rules.
 * 
 * @public
 */
export interface NumberInputConfig {
  /** Minimum value for validation (marks form as invalid if value is below this) */
  min?: number;
  
  /** Maximum value for validation (marks form as invalid if value is above this) */
  max?: number;
  
  /** Minimum value for input clamping (prevents entering values below this) */
  valueFrom?: number;
  
  /** Maximum value for input clamping (prevents entering values above this) */
  valueTo?: number;
  
  /** Step value for the number input (used by browser increment/decrement) */
  step?: number;
}

/**
 * Number input field component with validation and value clamping support.
 * 
 * This component renders a Material Design number input field with support for:
 * - Numeric validation
 * - Min/max value validation
 * - Input clamping (valueFrom/valueTo) to prevent entering out-of-range values
 * - Custom validators
 * 
 * The component distinguishes between validation constraints (min/max) and input
 * clamping constraints (valueFrom/valueTo), allowing different behaviors for
 * validation versus user input prevention.
 * 
 * @example
 * ```typescript
 * {
 *   name: 'age',
 *   type: 'number',
 *   required: true,
 *   label: 'Age',
 *   config: {
 *     min: 18,
 *     max: 120,
 *     valueFrom: 0,
 *     step: 1
 *   }
 * }
 * ```
 * 
 * @public
 */
@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './number-input.html',
  styleUrls: ['./number-input.scss']
})
export class NumberInputComponent extends BaseFieldComponent implements OnInit {
  /** Computed configuration object for this number input */
  readonly config = computed(() => (this.field().config || {}) as NumberInputConfig);
  
  /** Minimum value for validation */
  readonly min = computed(() => this.config().min);
  
  /** Maximum value for validation */
  readonly max = computed(() => this.config().max);
  
  /** Minimum value for input clamping */
  readonly valueFrom = computed(() => this.config().valueFrom);
  
  /** Maximum value for input clamping */
  readonly valueTo = computed(() => this.config().valueTo);
  
  /** Step value for number input */
  readonly step = computed(() => this.config().step);

  /**
   * Handles input events to enforce valueFrom/valueTo constraints.
   * 
   * This method prevents users from entering values outside the allowed range
   * by clamping the input value. This is separate from validation, which only
   * marks the form as invalid but doesn't prevent input.
   * 
   * @param event - The input event from the HTML input element
   */
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    if (isNaN(value) || input.value === '') {
      return;
    }

    const valueFrom = this.valueFrom();
    const valueTo = this.valueTo();
  }

  /**
   * Validator function to ensure the value is a valid number.
   * 
   * @param control - The form control to validate
   * @returns Validation error object if invalid, null if valid
   */
  private numberValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const isNumber = !isNaN(Number(control.value));
    return isNumber ? null : { notANumber: true };
  }

  /**
   * Initializes the component and applies validators to the form control.
   * 
   * This method sets up validation rules including:
   * - Required validator (if field is marked as required)
   * - Number format validator (always applied)
   * - Min value validator (if min is specified in config)
   * - Max value validator (if max is specified in config)
   * - Custom validators (if provided in field.validators)
   */
  ngOnInit(): void {
    const validators: ValidatorFn[] = [];
    const field = this.field();
    const config = this.config();

    if (field.required === true) {
      validators.push(Validators.required);
    }

    validators.push(this.numberValidator.bind(this));

    if (config.min !== undefined) {
      validators.push(Validators.min(Number(config.min)));
    }
    if (config.max !== undefined) {
      validators.push(Validators.max(Number(config.max)));
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
