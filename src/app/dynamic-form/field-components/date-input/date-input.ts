import { Component, input, computed, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormField } from '../../../models/form-config.model';

@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './date-input.html',
  styleUrls: ['./date-input.css']
})
export class DateInputComponent {
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
  ariaDescribedBy = computed(() => 
    this.isInvalid() ? `${this.fieldId()}-error` : null
  );
}
