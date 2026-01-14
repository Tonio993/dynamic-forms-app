# Field Components

This directory contains individual field components for the dynamic form system. Each input type has its own dedicated component for better modularity and maintainability.

## Architecture

The dynamic form component **does not import any field components directly**. Instead, component classes are provided via the `FormField` configuration, making the system fully decoupled and flexible.

## Structure

```
field-components/
├── base-field.component.ts      # Base interface for field components
├── field-component-registry.ts   # Legacy registry (optional, for backward compatibility)
├── field-components.ts          # Export file with all components
├── index.ts                     # Barrel export for all components
├── text-input/                   # Text input component
├── email-input/                  # Email input component
├── number-input/                 # Number input component
├── password-input/               # Password input component
├── date-input/                   # Date input component
├── textarea-input/               # Textarea component
├── select-input/                 # Select dropdown component
├── radio-input/                  # Radio button group component
└── checkbox-input/               # Checkbox component
```

## Component Interface

All field components follow a consistent interface:

```typescript
{
  field: FormField;           // Required - Field configuration
  formGroup: FormGroup;       // Required - Parent form group
  isInvalid: boolean;         // Required - Validation state
  formId: string;            // Optional - Unique form identifier for unique IDs
}
```

## Usage

### Providing Components per Field

Components must be provided directly on each field in the configuration:

```typescript
import { FormConfig } from './models/form-config.model';
import { TextInputComponent, EmailInputComponent } from './dynamic-form/field-components/field-components';

const formConfig: FormConfig = {
  name: "My Form",
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      label: "Email",
      component: EmailInputComponent // Component must be provided per field
    },
    {
      name: "name",
      type: "text",
      required: true,
      label: "Name",
      component: TextInputComponent // Each field needs its component
    }
  ]
};
```

### Helper Function Pattern

For convenience, you can create a helper function to map field types to components:

```typescript
import {
  TextInputComponent,
  EmailInputComponent,
  NumberInputComponent,
  // ... other components
} from './dynamic-form/field-components/field-components';

function addComponentToField(field: FormField): FormField {
  const componentMap: Record<string, any> = {
    'text': TextInputComponent,
    'email': EmailInputComponent,
    'number': NumberInputComponent,
    // ... other mappings
  };

  return {
    ...field,
    component: componentMap[field.type]
  };
}

const formConfig: FormConfig = {
  name: "My Form",
  fields: [
    addComponentToField({
      name: "email",
      type: "email",
      required: true,
      label: "Email"
    })
  ]
};
```

## Component Resolution

The dynamic form component resolves components in this order:

1. **Field-level component** (`field.component`) - Only source
2. **null** - If no component found

**Note:** Components must be provided on each field. There is no global registry.

## Benefits

- **Decoupling**: Dynamic form component doesn't need to know about field components
- **Flexibility**: Easy to swap components per field
- **Explicit**: Clear which component is used for each field
- **Lazy Loading**: Components can be loaded on-demand
- **Testability**: Easy to mock components for testing
- **Extensibility**: Add custom components without modifying the dynamic form

## Adding New Field Types

1. **Create the component:**
   ```bash
   ng generate component dynamic-form/field-components/new-field-input
   ```

2. **Export from field-components.ts:**
   ```typescript
   export { NewFieldInputComponent } from './new-field-input/new-field-input';
   ```

3. **Use in configuration:**
   ```typescript
   import { NewFieldInputComponent } from './field-components/field-components';
   
   const config: FormConfig = {
     fields: [
       {
         name: "field1",
         type: "new-field",
         component: NewFieldInputComponent, // Must provide component
         // ... other field properties
       }
     ]
   };
   ```

## Dynamic Component Loading

The dynamic form component uses `ngComponentOutlet` to dynamically load components:

```html
<ng-container
  [ngComponentOutlet]="getFieldComponentType(field)"
  [ngComponentOutletInputs]="{
    field: field,
    formGroup: dynamicForm()!,
    isInvalid: isFieldInvalid(field.name),
    formId: formId
  }">
</ng-container>
```

Components are resolved at runtime based on the field configuration, not compile-time imports.
