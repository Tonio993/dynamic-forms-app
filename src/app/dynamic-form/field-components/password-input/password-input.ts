import { Component, input, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormField } from '../../../models/form-config.model';
import { FieldComponentUtils } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Password input component configuration
 */
export interface PasswordInputConfig {
  minLength?: number;
  pattern?: string;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './password-input.html',
  styleUrls: ['./password-input.css']
})
export class PasswordInputComponent implements OnInit {
  readonly field = input.required<FormField>();
  readonly formGroup = input.required<FormGroup>();
  readonly formControl = input.required<FormControl>();
  readonly isInvalid = input.required<boolean>();
  readonly formId = input<string>('');

  readonly fieldId = FieldComponentUtils.createFieldId(this.formId, this.field);
  readonly placeholder = FieldComponentUtils.createPlaceholder(this.field);
  readonly required = FieldComponentUtils.createRequired(this.field);
  readonly label = FieldComponentUtils.createLabel(this.field);
  readonly ariaDescribedBy = FieldComponentUtils.createAriaDescribedBy(this.isInvalid, this.fieldId);
  readonly config = computed(() => (this.field().config || {}) as PasswordInputConfig);

  hidePassword = signal(true);

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
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

    // Component-specific validators
    if (config.minLength !== undefined) {
      validators.push(Validators.minLength(Number(config.minLength)));
    }
    if (config.pattern) {
      validators.push(Validators.pattern(String(config.pattern)));
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
