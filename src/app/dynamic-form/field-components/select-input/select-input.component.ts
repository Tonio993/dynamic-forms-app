import { Component, input, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormField } from '../../../models/form-config.model';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Configuration interface for select input component.
 * 
 * @public
 */
export interface SelectInputConfig {
  /** Array of option strings to display in the dropdown */
  options?: string[];
  
  /** Whether multiple selections are allowed */
  multiple?: boolean;
}

/**
 * Select dropdown input field component.
 * 
 * This component renders a Material Design select dropdown with support for
 * single or multiple selection. It requires options to be provided in the
 * configuration.
 * 
 * @example
 * ```typescript
 * {
 *   name: 'country',
 *   type: 'select',
 *   required: true,
 *   label: 'Country',
 *   config: {
 *     options: ['United States', 'Canada', 'United Kingdom'],
 *     multiple: false
 *   }
 * }
 * ```
 * 
 * @public
 */
@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './select-input.html',
  styleUrls: ['./select-input.css']
})
export class SelectInputComponent extends BaseFieldComponent implements OnInit {
  /** Computed configuration object for this select input */
  readonly config = computed(() => (this.field().config || {}) as SelectInputConfig);
  
  /** Computed array of options for the select dropdown */
  readonly options = computed(() => this.config().options || []);
  
  /** Computed flag indicating whether multiple selection is enabled */
  readonly multiple = computed(() => this.config().multiple ?? false);

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
