import { Component, input, computed, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '../../../models/form-config.model';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './text-input.html',
  styleUrls: ['./text-input.css']
})
export class TextInputComponent {
  field = input.required<FormField>();
  formGroup = input.required<FormGroup>();
  isInvalid = input.required<boolean>();
  formId = input<string>('');

  fieldId = computed(() => {
    const id = this.formId() || 'field';
    return `${id}-${this.field().name}`;
  });
  placeholder = computed(() => this.field().placeholder || '');
  required = computed(() => this.field().required);
  label = computed(() => this.field().label || this.field().name);
  ariaDescribedBy = computed(() => 
    this.isInvalid() ? `${this.fieldId()}-error` : null
  );
}
