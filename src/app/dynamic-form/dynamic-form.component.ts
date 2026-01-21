import { JsonPipe, NgComponentOutlet } from '@angular/common';
import { Component, computed, effect, inject, input, signal, Type } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { FormConfig, FormField } from '../models/form-config.model';
import { ControlType } from './field-components/base-field.component';
import { ErrorMessageRegistryService } from './field-components/error-message-registry.service';
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
  formValues = input<Record<string, unknown>>();
  private fb = inject(FormBuilder);
  private registry = inject(FieldComponentRegistryService);
  private errorMessageRegistry = inject(ErrorMessageRegistryService);
  
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

    // Watch for formValues changes and apply them when form is ready
    effect(() => {
      const values = this.formValues();
      const form = this.dynamicForm();
      const config = this.formConfig();
      // Only set values if form is built and config is available
      if (values && form && config && Object.keys(values).length > 0) {
        this.setFormValues(values);
      }
    });
  }

  buildForm(config: FormConfig): void {
    const formControls: { [key: string]: any } = {};

    // Create form controls based on the control type required by each component
    config.fields.forEach(field => {
      const componentType = this.getFieldComponentType(field);
      if (!componentType) {
        return;
      }

      // Get control type from registry instead of instantiating component
      const controlType = this.registry.getControlType(field.type);
      if (!controlType) {
        console.warn(`No control type registered for field type '${field.type}'. Defaulting to FormControl.`);
        formControls[field.name] = [null];
        return;
      }

      formControls[field.name] = this.createControlByType(controlType);
    });

    const newForm = this.fb.group(formControls);
    this.dynamicForm.set(newForm);
    
    // Set form values if provided, after form is built
    const values = this.formValues();
    if (values && Object.keys(values).length > 0) {
      this.setFormValues(values);
    }
  }

  /**
   * Creates a form control based on the control type
   */
  private createControlByType(controlType: ControlType): any {
    switch (controlType) {
      case 'control':
        return [null];
      case 'group':
        return this.fb.group({});
      case 'array':
        return this.fb.array([]);
      default:
        return [null];
    }
  }

  getFieldControl(fieldName: string): AbstractControl | null {
    const form = this.dynamicForm();
    return form?.get(fieldName) || null;
  }

  getFieldError(fieldName: string): string {
    const control = this.getFieldControl(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors as ValidationErrors;
    const config = this.formConfig();
    const field = config.fields.find(f => f.name === fieldName);
    const fieldLabel = this.getFieldLabel(field);

    // Try to get error message from registry for each error key
    const errorKeys = Object.keys(errors);
    for (const errorKey of errorKeys) {
      // Check if registry has a message for this error key
      const errorMessage = this.errorMessageRegistry.getErrorMessage(errorKey, errors, fieldLabel);
      if (errorMessage) {
        return errorMessage;
      }

      // Handle custom validator errors (fallback)
      const errorValue = errors[errorKey];
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

  /**
   * Set form values from a JSON object
   * Handles nested structures including FormArrays (subforms)
   */
  setFormValues(values: Record<string, unknown>): void {
    const form = this.dynamicForm();
    if (!form) {
      console.warn('Cannot set form values: form is not initialized');
      return;
    }

    const config = this.formConfig();
    if (!config) {
      console.warn('Cannot set form values: form config is not available');
      return;
    }

    try {
      // Build a structured value object that matches the form structure
      const formValues: Record<string, unknown> = {};
      
      config.fields.forEach(field => {
        const fieldValue = values[field.name];
        if (fieldValue === undefined || fieldValue === null) {
          return; // Skip undefined/null values
        }

        const controlType = this.registry.getControlType(field.type);
        if (!controlType) {
          formValues[field.name] = fieldValue;
          return;
        }

        // Handle different control types
        if (controlType === 'array') {
          // For FormArray (subforms), create FormGroups for each item
          if (Array.isArray(fieldValue)) {
            formValues[field.name] = fieldValue.map(item => {
              if (typeof item === 'object' && item !== null) {
                return item as Record<string, unknown>;
              }
              return {};
            });
          }
        } else if (controlType === 'group') {
          // For FormGroup, ensure it's an object
          if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
            formValues[field.name] = fieldValue as Record<string, unknown>;
          }
        } else {
          // For FormControl, use the value directly
          formValues[field.name] = fieldValue;
        }
      });

      // Use patchValue to set values (allows partial updates)
      form.patchValue(formValues, { emitEvent: false });
      
      // For FormArrays, we need to manually create and set the FormGroups
      config.fields.forEach(field => {
        const controlType = this.registry.getControlType(field.type);
        if (controlType === 'array' && values[field.name]) {
          const arrayValue = values[field.name];
          if (Array.isArray(arrayValue)) {
            const arrayControl = form.get(field.name) as FormArray;
            if (arrayControl) {
              // Clear existing items
              while (arrayControl.length > 0) {
                arrayControl.removeAt(0);
              }
              
              // Add new items
              arrayValue.forEach((item: unknown) => {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                  const itemObj = item as Record<string, unknown>;
                  const formGroup = this.createFormGroupForSubformItem(field, itemObj);
                  if (formGroup) {
                    arrayControl.push(formGroup);
                  }
                }
              });
            }
          }
        }
      });

      // Update validity after setting values
      form.updateValueAndValidity();
    } catch (error) {
      console.error('Error setting form values:', error);
    }
  }

  /**
   * Create a FormGroup for a subform item based on the field configuration
   */
  private createFormGroupForSubformItem(field: FormField, itemValue: Record<string, unknown>): FormGroup | null {
    // Get the subform config from the field config
    const fieldConfig = field.config as { formConfig?: FormConfig } | undefined;
    const subformConfig = fieldConfig?.formConfig;
    
    if (!subformConfig) {
      console.warn(`Cannot create FormGroup for subform item: no formConfig found for field '${field.name}'`);
      return null;
    }

    const formControls: { [key: string]: any } = {};
    
    subformConfig.fields.forEach(subField => {
      const subFieldValue = itemValue[subField.name];
      const controlType = this.registry.getControlType(subField.type);
      
      if (controlType === 'control') {
        formControls[subField.name] = [subFieldValue ?? null];
      } else if (controlType === 'group') {
        formControls[subField.name] = this.fb.group(subFieldValue && typeof subFieldValue === 'object' ? subFieldValue as Record<string, unknown> : {});
      } else if (controlType === 'array') {
        formControls[subField.name] = this.fb.array(Array.isArray(subFieldValue) ? subFieldValue : []);
      } else {
        formControls[subField.name] = [subFieldValue ?? null];
      }
    });

    return this.fb.group(formControls);
  }
}