import { Component, input, computed, signal, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormField } from '../../../models/form-config.model';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './password-input.html',
  styleUrls: ['./password-input.css']
})
export class PasswordInputComponent {
  field = input.required<FormField>();
  formGroup = input.required<FormGroup>();
  isInvalid = input.required<boolean>();
  formId = input<string>('');

  hidePassword = signal(true);

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

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }
}
