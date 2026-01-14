import { Component, input, computed, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormField } from '../../../models/form-config.model';

@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './select-input.html',
  styleUrls: ['./select-input.css']
})
export class SelectInputComponent {
  field = input.required<FormField>();
  formGroup = input.required<FormGroup>();
  isInvalid = input.required<boolean>();
  formId = input<string>('');

  fieldId = computed(() => {
    const id = this.formId() || 'field';
    return `${id}-${this.field().name}`;
  });
  required = computed(() => this.field().required);
  label = computed(() => this.field().label || this.field().name);
  options = computed(() => this.field().options || []);
  ariaDescribedBy = computed(() => 
    this.isInvalid() ? `${this.fieldId()}-error` : null
  );
}
