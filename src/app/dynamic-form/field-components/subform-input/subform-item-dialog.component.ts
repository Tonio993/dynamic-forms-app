import { Component, inject, Type } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgComponentOutlet } from '@angular/common';
import { FormField, FormConfig } from '../../../models/form-config.model';
import { FieldComponentRegistryService } from '../field-component-registry.service';
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
   * Clone a form group
   */
  private cloneFormGroup(original: FormGroup): FormGroup {
    const controls: { [key: string]: any } = {};
    
    Object.keys(original.controls).forEach(key => {
      const control = original.get(key);
      if (control instanceof FormGroup) {
        controls[key] = this.fb.group(control.value);
      } else if (control instanceof FormArray) {
        controls[key] = this.fb.array(control.value);
      } else {
        controls[key] = [control?.value || null];
      }
    });

    const clonedGroup = this.fb.group(controls);
    // Copy validators
    clonedGroup.setValidators(original.validator);
    clonedGroup.setAsyncValidators(original.asyncValidator);
    return clonedGroup;
  }

  /**
   * Create an empty form group based on the form config
   */
  private createEmptyFormGroup(): FormGroup {
    const controls: { [key: string]: any } = {};
    
    this.formConfig.fields.forEach(field => {
      const controlType = this.registry.getControlType(field.type);
      if (controlType === 'control') {
        controls[field.name] = [null];
      } else if (controlType === 'group') {
        controls[field.name] = this.fb.group({});
      } else if (controlType === 'array') {
        controls[field.name] = this.fb.array([]);
      } else {
        controls[field.name] = [null];
      }
    });

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
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const control = this.getFieldControl(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    const field = this.formConfig.fields.find(f => f.name === fieldName);
    const fieldLabel = field?.label || field?.name || fieldName;

    // Handle common errors
    if (errors['required']) {
      return `${fieldLabel} is required`;
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

    // Handle custom validator errors
    const errorKeys = Object.keys(errors);
    for (const key of errorKeys) {
      const errorValue = errors[key];
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
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Cancel and close the dialog
   */
  cancel(): void {
    this.dialogRef.close();
  }
}
