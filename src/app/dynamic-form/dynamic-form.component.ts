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
  private static formIdCounter = 0;
  readonly formId = `form-${++DynamicFormComponent.formIdCounter}-${Date.now()}`;
  
  dynamicForm = signal<FormGroup | null>(null);
  formData = signal<Record<string, unknown>>({});
  private formValuesApplied = signal<boolean>(false);
  private lastFormValuesHash = signal<string>('');

  // Computed values
  hasFormData = computed(() => {
    const data = this.formData();
    return Object.keys(data).length > 0;
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
        // Reset formValuesApplied when form is rebuilt
        this.formValuesApplied.set(false);
      }
    });

    // Watch for formValues changes and apply them when form is ready
    // Only apply when formValues input actually changes, not on every form update
    effect(() => {
      const values = this.formValues();
      const form = this.dynamicForm();
      const config = this.formConfig();
      
      if (!values || !form || !config || Object.keys(values).length === 0) {
        return;
      }

      // Create a hash of the formValues to detect actual changes to the input
      const valuesHash = JSON.stringify(values);
      const lastHash = this.lastFormValuesHash();
      
      // Only apply if:
      // 1. formValues input actually changed (different hash)
      // 2. OR form was just built and values haven't been applied yet
      const formJustBuilt = !this.formValuesApplied();
      const valuesChanged = valuesHash !== lastHash;
      
      if (valuesChanged || formJustBuilt) {
        this.setFormValues(values);
        this.formValuesApplied.set(true);
        this.lastFormValuesHash.set(valuesHash);
      }
    });
  }

  buildForm(config: FormConfig): void {
    const formControls: Record<string, FormControl | FormGroup | FormArray> = {};

    // Create form controls based on the control type required by each component
    for (const field of config.fields) {
      const componentType = this.getFieldComponentType(field);
      if (!componentType) {
        continue;
      }

      // Get control type from registry instead of instantiating component
      const controlType = this.registry.getControlType(field.type);
      if (!controlType) {
        formControls[field.name] = this.fb.control(null);
        continue;
      }

      formControls[field.name] = this.createControlByType(controlType);
    }

    const newForm = this.fb.group(formControls);
    this.dynamicForm.set(newForm);
    
    // Reset formValuesApplied flag when form is rebuilt
    this.formValuesApplied.set(false);
  }

  /**
   * Creates a form control based on the control type
   */
  private createControlByType(controlType: ControlType): FormControl | FormGroup | FormArray {
    switch (controlType) {
      case 'control':
        return this.fb.control(null);
      case 'group':
        return this.fb.group({});
      case 'array':
        return this.fb.array([]);
      default:
        return this.fb.control(null);
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
    return this.registry.get(field.type);
  }

  onSubmit(): void {
    const form = this.dynamicForm();
    if (form?.valid) {
      this.formData.set(form.value);
    } else {
      // Mark all fields as touched to show validation errors
      const controls = form?.controls;
      if (controls) {
        for (const key of Object.keys(controls)) {
          form.get(key)?.markAsTouched();
        }
      }
    }
  }

  resetForm(): void {
    const form = this.dynamicForm();
    form?.reset();
    this.formData.set({});
  }

  getFormValue(): Record<string, unknown> | null {
    return this.dynamicForm()?.value ?? null;
  }

  /**
   * Set form values from a JSON object
   * Handles nested structures including FormArrays (subforms)
   */
  setFormValues(values: Record<string, unknown>): void {
    const form = this.dynamicForm();
    if (!form) {
      return;
    }

    const config = this.formConfig();
    if (!config) {
      return;
    }

    try {
      // Build a structured value object that matches the form structure
      const formValues: Record<string, unknown> = {};
      
      for (const field of config.fields) {
        const fieldValue = values[field.name];
        if (fieldValue === undefined || fieldValue === null) {
          continue; // Skip undefined/null values
        }

        const controlType = this.registry.getControlType(field.type);
        if (!controlType) {
          formValues[field.name] = fieldValue;
          continue;
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
      }

      // Use patchValue to set values (allows partial updates)
      form.patchValue(formValues, { emitEvent: false });
      
      // For FormArrays, we need to manually create and set the FormGroups
      // Only rebuild if the array is empty or has different length (initial load)
      for (const field of config.fields) {
        const controlType = this.registry.getControlType(field.type);
        if (controlType === 'array' && values[field.name]) {
          const arrayValue = values[field.name];
          if (Array.isArray(arrayValue)) {
            const arrayControl = form.get(field.name) as FormArray;
            if (arrayControl) {
              // Only rebuild if array is empty or length differs (initial load scenario)
              // This preserves user's drag-and-drop reordering
              if (arrayControl.length === 0 || arrayControl.length !== arrayValue.length) {
                // Clear existing items more efficiently
                arrayControl.clear();
                
                // Add new items
                for (const item of arrayValue) {
                  if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    const formGroup = this.createFormGroupForSubformItem(field, item as Record<string, unknown>);
                    if (formGroup) {
                      arrayControl.push(formGroup);
                    }
                  }
                }
              } else {
                // Array already has items with same length - just patch values to preserve order
                // This allows drag-and-drop reordering to persist
                const currentValues = arrayControl.value;
                const newValues = arrayValue;
                
                // Only patch if values actually differ (to avoid unnecessary updates)
                if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
                  // Patch values while preserving the order of FormGroups
                  for (let i = 0; i < Math.min(arrayControl.length, newValues.length); i++) {
                    const itemValue = newValues[i];
                    if (typeof itemValue === 'object' && itemValue !== null && !Array.isArray(itemValue)) {
                      const formGroup = arrayControl.at(i) as FormGroup;
                      if (formGroup) {
                        formGroup.patchValue(itemValue as Record<string, unknown>, { emitEvent: false });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Update validity after setting values
      form.updateValueAndValidity();
    } catch (error) {
      // Silently handle errors - form values may be partially set
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
      return null;
    }

    const formControls: Record<string, FormControl | FormGroup | FormArray> = {};
    
    for (const subField of subformConfig.fields) {
      const subFieldValue = itemValue[subField.name];
      const controlType = this.registry.getControlType(subField.type);
      
      if (controlType === 'control') {
        formControls[subField.name] = this.fb.control(subFieldValue ?? null);
      } else if (controlType === 'group') {
        const groupValue = subFieldValue && typeof subFieldValue === 'object' && !Array.isArray(subFieldValue)
          ? subFieldValue as Record<string, unknown>
          : {};
        formControls[subField.name] = this.fb.group(groupValue);
      } else if (controlType === 'array') {
        formControls[subField.name] = this.fb.array(Array.isArray(subFieldValue) ? subFieldValue : []);
      } else {
        formControls[subField.name] = this.fb.control(subFieldValue ?? null);
      }
    }

    return this.fb.group(formControls);
  }
}