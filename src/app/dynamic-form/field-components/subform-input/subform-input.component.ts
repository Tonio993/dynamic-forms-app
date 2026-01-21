import { Component, computed, input, OnInit, inject, Type, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { observeOn, asyncScheduler, of, tap, timer } from 'rxjs';
import { FormField, FormConfig } from '../../../models/form-config.model';
import { BaseFieldComponent, ControlType } from '../base-field.component';
import { FIELD_COMPONENT_VIEW_PROVIDERS } from '../field-component-constants';
import { FieldComponentRegistryService } from '../field-component-registry.service';
import { SubformItemDialogComponent, SubformItemDialogData } from './subform-item-dialog.component';

/**
 * Subform input component configuration
 */
export interface SubformInputConfig {
  /** The form configuration for each subform item */
  formConfig: FormConfig;
  /** Minimum number of items (optional) */
  minItems?: number;
  /** Maximum number of items (optional) */
  maxItems?: number;
  /** Label for the add button */
  addButtonLabel?: string;
  /** Label for the delete button */
  deleteButtonLabel?: string;
  /** Function to generate a description for each item */
  getItemDescription: (formGroup: FormGroup, index: number) => string;
  /** Whether deletion of items is allowed (default: true) */
  allowDelete?: boolean;
  /** Whether to show confirmation dialog before deletion (default: true) */
  confirmDelete?: boolean;
  /** Custom confirmation message for deletion (optional) */
  deleteConfirmationMessage?: string;
  /** Whether drag and drop sorting is enabled (default: true) */
  allowDragDrop?: boolean;
}

@Component({
  selector: 'app-subform-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule
  ],
  viewProviders: FIELD_COMPONENT_VIEW_PROVIDERS,
  templateUrl: './subform-input.component.html',
  styleUrls: ['./subform-input.component.css']
})
export class SubformInputComponent extends BaseFieldComponent implements OnInit {
  readonly config = computed(() => {
    const fieldConfig = this.field().config || {};
    return fieldConfig as unknown as SubformInputConfig;
  });
  private fb = inject(FormBuilder);
  private registry = inject(FieldComponentRegistryService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef, { optional: true });


  override getControlType(): ControlType {
    return 'array';
  }

  /**
   * Get the FormArray control
   */
  get formArray(): FormArray | null {
    const control = this.formControl();
    return control instanceof FormArray ? control : null;
  }

  /**
   * Get the subform configuration
   */
  get subformConfig(): FormConfig | null {
    const config = this.config();
    return (config?.formConfig as FormConfig | undefined) || null;
  }

  /**
   * Get all form groups in the array
   */
  get formGroups(): FormGroup[] {
    const array = this.formArray;
    return array ? (array.controls as FormGroup[]) : [];
  }

  /**
   * Get component type for a field
   */
  getFieldComponentType(field: FormField): Type<unknown> | null {
    return this.registry.get(field.type);
  }

  /**
   * Get field control from a form group
   */
  getFieldControl(formGroup: FormGroup, fieldName: string): AbstractControl | null {
    return formGroup.get(fieldName) || null;
  }

