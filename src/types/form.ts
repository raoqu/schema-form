export type FieldType = 
  | 'string' 
  | 'longtext' 
  | 'number' 
  | 'checkbox' 
  | 'radio' 
  | 'select' 
  | 'upload' 
  | 'array' 
  | 'object' 
  | 'date' 
  | 'json';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormFieldBase {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  span?: number;
  rules?: any[];
  placeholder?: string;
  card?: {
    title?: string;
    description?: string;
    bordered?: boolean;
    size?: 'default' | 'small';
    extra?: string;
  };
  newline?: boolean;
}

export interface StringField extends FormFieldBase {
  type: 'string';
  maxLength?: number;
  minLength?: number;
  defaultValue?: string;
}

export interface LongTextField extends FormFieldBase {
  type: 'longtext';
  maxLength?: number;
  minLength?: number;
  rows?: number;
  defaultValue?: string;
}

export interface NumberField extends FormFieldBase {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

export interface CheckboxField extends FormFieldBase {
  type: 'checkbox';
  defaultChecked?: boolean;
  defaultValue?: boolean;
}

export interface RadioField extends FormFieldBase {
  type: 'radio';
  options: SelectOption[];
  defaultValue?: string | number;
}

export interface SelectField extends FormFieldBase {
  type: 'select';
  options: SelectOption[];
  mode?: 'multiple' | 'tags';
  defaultValue?: string | number | (string | number)[];
}

export interface UploadField extends FormFieldBase {
  type: 'upload';
  multiple?: boolean;
  maxCount?: number;
  accept?: string;
  defaultValue?: any[];
  // You might want to add more upload-specific configurations here
}

export interface ArrayField extends FormFieldBase {
  type: 'array';
  items: Exclude<FormField, ArrayField>; // Prevent nested arrays for simplicity
  minItems?: number;
  maxItems?: number;
  defaultValue?: any[];
}

export interface ObjectField extends FormFieldBase {
  type: 'object';
  properties: Record<string, FormField>;
  defaultValue?: Record<string, any>;
}

export interface DateField extends FormFieldBase {
  type: 'date';
  format?: string;
  defaultValue?: string;
}

export interface JsonField extends FormFieldBase {
  type: 'json';
  defaultValue?: string;
}

export type FormField =
  | StringField
  | LongTextField
  | NumberField
  | CheckboxField
  | RadioField
  | SelectField
  | UploadField
  | ArrayField
  | ObjectField
  | DateField
  | JsonField;

export interface FormSchema {
  fields: FormField[];
  layout?: {
    columns?: number;
    mobileColumns?: number;
    gutter?: [number, number];
  };
}
