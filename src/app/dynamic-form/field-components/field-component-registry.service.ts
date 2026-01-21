import { Injectable, Type, Injector, runInInjectionContext, inject } from '@angular/core';
import { ControlType, BaseFieldComponent } from './base-field.component';
import { FIELD_COMPONENT_CONFIGS } from './field-component.config';

/**
 * Service for registering and retrieving field components by type
 * Components are registered automatically on first access
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
   * Register a component and its control type for a specific field type
   */
  register(fieldType: string, component: Type<unknown>, controlType: ControlType): void {
    if (this.componentRegistry.has(fieldType)) {
      console.warn(`Component for field type '${fieldType}' is already registered. Overwriting...`);
    }
    this.componentRegistry.set(fieldType, component);
    this.controlTypeRegistry.set(fieldType, controlType);
  }

  /**
   * Get component for a specific field type
   * Automatically initializes registry if not already initialized
   */
  get(fieldType: string): Type<unknown> | null {
    this.ensureInitialized();
    return this.componentRegistry.get(fieldType) || null;
  }

  /**
   * Get control type for a specific field type
   * Automatically initializes registry if not already initialized
   */
  getControlType(fieldType: string): ControlType | null {
    this.ensureInitialized();
    return this.controlTypeRegistry.get(fieldType) || null;
  }

  /**
   * Check if a component is registered for a field type
   * Automatically initializes registry if not already initialized
   */
  has(fieldType: string): boolean {
    this.ensureInitialized();
    return this.componentRegistry.has(fieldType);
  }

  /**
   * Get all registered field types
   * Automatically initializes registry if not already initialized
   */
  getRegisteredTypes(): string[] {
    this.ensureInitialized();
    return Array.from(this.componentRegistry.keys());
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.componentRegistry.clear();
    this.controlTypeRegistry.clear();
  }

  /**
   * Ensure the registry is initialized before use
   */
  private ensureInitialized(): void {
    if (this.initialized) {
      return;
    }

    FIELD_COMPONENT_CONFIGS.forEach(config => {
      // Get control type from component instance
      const controlType = this.getControlTypeFromComponent(config.component);
      this.register(config.type, config.component, controlType);
    });

    this.initialized = true;
  }

  /**
   * Creates a component instance in injection context and retrieves its control type
   */
  private getControlTypeFromComponent<T extends BaseFieldComponent>(componentType: new (...args: any[]) => T): ControlType {
    return runInInjectionContext(this.injector, () => {
      const instance = new componentType();
      return instance.getControlType();
    });
  }
}
