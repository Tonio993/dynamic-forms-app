import { Injectable, Type, Injector, runInInjectionContext, inject } from '@angular/core';
import { ControlType, BaseFieldComponent } from './base-field.component';
import { FIELD_COMPONENT_CONFIGS } from './field-component.config';

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
  private initialized = false;
  private readonly injector = inject(Injector);

  /**
   * Registers a component and its control type for a specific field type.
   * 
   * @param fieldType - The string identifier for the field type (e.g., 'text', 'email')
   * @param component - The Angular component class for this field type
   * @param controlType - The type of form control this component uses
   */
  register(fieldType: string, component: Type<unknown>, controlType: ControlType): void {
    this.componentRegistry.set(fieldType, component);
    this.controlTypeRegistry.set(fieldType, controlType);
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
      this.register(config.type, config.component, controlType);
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
}