  /**
   * Check if a field is invalid
   */
  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const control = this.getFieldControl(formGroup, fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Get item description using the configured function
   */
  getItemDescription(formGroup: FormGroup, index: number): string {
    const config = this.config();
    if (config.getItemDescription) {
      return config.getItemDescription(formGroup, index);
    }
    return `Item ${index + 1}`;
  }

  /**
   * Check if we can add more items
   */
  canAddItem(): boolean {
    const array = this.formArray;
    if (!array) {
      return true;
    }
    const config = this.config();
    if (config.maxItems !== undefined) {
      return array.length < config.maxItems;
    }
    return true;
  }

  /**
   * Check if we can delete items
   */
  canDeleteItem(): boolean {
    const array = this.formArray;
    if (!array) {
      return false;
    }
    const config = this.config();
    if (config.minItems !== undefined) {
      return array.length > config.minItems;
    }
    return array.length > 0;
  }

  /**
   * Add a new item to the array
   */
  addItem(): void {
      const array = this.formArray;
      if (!array || !this.canAddItem()) {
        return;
      }

      const subformConfig = this.subformConfig;
      if (!subformConfig) {
        return;
      }

    const config = this.config();
    const dialogData: SubformItemDialogData = {
      formGroup: null,
      formConfig: subformConfig,
      title: config.addButtonLabel || 'Add Item'
    };

    const dialogRef = this.dialog.open(SubformItemDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().pipe(
      observeOn(asyncScheduler)
    ).subscribe(result => {
      if (result && result instanceof FormGroup) {
        array.push(result);
        array.updateValueAndValidity();
        this.cdr?.detectChanges();
      }
    });
  }

  /**
   * Edit an existing item
   */
  editItem(index: number): void {
    const array = this.formArray;
    if (!array || index < 0 || index >= array.length) {
      return;
    }

    const subformConfig = this.subformConfig;
    if (!subformConfig) {
      return;
    }

    const formGroup = array.at(index) as FormGroup;
    const config = this.config();
    const dialogData: SubformItemDialogData = {
      formGroup: formGroup,
      formConfig: subformConfig,
      title: 'Edit Item'
    };

    const dialogRef = this.dialog.open(SubformItemDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().pipe(
      observeOn(asyncScheduler)
    ).subscribe(result => {
      if (result && result instanceof FormGroup) {
        array.setControl(index, result);
        array.updateValueAndValidity();
        this.cdr?.detectChanges();
      }
    });
  }

  /**
   * Delete an item from the array
   */
  deleteItem(index: number): void {
    const array = this.formArray;
    if (!array) {
      return;
    }

    if (!this.canDeleteItem()) {
      return;
    }

    if (index < 0 || index >= array.length) {
      return;
    }

    const config = this.config();
    const itemDescription = this.getItemDescription(array.at(index) as FormGroup, index);
    
    // Check if confirmation is required
    if (config.confirmDelete !== false) {
      const message = config.deleteConfirmationMessage || 
        `Are you sure you want to delete "${itemDescription}"?`;
      
      if (!confirm(message)) {
        return;
      }
    }

    // Use RxJS observeOn to defer the update until after the current change detection cycle
    of(null).pipe(
      observeOn(asyncScheduler),
      tap(() => {
        array.removeAt(index);
        array.updateValueAndValidity();
        this.cdr?.detectChanges();
      })
    ).subscribe();
  }

  /**
   * Handle drag and drop reordering of items
   */
  dropItem(event: CdkDragDrop<FormGroup[]>): void {
    const array = this.formArray;
    if (!array) {
      return;
    }

    const config = this.config();
    // Check if drag and drop is enabled
    if (config.allowDragDrop === false) {
      return;
    }

    // Move the item in the FormArray
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex !== currentIndex) {
      // Get the form group at the previous index
      const formGroup = array.at(previousIndex) as FormGroup;
      
      // Remove it from the old position
      array.removeAt(previousIndex);
      
      // Insert it at the new position
      array.insert(currentIndex, formGroup);
      
      // Update validity
      array.updateValueAndValidity();
      
      // Trigger change detection
      if (this.cdr) {
        this.cdr.detectChanges();
      }
    }
  }

  /**
   * Create a FormGroup from a FormConfig
   */
  private createFormGroupFromConfig(config: FormConfig): FormGroup {
    const formControls: { [key: string]: any } = {};

    config.fields.forEach(field => {
      const componentType = this.registry.get(field.type);
      if (!componentType) {
        return;
      }

      const controlType = this.registry.getControlType(field.type);
      if (!controlType) {
        formControls[field.name] = [null];
        return;
      }

      formControls[field.name] = this.createControlByType(controlType);
    });

    return this.fb.group(formControls);
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

  ngOnInit(): void {
    // Apply validators to the form array
    const validators: ValidatorFn[] = [];
    const field = this.field();
    const config = this.config();

    // Required validator
    if (field.required === true) {
      validators.push(Validators.required);
    }

    // Min items validator
    if (config.minItems !== undefined) {
      validators.push((control: AbstractControl) => {
        const array = control as FormArray;
        if (array.length < config.minItems!) {
          return { minItems: { required: config.minItems, actual: array.length } };
        }
        return null;
      });
    }

    // Max items validator
    if (config.maxItems !== undefined) {
      validators.push((control: AbstractControl) => {
        const array = control as FormArray;
        if (array.length > config.maxItems!) {
          return { maxItems: { required: config.maxItems, actual: array.length } };
        }
        return null;
      });
    }

    // Custom validators from field
    if (field.validators) {
      if (Array.isArray(field.validators)) {
        validators.push(...field.validators);
      } else {
        validators.push(field.validators);
      }
    }

    // Apply validators to the control
    const control = this.formControl();
    if (control && validators.length > 0) {
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }
}
