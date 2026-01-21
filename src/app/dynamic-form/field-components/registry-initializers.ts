import { Injector, runInInjectionContext } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { BaseFieldComponent, ControlType } from './base-field.component';
import { FieldComponentRegistryService } from './field-component-registry.service';
import { ErrorMessageRegistryService } from './error-message-registry.service';
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
 * Initialize field components registry
 */
export function initializeFieldComponentsRegistry(injector: Injector): void {
  const registry = injector.get(FieldComponentRegistryService);

  /**
   * Creates a component instance in injection context and retrieves its control type
   */
  function getControlType<T extends BaseFieldComponent>(componentType: new (...args: any[]) => T): ControlType {
    return runInInjectionContext(injector, () => {
      const instance = new componentType();
      return instance.getControlType();
    });
  }

  // Register all field components with their control types
  registry.register('text', TextInputComponent, getControlType(TextInputComponent));
  registry.register('email', EmailInputComponent, getControlType(EmailInputComponent));
  registry.register('number', NumberInputComponent, getControlType(NumberInputComponent));
  registry.register('password', PasswordInputComponent, getControlType(PasswordInputComponent));
  registry.register('date', DateInputComponent, getControlType(DateInputComponent));
  registry.register('textarea', TextareaInputComponent, getControlType(TextareaInputComponent));
  registry.register('select', SelectInputComponent, getControlType(SelectInputComponent));
  registry.register('radio', RadioInputComponent, getControlType(RadioInputComponent));
  registry.register('checkbox', CheckboxInputComponent, getControlType(CheckboxInputComponent));
}

/**
 * Initialize error message registry
 */
export function initializeErrorMessageRegistry(injector: Injector): void {
  const errorMessageRegistry = injector.get(ErrorMessageRegistryService);

  // Register all common error messages

  // Required validator
  errorMessageRegistry.register('required', (errors: ValidationErrors, fieldLabel: string) => {
    return `${fieldLabel} is required`;
  });

  // Email validator
  errorMessageRegistry.register('email', (errors: ValidationErrors, fieldLabel: string) => {
    return `Invalid email address`;
  });

  // Min validator (for numbers)
  errorMessageRegistry.register('min', (errors: ValidationErrors, fieldLabel: string) => {
    const minValue = errors['min']?.min;
    return `Minimum value is ${minValue}`;
  });

  // Max validator (for numbers)
  errorMessageRegistry.register('max', (errors: ValidationErrors, fieldLabel: string) => {
    const maxValue = errors['max']?.max;
    return `Maximum value is ${maxValue}`;
  });

  // MinLength validator
  errorMessageRegistry.register('minlength', (errors: ValidationErrors, fieldLabel: string) => {
    const requiredLength = errors['minlength']?.requiredLength;
    return `Minimum length is ${requiredLength} characters`;
  });

  // MaxLength validator
  errorMessageRegistry.register('maxlength', (errors: ValidationErrors, fieldLabel: string) => {
    const requiredLength = errors['maxlength']?.requiredLength;
    return `Maximum length is ${requiredLength} characters`;
  });

  // Pattern validator
  errorMessageRegistry.register('pattern', (errors: ValidationErrors, fieldLabel: string) => {
    return `Invalid format`;
  });

  // Custom notANumber validator
  errorMessageRegistry.register('notANumber', (errors: ValidationErrors, fieldLabel: string) => {
    return `Must be a valid number`;
  });
}
