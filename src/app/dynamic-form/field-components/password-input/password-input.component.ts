import { Component, input, computed, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormField } from '../../../models/form-config.model';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Configuration interface for password input component.
 * 
 * @public
 */
export interface PasswordInputConfig {
  /** Minimum length required for the password */
  minLength?: number;
  
  /** Regular expression pattern that the password must match */
  pattern?: string;
  
  /** Whether the password must contain at least one uppercase letter */
  requireUppercase?: boolean;
  
  /** Whether the password must contain at least one lowercase letter */
  requireLowercase?: boolean;
  
  /** Whether the password must contain at least one number */
  requireNumber?: boolean;
  
  /** Whether the password must contain at least one special character */
  requireSpecialChar?: boolean;
}

/**
 * Password input field component with visibility toggle and validation support.
 * 
 * This component renders a Material Design password input field with:
 * - Password visibility toggle (show/hide)
 * - Minimum length validation
 * - Pattern matching validation
 * - Custom validators
 * 
 * The component includes a toggle button that allows users to show or hide
 * the password text for better usability.
 * 
 * @example
 * ```typescript
 * {
 *   name: 'password',
 *   type: 'password',
 *   required: true,
 *   label: 'Password',
 *   config: {
 *     minLength: 8,
 *     pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'
 *   }
 * }
 * ```
 * 
 * @public
 */
@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './password-input.html',
  styleUrls: ['./password-input.css']
})
export class PasswordInputComponent extends BaseFieldComponent implements OnInit {
  /** Computed configuration object for this password input */
  readonly config = computed(() => (this.field().config || {}) as PasswordInputConfig);

  /** Signal controlling password visibility (true = hidden, false = visible) */
  hidePassword = signal(true);

  /**
   * Toggles the password visibility state.
   * 
   * Switches between showing and hiding the password text to improve
   * user experience when entering passwords.
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  /**
   * Initializes the component and applies validators to the form control.
   * 
   * This method sets up validation rules including:
   * - Required validator (if field is marked as required)
   * - MinLength validator (if minLength is specified in config)
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
