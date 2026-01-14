export interface Constraint {
  type: string; // 'min', 'max', 'regex', 'minLength', 'maxLength', 'pattern', etc.
  value: string | number;
}

export interface FormField {
  name: string;
  type: string; // 'text', 'number', 'email', 'date', 'password', 'textarea', 'select', 'checkbox', 'radio'
  required: boolean;
  constraints?: Constraint[];
  options?: string[]; // For select, radio types
  label?: string; // Display label (defaults to name if not provided)
  placeholder?: string;
}

export interface FormConfig {
  name: string;
  fields: FormField[];
}
