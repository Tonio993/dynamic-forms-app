import { Component, input, computed, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormField } from '../../../models/form-config.model';

@Component({
  selector: 'app-checkbox-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatCheckboxModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './checkbox-input.html',
  styleUrls: ['./checkbox-input.css']
})
export class CheckboxInputComponent {
  field = input.required<FormField>();
  formGroup = input.required<FormGroup>();
  isInvalid = input.required<boolean>();
  formId = input<string>('');

  fieldId = computed(() => {
    const id = this.formId() || 'field';
    return `${id}-${this.field().name}`;
  });
  label = computed(() => this.field().label || this.field().name);
  placeholder = computed(() => this.field().placeholder || '');
}
