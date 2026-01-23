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

/**
 * Main dynamic form component that renders forms based on configuration.
 * 
 * This component accepts a `FormConfig` object and automatically generates the
 * appropriate form structure, including form controls and field components. It
 * handles form validation, error display, and value management.
 * 
 * The component uses Angular's `NgComponentOutlet` to dynamically render field
 * components based on the field type, ensuring complete decoupling between the
 * form structure and the field component implementations.
 * 
 * @example
 * ```typescript
 * const config: FormConfig = {
 *   name: 'User Form',
 *   fields: [
 *     { name: 'email', type: 'email', required: true, label: 'Email' }
 *   ]
 * };
 * ```
 * 
 * ```html
 * <app-dynamic-form [formConfig]="config"></app-dynamic-form>
 * ```
 * 
 * @public
 */
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
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent {
  /** Required form configuration that defines the form structure */
  formConfig = input.required<FormConfig>();
  
  /** Optional initial form values to pre-fill the form */
  formValues = input<Record<string, unknown>>();
  
  private fb = inject(FormBuilder);
  private registry = inject(FieldComponentRegistryService);
  private errorMessageRegistry = inject(ErrorMessageRegistryService);
  
  private static formIdCounter = 0;
  
  /** Unique identifier for this form instance, used to generate unique field IDs */
  readonly formId = `form-${++DynamicFormComponent.formIdCounter}-${Date.now()}`;
  
  /** Signal containing the reactive form group instance */
  dynamicForm = signal<FormGroup | null>(null);
  
  /** Signal containing the submitted form data */
  formData = signal<Record<string, unknown>>({});
  
  /** Signal containing form validation errors when submit is attempted with invalid form */
  formErrors = signal<Record<string, ValidationErrors>>({});
  
  /** Tracks whether initial form values have been applied */
  private formValuesApplied = signal<boolean>(false);
  
  /** Hash of the last applied form values, used to detect actual changes */
  private lastFormValuesHash = signal<string>('');

  /**
   * Computed signal indicating whether the form has submitted data.
   * 
   * @returns True if form data exists and has at least one property
   */
  hasFormData = computed(() => {
    const data = this.formData();
    return Object.keys(data).length > 0;
  });

  /**
   * Computed signal indicating whether the form has validation errors.
   * 
   * @returns True if form errors exist and have at least one property
   */
  hasFormErrors = computed(() => {
    const errors = this.formErrors();
    return Object.keys(errors).length > 0;
  });

  /**
   * Computed signal indicating whether the form is currently valid.
   * 
   * @returns True if the form is valid, false otherwise
   */
  isFormValid = computed(() => {
    const form = this.dynamicForm();
    return form?.valid ?? false;
  });

  constructor() {
    effect(() => {
      const config = this.formConfig();
      if (config) {
        this.buildForm(config);
        this.formValuesApplied.set(false);
      }
    });

    effect(() => {
      const values = this.formValues();
      const form = this.dynamicForm();
      const config = this.formConfig();
      
      if (!values || !form || !config || Object.keys(values).length === 0) {
        return;
      }

      const valuesHash = JSON.stringify(values);
      const lastHash = this.lastFormValuesHash();
      
      const formJustBuilt = !this.formValuesApplied();
      const valuesChanged = valuesHash !== lastHash;
      
      if (valuesChanged || formJustBuilt) {
        this.setFormValues(values);
        this.formValuesApplied.set(true);
        this.lastFormValuesHash.set(valuesHash);
      }
    });
  }

  /**
   * Builds the reactive form structure from the provided configuration.
   * 
   * This method creates the appropriate Angular form controls (FormControl, FormGroup, or FormArray)
   * based on the control type required by each field component. The control type is determined
   * by querying the field component registry.
   * 
   * @param config - The form configuration object
   */
  buildForm(config: FormConfig): void {
    const formControls: Record<string, AbstractControl> = {};

    for (const field of config.fields) {
      const componentType = this.getFieldComponentType(field);
      if (!componentType) {
        continue;
      }

      const controlType = this.registry.getControlType(field.type);
      if (!controlType) {
        formControls[field.name] = this.fb.control(null);
        continue;
      }

      const initialValue = this.registry.getInitialValue(field.type);
      formControls[field.name] = this.createControlByType(controlType, initialValue);
    }

    const newForm = this.fb.group(formControls);
    this.dynamicForm.set(newForm);
    
    this.formValuesApplied.set(false);
  }

  /**
   * Creates a form control instance based on the specified control type.
   * 
   * @param controlType - The type of control to create ('control', 'group', or 'array')
   * @param initialValue - Optional initial value for the control (only used for 'control' type)
   * @returns A new FormControl, FormGroup, or FormArray instance
   */
  private createControlByType(controlType: ControlType, initialValue?: unknown): AbstractControl {
    switch (controlType) {
      case 'control':
        return this.fb.control(initialValue !== undefined ? initialValue : null);
      case 'group':
        return this.fb.group({});
      case 'array':
        return this.fb.array([]);
      default:
        return this.fb.control(initialValue !== undefined ? initialValue : null);
    }
  }

  /**
   * Retrieves the form control for a specific field by name.
   * 
   * @param fieldName - The name of the field
   * @returns The AbstractControl instance, or null if not found
   */
  getFieldControl(fieldName: string): AbstractControl | null {
    const form = this.dynamicForm();
    return form?.get(fieldName) || null;
  }

  /**
   * Gets the error message for a field's validation errors.
   * 
   * This method attempts to retrieve error messages from the error message registry first.
   * If no registered message is found, it falls back to checking for string error values
   * or error objects with a 'message' property.
   * 
   * @param fieldName - The name of the field
   * @returns The error message string, or empty string if no error
   */
  getFieldError(fieldName: string): string {
    const control = this.getFieldControl(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors as ValidationErrors;
    const config = this.formConfig();
    const field = config.fields.find(f => f.name === fieldName);
    const fieldLabel = this.getFieldLabel(field);

    const errorKeys = Object.keys(errors);
    for (const errorKey of errorKeys) {
      const errorMessage = this.errorMessageRegistry.getErrorMessage(errorKey, errors, fieldLabel);
      if (errorMessage) {
        return errorMessage;
      }

      const errorValue = errors[errorKey];
      if (typeof errorValue === 'string') {
        return errorValue;
      }
      if (errorValue && typeof errorValue === 'object' && 'message' in errorValue) {
        return String(errorValue.message);
      }
    }

    return '';
  }

  /**
   * Gets the display label for a field.
   * 
   * @param field - The field configuration, or undefined
   * @returns The field label, name, or empty string
   */
  getFieldLabel(field: FormField | undefined): string {
    return field?.label || field?.name || '';
  }

  /**
   * Checks if a field is invalid and has been touched.
   * 
   * @param fieldName - The name of the field
   * @returns True if the field is invalid and touched, false otherwise
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.getFieldControl(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Gets the component type for a field from the registry.
   * 
   * @param field - The field configuration
   * @returns The component class, or null if not found
   */
  getFieldComponentType(field: FormField): Type<unknown> | null {
    return this.registry.get(field.type);
  }

  /**
   * Handles form submission.
   * 
   * If the form is valid, the form data is stored in the `formData` signal.
   * If invalid, all fields are marked as touched to display validation errors,
   * and validation errors are collected and stored in the `formErrors` signal.
   * Only fields with actual validation errors are included in the errors object.
   */
  onSubmit(): void {
    const form = this.dynamicForm();
    if (form?.valid) {
      this.formData.set(form.value);
      this.formErrors.set({});
    } else {
      const controls = form?.controls;
      const errors: Record<string, ValidationErrors> = {};
      
      if (controls) {
        for (const key of Object.keys(controls)) {
          const control = form.get(key);
          if (control && control.errors && Object.keys(control.errors).length > 0) {
            control.markAsTouched();
            errors[key] = control.errors;
          } else if (control) {
            control.markAsTouched();
          }
        }
      }
      
      this.formErrors.set(errors);
      this.formData.set({});
    }
  }

  /**
   * Resets the form to its initial state and clears submitted data and errors.
   */
  resetForm(): void {
    const form = this.dynamicForm();
    form?.reset();
    this.formData.set({});
    this.formErrors.set({});
  }

  /**
   * Computed signal for the current form value.
   * 
   * This signal automatically updates whenever the form value changes,
   * providing reactive access to the form's current state.
   * 
   * @returns The form value object, or null if form is not initialized
   */
  readonly formValue = computed(() => {
    return this.dynamicForm()?.value ?? null;
  });

  /**
   * Gets the current form value.
   * 
   * @deprecated Use formValue signal instead for better reactivity
   * @returns The form value object, or null if form is not initialized
   */
  getFormValue(): Record<string, unknown> | null {
    return this.formValue();
  }

  /**
   * Sets form values from a JSON object.
   * 
   * This method handles nested structures including FormArrays (subforms). It intelligently
   * preserves FormArray order when the array already has items with the same length, allowing
   * drag-and-drop reordering to persist. Only rebuilds arrays when they are empty or have
   * different lengths (initial load scenario).
   * 
   * @param values - Object containing field names as keys and their values
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
      const formValues: Record<string, unknown> = {};
      
      for (const field of config.fields) {
        const fieldValue = values[field.name];
        if (fieldValue === undefined || fieldValue === null) {
          continue;
        }

        const controlType = this.registry.getControlType(field.type);
        if (!controlType) {
          formValues[field.name] = fieldValue;
          continue;
        }

        if (controlType === 'array') {
          if (Array.isArray(fieldValue)) {
            formValues[field.name] = fieldValue.map(item => {
              if (typeof item === 'object' && item !== null) {
                return item as Record<string, unknown>;
              }
              return {};
            });
          }
        } else if (controlType === 'group') {
          if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
            formValues[field.name] = fieldValue as Record<string, unknown>;
          }
        } else {
          formValues[field.name] = fieldValue;
        }
      }

      form.patchValue(formValues, { emitEvent: false });
      
      for (const field of config.fields) {
        const controlType = this.registry.getControlType(field.type);
        if (controlType === 'array' && values[field.name]) {
          const arrayValue = values[field.name];
          if (Array.isArray(arrayValue)) {
            const arrayControl = form.get(field.name) as FormArray;
            if (arrayControl) {
              if (arrayControl.length === 0 || arrayControl.length !== arrayValue.length) {
                arrayControl.clear();
                
                for (const item of arrayValue) {
                  if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    const formGroup = this.createFormGroupForSubformItem(field, item as Record<string, unknown>);
                    if (formGroup) {
                      arrayControl.push(formGroup);
                    }
                  }
                }
              } else {
                const currentValues = arrayControl.value;
                const newValues = arrayValue;
                
                if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
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

      form.updateValueAndValidity();
    } catch (error) {
    }
  }

  /**
   * Creates a FormGroup for a subform item based on the field configuration.
   * 
   * This method is used when setting values for subform fields (FormArray). It recursively
   * creates form controls for each field in the subform configuration, handling nested
   * structures appropriately.
   * 
   * @param field - The subform field configuration
   * @param itemValue - The value object for this subform item
   * @returns A FormGroup instance, or null if subform config is missing
   */
  private createFormGroupForSubformItem(field: FormField, itemValue: Record<string, unknown>): FormGroup | null {
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
