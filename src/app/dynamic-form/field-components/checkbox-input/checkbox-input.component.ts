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
  styleUrls: ['./checkbox-input.scss']
})
export class CheckboxInputComponent extends BaseFieldComponent implements OnInit {

  /**
   * Returns the initial value for checkbox form controls.
   * 
   * Checkboxes default to false instead of null to represent an unchecked state.
   * 
   * @returns false as the default initial value for checkboxes
   */
  override getInitialValue(): unknown {
    return false;
  }

  /**
   * Initializes the component and applies validators to the form control.
   * 
   * This method sets up validation rules including:
   * - Required validator (if field is marked as required)
   * - Custom validators (if provided in field.validators)
   * 
   * It also ensures the control value is set to false if it's currently null,
   * maintaining the default value even if the control was created before this component.
   */
  ngOnInit(): void {
    const control = this.formControl();
    
    if (control && control.value === null) {
      control.setValue(false, { emitEvent: false });
    }

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
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }
}
