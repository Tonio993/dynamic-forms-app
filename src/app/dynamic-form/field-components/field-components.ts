/**
 * Export all field components for use in form configurations
 * Components will self-register in the FieldComponentRegistryService when instantiated
 */
export { TextInputComponent } from './text-input/text-input';
export { EmailInputComponent } from './email-input/email-input';
export { NumberInputComponent } from './number-input/number-input';
export { PasswordInputComponent } from './password-input/password-input';
export { DateInputComponent } from './date-input/date-input';
export { TextareaInputComponent } from './textarea-input/textarea-input';
export { SelectInputComponent } from './select-input/select-input';
export { RadioInputComponent } from './radio-input/radio-input';
export { CheckboxInputComponent } from './checkbox-input/checkbox-input';

/**
 * Export the registry service
 */
export { FieldComponentRegistryService } from './field-component-registry.service';
