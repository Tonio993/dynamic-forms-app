import { inject, Injectable, Injector, runInInjectionContext, Type } from '@angular/core';
import { BaseFieldComponent, ControlType } from './base-field.component';
import { FIELD_COMPONENT_CONFIGS } from './field-component.config';

/**
 * Registration information for a field component.
 * 
 * This interface encapsulates all the information needed to register a field component
 * in the registry service, including the component type, control type, and initial value.
 * 
 * @public
 */
export interface FieldComponentRegistration {
  /** The field type identifier (e.g., 'text', 'email', 'number') */
  fieldType: string;
  
  /** The Angular component class for this field type */
  component: Type<unknown>;
  
  /** The type of form control this component uses */
  controlType: ControlType;
  
  /** The initial value for the form control (optional) */
  initialValue?: unknown;
}

/**
 * Service for registering and retrieving field components by type.
 * 
 * This service maintains a registry of all available field components and their
 * corresponding control types. Components are automatically registered on first
 * access using lazy initialization from the centralized configuration.
 * 
 * The registry uses a configuration-based approach where all components are defined
 * in `FIELD_COMPONENT_CONFIGS`, ensuring a single source of truth and making it
 * easy to add or remove field types.
 * 
 * @example
 * ```typescript
 * // Get a component type
 * const component = registry.get('text');
 * 
 * // Get the control type for a field
 * const controlType = registry.getControlType('text');
 * ```
 * 
 * @public
 */
@Injectable({
  providedIn: 'root'
})
export class FieldComponentRegistryService {
  private readonly componentRegistry = new Map<string, Type<unknown>>();
  private readonly controlTypeRegistry = new Map<string, ControlType>();
  private readonly initialValueRegistry = new Map<string, unknown>();
  private initialized = false;
  private readonly injector = inject(Injector);

  /**
   * Registers a component with all its registration information.
   * 
   * This method accepts a single `FieldComponentRegistration` object that encapsulates
   * all the information needed to register a field component, including the component
   * type, control type, and initial value.
   * 
   * @param registration - The registration information object containing all component details
   */
  register(registration: FieldComponentRegistration): void {
    this.componentRegistry.set(registration.fieldType, registration.component);
    this.controlTypeRegistry.set(registration.fieldType, registration.controlType);
    if (registration.initialValue !== undefined) {
      this.initialValueRegistry.set(registration.fieldType, registration.initialValue);
    }
  }

  /**
   * Retrieves the component class for a specific field type.
   * 
   * Automatically initializes the registry if it hasn't been initialized yet.
   * 
   * @param fieldType - The field type identifier
   * @returns The component class, or null if not found
   */
  get(fieldType: string): Type<unknown> | null {
    this.ensureInitialized();
    return this.componentRegistry.get(fieldType) || null;
  }

  /**
   * Retrieves the control type for a specific field type.
   * 
   * This is used by the dynamic form component to determine which type of
   * Angular form control to create (FormControl, FormGroup, or FormArray).
   * 
   * Automatically initializes the registry if it hasn't been initialized yet.
   * 
   * @param fieldType - The field type identifier
   * @returns The control type, or null if not found
   */
  getControlType(fieldType: string): ControlType | null {
    this.ensureInitialized();
    return this.controlTypeRegistry.get(fieldType) || null;
  }

  /**
   * Retrieves the initial value for a specific field type.
   * 
   * This is used by the dynamic form component to set the default value
   * when creating form controls. Components can specify their own initial
   * values by overriding the `getInitialValue()` method in BaseFieldComponent.
   * 
   * Automatically initializes the registry if it hasn't been initialized yet.
   * 
   * @param fieldType - The field type identifier
   * @returns The initial value, or null if not specified
   */
  getInitialValue(fieldType: string): unknown {
    this.ensureInitialized();
    return this.initialValueRegistry.has(fieldType) ? this.initialValueRegistry.get(fieldType) : null;
  }

  /**
   * Checks if a component is registered for a field type.
   * 
   * Automatically initializes the registry if it hasn't been initialized yet.
   * 
   * @param fieldType - The field type identifier
   * @returns True if a component is registered, false otherwise
   */
  has(fieldType: string): boolean {
    this.ensureInitialized();
    return this.componentRegistry.has(fieldType);
  }

  /**
   * Gets all registered field types.
   * 
   * Automatically initializes the registry if it hasn't been initialized yet.
   * 
   * @returns Array of all registered field type identifiers
   */
  getRegisteredTypes(): string[] {
    this.ensureInitialized();
    return Array.from(this.componentRegistry.keys());
  }

  /**
   * Clears all registrations.
   * 
   * Useful for testing or resetting the registry state.
   */
  clear(): void {
    this.componentRegistry.clear();
    this.controlTypeRegistry.clear();
    this.initialValueRegistry.clear();
  }

  /**
   * Ensures the registry is initialized before use.
   * 
   * Uses lazy initialization to register all components from the centralized
   * configuration on first access. This approach ensures components are only
   * registered when needed and avoids circular dependency issues.
   */
  private ensureInitialized(): void {
    if (this.initialized) {
      return;
    }

    for (const config of FIELD_COMPONENT_CONFIGS) {
      const controlType = this.getControlTypeFromComponent(config.component);
      const initialValue = this.getInitialValueFromComponent(config.component);
      
      const registration: FieldComponentRegistration = {
        fieldType: config.type,
        component: config.component,
        controlType: controlType,
        initialValue: initialValue
      };
      
      this.register(registration);
    }

    this.initialized = true;
  }

  /**
   * Creates a component instance in injection context and retrieves its control type.
   * 
   * This method uses Angular's `runInInjectionContext` to properly instantiate
   * components that may have dependencies, ensuring the injection context is
   * available during component creation.
   * 
   * @param componentType - The component class constructor
   * @returns The control type returned by the component's `getControlType()` method
   */
  private getControlTypeFromComponent<T extends BaseFieldComponent>(componentType: new () => T): ControlType {
    return runInInjectionContext(this.injector, () => {
      const instance = new componentType();
      return instance.getControlType();
    });
  }

  /**
   * Creates a component instance in injection context and retrieves its initial value.
   * 
   * This method uses Angular's `runInInjectionContext` to properly instantiate
   * components that may have dependencies, ensuring the injection context is
   * available during component creation.
   * 
   * @param componentType - The component class constructor
   * @returns The initial value returned by the component's `getInitialValue()` method, or null if not overridden
   */
  private getInitialValueFromComponent<T extends BaseFieldComponent>(componentType: new () => T): unknown {
    return runInInjectionContext(this.injector, () => {
      const instance = new componentType();
      const initialValue = instance.getInitialValue();
      return initialValue !== null ? initialValue : undefined;
    });
  }
}
