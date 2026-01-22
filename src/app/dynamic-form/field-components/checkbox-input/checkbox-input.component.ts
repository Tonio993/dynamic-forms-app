import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Checkbox input field component for boolean values.
 * 
 * This component renders a Material Design checkbox field. It's typically used
 * for boolean values such as accepting terms and conditions, subscribing to
 * newsletters, or enabling/disabling features.
 * 
 * @example
 * ```typescript
 * {
 *   name: 'newsletter',
 *   type: 'checkbox',
 *   required: false,
 *   label: 'Subscribe to Newsletter'
 * }
 * ```
 * 
 * @public
 */
@Component({
  selector: 'app-checkbox-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatCheckboxModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './checkbox-input.html',
  styleUrls: ['./checkbox-input.css']
})
export class CheckboxInputComponent extends BaseFieldComponent implements OnInit {

  /**
   * Initializes the component and applies validators to the form control.
   * 
   * This method sets up validation rules including:
   * - Required validator (if field is marked as required)
   * - Custom validators (if provided in field.validators)
   */
  ngOnInit(): void {
    const validators: ValidatorFn[] = [];
    const field = this.field();

    if (field.required === true) {
      validators.push(Validators.required);
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
