import { Component, input, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { FormField } from '../../../models/form-config.model';
import { FieldComponentUtils } from '../base-field.component';
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
export class RadioInputComponent implements OnInit {
  readonly field = input.required<FormField>();
  readonly formGroup = input.required<FormGroup>();
  readonly formControl = input.required<FormControl>();
  readonly isInvalid = input.required<boolean>();
  readonly formId = input<string>('');

  readonly fieldId = FieldComponentUtils.createFieldId(this.formId, this.field);
  readonly required = FieldComponentUtils.createRequired(this.field);
  readonly label = FieldComponentUtils.createLabel(this.field);
  readonly config = computed(() => (this.field().config || {}) as RadioInputConfig);
  readonly options = computed(() => this.config().options || []);
  
  optionId = (option: string) => `${this.fieldId()}-${option}`;

  ngOnInit(): void {
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
