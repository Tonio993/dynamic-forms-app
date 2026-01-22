import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Email input field component with built-in email validation.
 * 
 * This component renders a Material Design email input field with automatic
 * email format validation. It applies the Angular email validator along with
 * any custom validators provided in the field definition.
 * 
 * @example
 * ```typescript
 * {
 *   name: 'email',
 *   type: 'email',
 *   required: true,
 *   label: 'Email Address',
 *   placeholder: 'your.email@example.com'
 * }
 * ```
 * 
 * @public
 */
@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './email-input.html',
  styleUrls: ['./email-input.css']
})
export class EmailInputComponent extends BaseFieldComponent implements OnInit {

  /**
   * Initializes the component and applies validators to the form control.
   * 
   * This method sets up validation rules including:
   * - Required validator (if field is marked as required)
   * - Email format validator (always applied)
   * - Custom validators (if provided in field.validators)
   */
  ngOnInit(): void {
    const validators: ValidatorFn[] = [];
    const field = this.field();

    if (field.required === true) {
      validators.push(Validators.required);
    }

    validators.push(Validators.email);

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
