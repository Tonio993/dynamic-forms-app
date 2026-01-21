/**
 * Export all field components for use in form configurations
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
