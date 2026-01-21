import { Type } from '@angular/core';
import { BaseFieldComponent, ControlType } from './base-field.component';
import { TextInputComponent } from './text-input/text-input';
import { EmailInputComponent } from './email-input/email-input';
import { NumberInputComponent } from './number-input/number-input';
import { PasswordInputComponent } from './password-input/password-input';
import { DateInputComponent } from './date-input/date-input';
import { TextareaInputComponent } from './textarea-input/textarea-input';
import { SelectInputComponent } from './select-input/select-input';
import { RadioInputComponent } from './radio-input/radio-input';
import { CheckboxInputComponent } from './checkbox-input/checkbox-input';

/**
 * Configuration for a field component registration
 */
export interface FieldComponentConfig {
  /** The field type identifier (e.g., 'text', 'email', 'number') */
  type: string;
  /** The component class */
  component: Type<BaseFieldComponent>;
  /** The control type this component uses */
  controlType: ControlType;
}

/**
 * Centralized configuration for all field components
 * To add a new component, simply add a new entry to this array
 */
export const FIELD_COMPONENT_CONFIGS: FieldComponentConfig[] = [
  { type: 'text', component: TextInputComponent, controlType: 'control' },
  { type: 'email', component: EmailInputComponent, controlType: 'control' },
  { type: 'number', component: NumberInputComponent, controlType: 'control' },
  { type: 'password', component: PasswordInputComponent, controlType: 'control' },
  { type: 'date', component: DateInputComponent, controlType: 'control' },
  { type: 'textarea', component: TextareaInputComponent, controlType: 'control' },
  { type: 'select', component: SelectInputComponent, controlType: 'control' },
  { type: 'radio', component: RadioInputComponent, controlType: 'control' },
  { type: 'checkbox', component: CheckboxInputComponent, controlType: 'control' }
];
