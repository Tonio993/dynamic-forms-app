import { Component, input, computed, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormField } from '../../../models/form-config.model';
import { FieldComponentRegistryService } from '../field-component-registry.service';

@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './email-input.html',
  styleUrls: ['./email-input.css']
})
export class EmailInputComponent {
  field = input.required<FormField>();
  formGroup = input.required<FormGroup>();
  isInvalid = input.required<boolean>();
  formId = input<string>('');

  private registry = inject(FieldComponentRegistryService);

  constructor() {
    // Self-register this component
    this.registry.register('email', EmailInputComponent);
  }

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
