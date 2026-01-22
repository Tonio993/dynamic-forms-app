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

/**
 * Data interface for the subform item dialog.
 * 
 * @public
 */
export interface SubformItemDialogData {
  /** The existing form group to edit, or null for a new item */
  formGroup: FormGroup | null;
  
  /** The form configuration for the subform item */
  formConfig: FormConfig;
  
  /** The dialog title */
  title: string;
}

/**
 * Dialog component for adding or editing subform items.
 * 
 * This component provides a modal dialog interface for creating or editing
 * individual items in a subform array. It uses the DynamicFormComponent to
 * render the nested form structure, ensuring consistency with the main form.
 * 
 * The component handles form cloning to prevent direct modification of the
 * original form group until the user saves. This allows users to cancel
 * without affecting the original data.
 * 
 * @example
 * ```typescript
 * const dialogData: SubformItemDialogData = {
 *   formGroup: existingFormGroup,
 *   formConfig: subformConfig,
 *   title: 'Edit Address'
 * };
 * 
 * this.dialog.open(SubformItemDialogComponent, {
 *   width: '600px',
 *   data: dialogData
 * });
 * ```
 * 
 * @public
 */
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

  /** The form group instance for this dialog (cloned or newly created) */
  formGroup: FormGroup;
  
  /** The form configuration for the subform item */
  formConfig: FormConfig;
  
  /** The dialog title */
  title: string;

  constructor() {
    this.formConfig = this.data.formConfig;
    this.title = this.data.title;
    if (this.data.formGroup) {
      this.formGroup = this.cloneFormGroup(this.data.formGroup);
    } else {
      this.formGroup = this.createEmptyFormGroup();
    }
  }

  /**
   * Clones a form group with proper deep cloning of nested controls.
   * 
   * This method recursively clones FormGroups and FormArrays, preserving
   * validators and async validators. It ensures that editing in the dialog
   * doesn't directly modify the original form group until saved.
   * 
   * @param original - The original FormGroup to clone
   * @returns A new FormGroup with cloned controls and validators
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
    clonedGroup.setValidators(original.validator);
    clonedGroup.setAsyncValidators(original.asyncValidator);
    return clonedGroup;
  }

  /**
   * Clones a form array with proper deep cloning of nested controls.
   * 
   * @param original - The original FormArray to clone
   * @returns A new FormArray with cloned controls
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
   * Creates an empty form group based on the form configuration.
   * 
   * This method creates form controls for each field in the configuration,
   * using the appropriate control type (FormControl, FormGroup, or FormArray)
   * based on the field's component type.
   * 
   * @returns A new FormGroup with empty controls matching the configuration
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
   * Gets the component type for a field from the registry.
   * 
   * @param field - The field configuration
   * @returns The component class, or null if not found
   */
  getFieldComponentType(field: FormField): Type<unknown> | null {
    return this.registry.get(field.type);
  }

  /**
   * Gets a field control from the form group.
   * 
   * @param fieldName - The name of the field
   * @returns The AbstractControl instance, or null if not found
   */
  getFieldControl(fieldName: string): AbstractControl | null {
    return this.formGroup.get(fieldName);
  }

  /**
   * Checks if a field is invalid and touched.
   * 
   * @param fieldName - The name of the field to check
   * @returns True if the field is invalid and touched, false otherwise
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.getFieldControl(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Gets the error message for a field using the error message registry.
   * 
   * This method attempts to retrieve error messages from the error message
   * registry first. If no registered message is found, it falls back to
   * checking for string error values or error objects with a 'message' property.
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
    const field = this.formConfig.fields.find(f => f.name === fieldName);
    const fieldLabel = field?.label || field?.name || fieldName;

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
   * Saves the form and closes the dialog with the form group.
   * 
   * If the form is valid, the dialog is closed with the form group as the result.
   * If invalid, all fields are marked as touched to display validation errors.
   */
  save(): void {
    if (this.formGroup.valid) {
      this.dialogRef.close(this.formGroup);
    } else {
      const controls = this.formGroup.controls;
      for (const key of Object.keys(controls)) {
        this.formGroup.get(key)?.markAsTouched();
      }
    }
  }

  /**
   * Cancels the dialog without saving changes.
   * 
   * Closes the dialog without returning a result, effectively discarding
   * any changes made in the dialog.
   */
  cancel(): void {
    this.dialogRef.close();
  }
}
