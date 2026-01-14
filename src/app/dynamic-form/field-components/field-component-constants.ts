import { inject, Provider } from '@angular/core';
import { ControlContainer } from '@angular/forms';

/**
 * Common viewProviders for field components
 * This ensures all field components can access the parent form group
 */
export const FIELD_COMPONENT_VIEW_PROVIDERS: Provider[] = [
  {
    provide: ControlContainer,
    useFactory: () => inject(ControlContainer, { skipSelf: true })
  }
];
