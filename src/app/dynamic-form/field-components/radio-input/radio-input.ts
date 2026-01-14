import { Component, input, computed, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { FormField } from '../../../models/form-config.model';
import { FieldComponentRegistryService } from '../field-component-registry.service';

@Component({
  selector: 'app-radio-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './radio-input.html',
  styleUrls: ['./radio-input.css']
})
export class RadioInputComponent {
  field = input.required<FormField>();
  formGroup = input.required<FormGroup>();
  isInvalid = input.required<boolean>();
  formId = input<string>('');

  private registry = inject(FieldComponentRegistryService);

  constructor() {
    // Self-register this component
    this.registry.register('radio', RadioInputComponent);
  }

  fieldId = computed(() => {
    const id = this.formId() || 'field';
    return `${id}-${this.field().name}`;
  });
  required = computed(() => this.field().required);
  label = computed(() => this.field().label || this.field().name);
  options = computed(() => this.field().options || []);
  optionId = (option: string) => `${this.fieldId()}-${option}`;
}
