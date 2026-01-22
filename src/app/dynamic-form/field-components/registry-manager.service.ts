import { Injectable } from '@angular/core';
import { FieldComponentRegistryService } from './field-component-registry.service';
import { ErrorMessageRegistryService } from './error-message-registry.service';

/**
 * Service responsible for coordinating registry initialization.
 * 
 * This service provides a centralized way to trigger lazy initialization of
 * all registries. While registries initialize themselves automatically on
 * first access, this service can be used to explicitly trigger initialization
 * during application startup to ensure registries are ready before any forms
 * are rendered.
 * 
 * Note: Registries now initialize themselves automatically using lazy initialization,
 * but this service provides explicit control when needed.
 * 
 * @example
 * ```typescript
 * constructor(private registryManager: RegistryManagerService) {
 *   this.registryManager.initializeAll();
 * }
 * ```
 * 
 * @public
 */
@Injectable({
  providedIn: 'root'
})
export class RegistryManagerService {
  constructor(
    private fieldComponentRegistry: FieldComponentRegistryService,
    private errorMessageRegistry: ErrorMessageRegistryService
  ) {}

  /**
   * Initializes the field components registry.
   * 
   * Triggers lazy initialization by accessing the registry, which causes
   * all field components to be registered from the centralized configuration.
   */
  initializeFieldComponents(): void {
    this.fieldComponentRegistry.getRegisteredTypes();
  }

  /**
   * Initializes the error messages registry.
   * 
   * Triggers lazy initialization by accessing the registry, which causes
   * all error messages to be registered from the centralized configuration.
   */
  initializeErrorMessages(): void {
    this.errorMessageRegistry.getRegisteredKeys();
  }

  /**
   * Initializes all registries.
   * 
   * Triggers lazy initialization of both the field components registry and
   * the error messages registry. This ensures all components and error messages
   * are registered and ready before any forms are rendered.
   */
  initializeAll(): void {
    this.initializeFieldComponents();
    this.initializeErrorMessages();
  }
}
