/**
 * Export all field components for use in form configurations
 */
export { TextInputComponent } from './text-input/text-input.component';
export { EmailInputComponent } from './email-input/email-input.component';
export { NumberInputComponent } from './number-input/number-input.component';
export { PasswordInputComponent } from './password-input/password-input.component';
export { DateInputComponent } from './date-input/date-input.component';
export { TextareaInputComponent } from './textarea-input/textarea-input.component';
export { SelectInputComponent } from './select-input/select-input.component';
export { RadioInputComponent } from './radio-input/radio-input.component';
export { CheckboxInputComponent } from './checkbox-input/checkbox-input.component';

/**
 * Export the registry service
 */
export { FieldComponentRegistryService } from './field-component-registry.service';

/**
 * Export the registry services
 */
export { ErrorMessageRegistryService } from './error-message-registry.service';
export { RegistryManagerService } from './registry-manager.service';

/**
 * Export configuration files for extensibility
 * These can be extended to add new components or error messages
 */
export { FIELD_COMPONENT_CONFIGS, FieldComponentConfig } from './field-component.config';
export { ERROR_MESSAGE_CONFIGS, ErrorMessageConfig } from './error-message.config';
