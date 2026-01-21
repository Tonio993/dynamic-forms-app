import { Injectable, Type } from '@angular/core';
import { ControlType } from './base-field.component';

/**
 * Service for registering and retrieving field components by type
 * Components are registered via the FieldComponentsRegistryComponent
 */
@Injectable({
  providedIn: 'root'
})
export class FieldComponentRegistryService {
  private readonly componentRegistry = new Map<string, Type<unknown>>();
  private readonly controlTypeRegistry = new Map<string, ControlType>();

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
   */
  get(fieldType: string): Type<unknown> | null {
    return this.componentRegistry.get(fieldType) || null;
  }

  /**
   * Get control type for a specific field type
   */
  getControlType(fieldType: string): ControlType | null {
    return this.controlTypeRegistry.get(fieldType) || null;
  }

  /**
   * Check if a component is registered for a field type
   */
  has(fieldType: string): boolean {
    return this.componentRegistry.has(fieldType);
  }

  /**
   * Get all registered field types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.componentRegistry.keys());
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.componentRegistry.clear();
    this.controlTypeRegistry.clear();
  }
}
