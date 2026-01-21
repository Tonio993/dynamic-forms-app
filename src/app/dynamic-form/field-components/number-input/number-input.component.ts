import { Component, input, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '../../../models/form-config.model';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Number input component configuration
 */
export interface NumberInputConfig {
  min?: number; // Minimum value for validation
  max?: number; // Maximum value for validation
  valueFrom?: number; // Minimum value for clamping (prevents entering values below this)
  valueTo?: number; // Maximum value for clamping (prevents entering values above this)
  step?: number;
}

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './number-input.html',
  styleUrls: ['./number-input.css']
})
export class NumberInputComponent extends BaseFieldComponent implements OnInit {
  readonly config = computed(() => (this.field().config || {}) as NumberInputConfig);
  
  // Validation constraints (for validators)
  readonly min = computed(() => this.config().min);
  readonly max = computed(() => this.config().max);
  
  // Clamping constraints (for input clamping)
  readonly valueFrom = computed(() => this.config().valueFrom);
  readonly valueTo = computed(() => this.config().valueTo);
  
  readonly step = computed(() => this.config().step);

  /**
   * Handle input events to enforce valueFrom/valueTo constraints
   * Prevents users from entering values outside the allowed range (clamping)
   */
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    // If value is NaN or empty, allow it (for clearing the field)
    if (isNaN(value) || input.value === '') {
      return;
    }

    const valueFrom = this.valueFrom();
    const valueTo = this.valueTo();
  }

  /**
   * Number validator to ensure value is a valid number
   */
  private numberValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const isNumber = !isNaN(Number(control.value));
    return isNumber ? null : { notANumber: true };
  }

  ngOnInit(): void {
    // Apply validators to the form control
    const validators: ValidatorFn[] = [];
    const field = this.field();
    const config = this.config();

    // Required validator
    if (field.required === true) {
      validators.push(Validators.required);
    }

    // Always add number validator
    validators.push(this.numberValidator.bind(this));

    // Component-specific validators
    if (config.min !== undefined) {
      validators.push(Validators.min(Number(config.min)));
    }
    if (config.max !== undefined) {
      validators.push(Validators.max(Number(config.max)));
    }

    // Custom validators from field
    if (field.validators) {
      if (Array.isArray(field.validators)) {
        validators.push(...field.validators);
      } else {
        validators.push(field.validators);
      }
    }

    // Apply validators to the control
    if (validators.length > 0) {
      this.formControl().setValidators(validators);
      this.formControl().updateValueAndValidity();
    }
  }
}
