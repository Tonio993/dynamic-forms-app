import { Component, input, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { FormField } from '../../../models/form-config.model';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Radio input component configuration
 */
export interface RadioInputConfig {
  options?: string[];
}

@Component({
  selector: 'app-radio-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './radio-input.html',
  styleUrls: ['./radio-input.css']
})
export class RadioInputComponent extends BaseFieldComponent implements OnInit {
  readonly config = computed(() => (this.field().config || {}) as RadioInputConfig);
  readonly options = computed(() => this.config().options || []);
  
  optionId = (option: string) => `${this.fieldId()}-${option}`;

  ngOnInit(): void {
    // Validate that options are provided
    const config = this.config();
    if (!config.options || !Array.isArray(config.options) || config.options.length === 0) {
      return;
    }

    // Apply validators to the form control
    const validators: ValidatorFn[] = [];
    const field = this.field();

    // Required validator
    if (field.required === true) {
      validators.push(Validators.required);
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
