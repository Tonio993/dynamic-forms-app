import { Component, inject, Type } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgComponentOutlet } from '@angular/common';
import { FormField, FormConfig } from '../../../models/form-config.model';
import { FieldComponentRegistryService } from '../field-component-registry.service';
import { ErrorMessageRegistryService } from '../error-message-registry.service';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';
import { ControlType } from '../base-field.component';

export interface SubformItemDialogData {
  formGroup: FormGroup | null;
  formConfig: FormConfig;
  title: string;
}

@Component({
  selector: 'app-subform-item-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    NgComponentOutlet
  ],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './subform-item-dialog.component.html',
  styleUrls: ['./subform-item-dialog.component.css']
})
export class SubformItemDialogComponent {
  private dialogRef = inject(MatDialogRef<SubformItemDialogComponent>);
  private data = inject<SubformItemDialogData>(MAT_DIALOG_DATA);
  private registry = inject(FieldComponentRegistryService);
  private errorMessageRegistry = inject(ErrorMessageRegistryService);
  private fb = inject(FormBuilder);

  formGroup: FormGroup;
  formConfig: FormConfig;
  title: string;

  constructor() {
    this.formConfig = this.data.formConfig;
    this.title = this.data.title;
    // Create a new form group if one doesn't exist, otherwise clone the existing one
    if (this.data.formGroup) {
      // Clone the form group to avoid modifying the original
      this.formGroup = this.cloneFormGroup(this.data.formGroup);
    } else {
      this.formGroup = this.createEmptyFormGroup();
    }
  }

  /**
   * Clone a form group with proper deep cloning of nested controls
   */
  private cloneFormGroup(original: FormGroup): FormGroup {
    const controls: Record<string, FormControl | FormGroup | FormArray> = {};
    
    for (const key of Object.keys(original.controls)) {
      const control = original.get(key);
      if (!control) {
        continue;
      }
      
      if (control instanceof FormGroup) {
        controls[key] = this.cloneFormGroup(control);
      } else if (control instanceof FormArray) {
        controls[key] = this.cloneFormArray(control);
      } else {
        controls[key] = this.fb.control(control.value, control.validator, control.asyncValidator);
      }
    }

    const clonedGroup = this.fb.group(controls);
    // Copy validators
    clonedGroup.setValidators(original.validator);
    clonedGroup.setAsyncValidators(original.asyncValidator);
    return clonedGroup;
  }

  /**
   * Clone a form array
   */
  private cloneFormArray(original: FormArray): FormArray {
    const controls: (FormControl | FormGroup | FormArray)[] = [];
    
    for (const control of original.controls) {
      if (control instanceof FormGroup) {
        controls.push(this.cloneFormGroup(control));
      } else if (control instanceof FormArray) {
        controls.push(this.cloneFormArray(control));
      } else {
        controls.push(this.fb.control(control.value, control.validator, control.asyncValidator));
      }
    }
    
    return this.fb.array(controls);
  }

  /**
   * Create an empty form group based on the form config
   */
  private createEmptyFormGroup(): FormGroup {
    const controls: Record<string, FormControl | FormGroup | FormArray> = {};
    
    for (const field of this.formConfig.fields) {
      const controlType = this.registry.getControlType(field.type);
      if (controlType === 'control') {
        controls[field.name] = this.fb.control(null);
      } else if (controlType === 'group') {
        controls[field.name] = this.fb.group({});
      } else if (controlType === 'array') {
        controls[field.name] = this.fb.array([]);
      } else {
        controls[field.name] = this.fb.control(null);
      }
    }

    return this.fb.group(controls);
  }

  /**
   * Get component type for a field
   */
  getFieldComponentType(field: FormField): Type<unknown> | null {
    return this.registry.get(field.type);
  }

  /**
   * Get field control from the form group
   */
  getFieldControl(fieldName: string): AbstractControl | null {
    return this.formGroup.get(fieldName);
  }

  /**
   * Check if a field is invalid
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.getFieldControl(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Get field error message using the error message registry
   */
  getFieldError(fieldName: string): string {
    const control = this.getFieldControl(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors as ValidationErrors;
    const field = this.formConfig.fields.find(f => f.name === fieldName);
    const fieldLabel = field?.label || field?.name || fieldName;

    // Try to get error message from registry for each error key
    const errorKeys = Object.keys(errors);
    for (const errorKey of errorKeys) {
      const errorMessage = this.errorMessageRegistry.getErrorMessage(errorKey, errors, fieldLabel);
      if (errorMessage) {
        return errorMessage;
      }

      // Handle custom validator errors (fallback)
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
   * Save the form and close the dialog
   */
  save(): void {
    if (this.formGroup.valid) {
      this.dialogRef.close(this.formGroup);
    } else {
      // Mark all fields as touched to show validation errors
      const controls = this.formGroup.controls;
      for (const key of Object.keys(controls)) {
        this.formGroup.get(key)?.markAsTouched();
      }
    }
  }

  /**
   * Cancel and close the dialog
   */
  cancel(): void {
    this.dialogRef.close();
  }
}
