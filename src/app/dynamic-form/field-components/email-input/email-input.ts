import { Component, input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormField } from '../../../models/form-config.model';
import { FieldComponentUtils } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './email-input.html',
  styleUrls: ['./email-input.css']
})
export class EmailInputComponent implements OnInit {
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

  ngOnInit(): void {
    // Apply validators to the form control
    const validators: ValidatorFn[] = [];
    const field = this.field();

    // Required validator
    if (field.required === true) {
      validators.push(Validators.required);
    }

    // Email validator
    validators.push(Validators.email);

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
