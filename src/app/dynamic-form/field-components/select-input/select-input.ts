import { Component, input, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormField } from '../../../models/form-config.model';
import { BaseFieldComponent } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Select input component configuration
 */
export interface SelectInputConfig {
  options?: string[];
  multiple?: boolean;
}

@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './select-input.html',
  styleUrls: ['./select-input.css']
})
export class SelectInputComponent extends BaseFieldComponent implements OnInit {
  readonly config = computed(() => (this.field().config || {}) as SelectInputConfig);
  readonly options = computed(() => this.config().options || []);
  readonly multiple = computed(() => this.config().multiple ?? false);

  ngOnInit(): void {
    // Validate that options are provided
    const config = this.config();
    if (!config.options || !Array.isArray(config.options) || config.options.length === 0) {
      console.warn(`SelectInputComponent: Field '${this.field().name}' requires options in config but none were provided.`);
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
