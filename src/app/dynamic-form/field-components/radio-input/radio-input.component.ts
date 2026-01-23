import { Component, input, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { FormField } from '../../../models/form-config.model';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Configuration interface for radio input component.
 * 
 * @public
 */
export interface RadioInputConfig {
  /** Array of option strings to display as radio buttons */
  options?: string[];
}

/**
 * Radio button group input field component.
 * 
 * This component renders a Material Design radio button group where users can
 * select a single option from a list. It requires options to be provided in the
 * configuration.
 * 
 * @example
 * ```typescript
 * {
 *   name: 'gender',
 *   type: 'radio',
 *   required: false,
 *   label: 'Gender',
 *   config: {
 *     options: ['Male', 'Female', 'Other', 'Prefer not to say']
 *   }
 * }
 * ```
 * 
 * @public
 */
@Component({
  selector: 'app-radio-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './radio-input.html',
  styleUrls: ['./radio-input.scss']
})
export class RadioInputComponent extends BaseFieldComponent implements OnInit {
  /** Computed configuration object for this radio input */
  readonly config = computed(() => (this.field().config || {}) as RadioInputConfig);
  
  /** Computed array of options for the radio buttons */
  readonly options = computed(() => this.config().options || []);
  
  /**
   * Generates a unique ID for a radio button option.
   * 
   * @param option - The option string value
   * @returns Unique identifier for the radio button
   */
  optionId = (option: string) => `${this.fieldId()}-${option}`;

  /**
   * Initializes the component and applies validators to the form control.
   * 
   * This method validates that options are provided and sets up validation rules including:
   * - Required validator (if field is marked as required)
   * - Custom validators (if provided in field.validators)
   * 
   * If no options are provided, the component will not apply validators and will
   * effectively be non-functional.
   */
  ngOnInit(): void {
    const config = this.config();
    if (!config.options || !Array.isArray(config.options) || config.options.length === 0) {
      return;
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
      this.formControl().setValidators(validators);
      this.formControl().updateValueAndValidity();
    }
  }
}
