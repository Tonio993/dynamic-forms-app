import { Injectable } from '@angular/core';
import { FieldComponentRegistryService } from './field-component-registry.service';
import { ErrorMessageRegistryService } from './error-message-registry.service';

/**
 * Service responsible for coordinating registry initialization
 * Triggers lazy initialization of registries on first access
 * 
 * Note: Registries now initialize themselves automatically, but this service
 * can be used to explicitly trigger initialization if needed
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
   * Initialize field components registry
   * Triggers lazy initialization by accessing the registry
   */
  initializeFieldComponents(): void {
    // Trigger initialization by accessing the registry
    this.fieldComponentRegistry.getRegisteredTypes();
  }

  /**
   * Initialize error messages registry
   * Triggers lazy initialization by accessing the registry
   */
  initializeErrorMessages(): void {
    // Trigger initialization by accessing the registry
    this.errorMessageRegistry.getRegisteredKeys();
  }

  /**
   * Initialize all registries
   * Triggers lazy initialization of both registries
   */
  initializeAll(): void {
    this.initializeFieldComponents();
    this.initializeErrorMessages();
  }
}
