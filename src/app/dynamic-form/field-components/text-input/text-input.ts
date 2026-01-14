import { Component, input, computed, effect, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '../../../models/form-config.model';
import { FieldComponentUtils } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Text input component configuration
 */
export interface TextInputConfig {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './text-input.html',
  styleUrls: ['./text-input.css']
})
export class TextInputComponent implements OnInit {
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
  readonly config = computed(() => (this.field().config || {}) as TextInputConfig);

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
    if (config.maxLength !== undefined) {
      validators.push(Validators.maxLength(Number(config.maxLength)));
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
