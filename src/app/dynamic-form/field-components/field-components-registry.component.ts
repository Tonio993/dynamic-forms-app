import { Component, inject, Injector, OnInit, runInInjectionContext } from '@angular/core';
import { FieldComponentRegistryService } from './field-component-registry.service';
import { TextInputComponent } from './text-input/text-input';
import { EmailInputComponent } from './email-input/email-input';
import { NumberInputComponent } from './number-input/number-input';
import { PasswordInputComponent } from './password-input/password-input';
import { DateInputComponent } from './date-input/date-input';
import { TextareaInputComponent } from './textarea-input/textarea-input';
import { SelectInputComponent } from './select-input/select-input';
import { RadioInputComponent } from './radio-input/radio-input';
import { CheckboxInputComponent } from './checkbox-input/checkbox-input';
import { BaseFieldComponent, ControlType } from './base-field.component';

/**
 * Library component that registers all field components in the FieldComponentRegistryService
 * Import this component in your application to ensure all field components are registered
 * 
 * Usage:
 * ```typescript
 * import { FieldComponentsRegistryComponent } from './dynamic-form/field-components/field-components-registry.component';
 * 
 * @Component({
 *   imports: [FieldComponentsRegistryComponent],
 *   ...
 * })
 * ```
 * 
 * Or add it to your app component or a root component.
 */
@Component({
  selector: 'app-field-components-registry',
  standalone: true,
  template: '' // No template needed - this is a service component
})
export class FieldComponentsRegistryComponent implements OnInit {
  private registry = inject(FieldComponentRegistryService);
  private injector = inject(Injector);

  ngOnInit(): void {
    // Register all field components with their control types
    // Use runInInjectionContext to properly instantiate components and call getControlType()
    this.registry.register('text', TextInputComponent, this.getControlType(TextInputComponent));
    this.registry.register('email', EmailInputComponent, this.getControlType(EmailInputComponent));
    this.registry.register('number', NumberInputComponent, this.getControlType(NumberInputComponent));
    this.registry.register('password', PasswordInputComponent, this.getControlType(PasswordInputComponent));
    this.registry.register('date', DateInputComponent, this.getControlType(DateInputComponent));
    this.registry.register('textarea', TextareaInputComponent, this.getControlType(TextareaInputComponent));
    this.registry.register('select', SelectInputComponent, this.getControlType(SelectInputComponent));
    this.registry.register('radio', RadioInputComponent, this.getControlType(RadioInputComponent));
    this.registry.register('checkbox', CheckboxInputComponent, this.getControlType(CheckboxInputComponent));
  }

  /**
   * Creates a component instance in injection context and retrieves its control type
   */
  private getControlType<T extends BaseFieldComponent>(componentType: new (...args: any[]) => T): ControlType {
    return runInInjectionContext(this.injector, () => {
      const instance = new componentType();
      return instance.getControlType();
    });
  }
}
