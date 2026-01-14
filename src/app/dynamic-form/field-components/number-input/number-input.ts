import { Component, input, computed } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '../../../models/form-config.model';
import { FieldComponentUtils } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';

/**
 * Number input component configuration
 */
export interface NumberInputConfig {
  min?: number;
  max?: number;
  step?: number;
}

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './number-input.html',
  styleUrls: ['./number-input.css']
})
export class NumberInputComponent {
  readonly field = input.required<FormField>();
  readonly formGroup = input.required<FormGroup>();
  readonly isInvalid = input.required<boolean>();
  readonly formId = input<string>('');

  readonly fieldId = FieldComponentUtils.createFieldId(this.formId, this.field);
  readonly placeholder = FieldComponentUtils.createPlaceholder(this.field);
  readonly required = FieldComponentUtils.createRequired(this.field);
  readonly label = FieldComponentUtils.createLabel(this.field);
  readonly ariaDescribedBy = FieldComponentUtils.createAriaDescribedBy(this.isInvalid, this.fieldId);
  readonly config = computed(() => (this.field().config || {}) as NumberInputConfig);
  readonly min = computed(() => this.config().min);
  readonly max = computed(() => this.config().max);
  readonly step = computed(() => this.config().step);

  /**
   * Handle input events to enforce min/max constraints
   * Prevents users from entering values outside the allowed range
   */
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    // If value is NaN or empty, allow it (for clearing the field)
    if (isNaN(value) || input.value === '') {
      return;
    }

    const minValue = this.min();
    const maxValue = this.max();

    // Clamp value to min if it's below minimum
    if (minValue !== undefined && value < minValue) {
      input.value = minValue.toString();
      const control = this.formGroup().get(this.field().name);
      if (control) {
        control.setValue(minValue, { emitEvent: true });
      }
      return;
    }

    // Clamp value to max if it's above maximum
    if (maxValue !== undefined && value > maxValue) {
      input.value = maxValue.toString();
      const control = this.formGroup().get(this.field().name);
      if (control) {
        control.setValue(maxValue, { emitEvent: true });
      }
      return;
    }
  }
}
