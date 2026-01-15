import { Component, input, signal, computed, effect, inject, Type } from '@angular/core';
import { JsonPipe, NgComponentOutlet } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { FormConfig, FormField } from '../models/form-config.model';
import { FieldComponentRegistryService } from './field-components/field-component-registry.service';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    NgComponentOutlet,
    MatButtonModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent {
  formConfig = input.required<FormConfig>();
  private fb = inject(FormBuilder);
  private registry = inject(FieldComponentRegistryService);
  
  // Generate unique form ID to prevent duplicate IDs when multiple forms are rendered
  readonly formId = `form-${Math.random().toString(36).substring(2, 11)}`;
  
  dynamicForm = signal<FormGroup | null>(null);
  formData = signal<Record<string, unknown>>({});

  // Computed values
  hasFormData = computed(() => {
    const data = this.formData();
    return data && Object.keys(data).length > 0;
  });

  isFormValid = computed(() => {
    const form = this.dynamicForm();
    return form?.valid ?? false;
  });

  constructor() {
    // Build form when config changes
    effect(() => {
      const config = this.formConfig();
      if (config) {
        this.buildForm(config);
      }
    });
  }

  buildForm(config: FormConfig): void {
    const formControls: { [key: string]: any } = {};

    // Create form controls without validators - components will apply their own validators
    config.fields.forEach(field => {
      formControls[field.name] = [null];
    });

    this.dynamicForm.set(this.fb.group(formControls));
  }

  getFieldControl(fieldName: string): FormControl | null {
    const form = this.dynamicForm();
    const control = form?.get(fieldName);
    return control instanceof FormControl ? control : null;
  }

  getFieldError(fieldName: string): string {
    const control = this.getFieldControl(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    const config = this.formConfig();
    const field = config.fields.find(f => f.name === fieldName);

    if (errors['required']) {
      return `${this.getFieldLabel(field)} is required`;
    }
    if (errors['min']) {
      return `Minimum value is ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `Maximum value is ${errors['max'].max}`;
    }
    if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['pattern']) {
      return `Invalid format`;
    }
    if (errors['email']) {
      return `Invalid email address`;
    }
    if (errors['notANumber']) {
      return `Must be a valid number`;
    }

    // Handle custom validator errors
    const errorKeys = Object.keys(errors);
    for (const key of errorKeys) {
      const errorValue = errors[key];
      // If error value is a string, use it directly
      if (typeof errorValue === 'string') {
        return errorValue;
      }
      // If error value is an object with a message property
      if (errorValue && typeof errorValue === 'object' && 'message' in errorValue) {
        return String(errorValue.message);
      }
    }

    return '';
  }

  getFieldLabel(field: FormField | undefined): string {
    return field?.label || field?.name || '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.getFieldControl(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldComponentType(field: FormField): Type<unknown> | null {
    // Validate that select and radio have options in config
    if (field.type === 'select' || field.type === 'radio') {
      const config = field.config || {};
      if (!config['options'] || !Array.isArray(config['options']) || config['options'].length === 0) {
        console.warn(`Field '${field.name}' of type '${field.type}' requires options in config but none were provided.`);
        return null;
      }
    }

    // Get component from the registry service based on field type
    const component = this.registry.get(field.type);
    
    if (!component) {
      console.warn(`No component registered for field type '${field.type}'. Make sure the component is registered in FieldComponentRegistryService.`);
      return null;
    }

    return component;
  }

  onSubmit(): void {
    const form = this.dynamicForm();
    if (form?.valid) {
      this.formData.set(form.value);
      console.log('Form submitted:', form.value);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(form?.controls ?? {}).forEach(key => {
        form?.get(key)?.markAsTouched();
      });
    }
  }

  resetForm(): void {
    const form = this.dynamicForm();
    form?.reset();
    this.formData.set({});
  }

  getFormValue(): any {
    return this.dynamicForm()?.value;
  }
}