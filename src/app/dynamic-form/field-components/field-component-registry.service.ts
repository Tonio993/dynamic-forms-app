import { Injectable, Type } from '@angular/core';

/**
 * Service for registering and retrieving field components by type
 * Components are registered via the FieldComponentsRegistryComponent
 */
@Injectable({
  providedIn: 'root'
})
export class FieldComponentRegistryService {
  private readonly registry = new Map<string, Type<unknown>>();

  /**
   * Register a component for a specific field type
   */
  register(fieldType: string, component: Type<unknown>): void {
    if (this.registry.has(fieldType)) {
      console.warn(`Component for field type '${fieldType}' is already registered. Overwriting...`);
    }
    this.registry.set(fieldType, component);
  }

  /**
   * Get component for a specific field type
   */
  get(fieldType: string): Type<unknown> | null {
    return this.registry.get(fieldType) || null;
  }

  /**
   * Check if a component is registered for a field type
   */
  has(fieldType: string): boolean {
    return this.registry.has(fieldType);
  }

  /**
   * Get all registered field types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.registry.clear();
  }
}
