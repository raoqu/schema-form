import { FormSchema, FormField, SelectOption } from '../types/form';

export interface SchemaVerificationResult {
  isValid: boolean;
  error?: string;
  schema?: FormSchema;
}

const isValidFieldType = (type: string): boolean => {
  return [
    'string',
    'longtext',
    'number',
    'checkbox',
    'radio',
    'select',
    'upload',
    'array',
    'object',
    'date',
    'json'
  ].includes(type);
};

const isValidSelectOptions = (options: any[]): options is SelectOption[] => {
  return options.every(option => 
    typeof option === 'object' &&
    option !== null &&
    'label' in option &&
    'value' in option &&
    (typeof option.value === 'string' || typeof option.value === 'number')
  );
};

const validateField = (field: any): string | null => {
  if (!field.name || typeof field.name !== 'string') {
    return 'Field name is required and must be a string';
  }
  if (!field.type || !isValidFieldType(field.type)) {
    return `Invalid field type for ${field.name}. Must be one of: string, longtext, number, checkbox, radio, select, upload, array, object, date, json`;
  }
  if (field.required !== undefined && typeof field.required !== 'boolean') {
    return `Required property must be a boolean for field ${field.name}`;
  }

  // Validate card configuration if present
  if (field.card !== undefined) {
    if (typeof field.card !== 'object' || Array.isArray(field.card)) {
      return `Card configuration must be an object for field ${field.name}`;
    }
    if (field.card.title !== undefined && typeof field.card.title !== 'string') {
      return `Card title must be a string for field ${field.name}`;
    }
    if (field.card.description !== undefined && typeof field.card.description !== 'string') {
      return `Card description must be a string for field ${field.name}`;
    }
    if (field.card.bordered !== undefined && typeof field.card.bordered !== 'boolean') {
      return `Card bordered must be a boolean for field ${field.name}`;
    }
    if (field.card.size !== undefined && !['default', 'small'].includes(field.card.size)) {
      return `Card size must be either 'default' or 'small' for field ${field.name}`;
    }
    if (field.card.extra !== undefined && typeof field.card.extra !== 'string') {
      return `Card extra must be a string for field ${field.name}`;
    }
  }

  // Type-specific validations
  switch (field.type) {
    case 'string':
    case 'longtext':
      if (field.defaultValue !== undefined && typeof field.defaultValue !== 'string') {
        return `Default value must be a string for field ${field.name}`;
      }
      break;

    case 'number':
      if (field.defaultValue !== undefined && typeof field.defaultValue !== 'number') {
        return `Default value must be a number for field ${field.name}`;
      }
      if (field.min !== undefined && typeof field.min !== 'number') {
        return `Min value must be a number for field ${field.name}`;
      }
      if (field.max !== undefined && typeof field.max !== 'number') {
        return `Max value must be a number for field ${field.name}`;
      }
      if (field.step !== undefined && typeof field.step !== 'number') {
        return `Step value must be a number for field ${field.name}`;
      }
      if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
        return `Min value cannot be greater than max value for field ${field.name}`;
      }
      if (field.defaultValue !== undefined) {
        if (field.min !== undefined && field.defaultValue < field.min) {
          return `Default value cannot be less than min value for field ${field.name}`;
        }
        if (field.max !== undefined && field.defaultValue > field.max) {
          return `Default value cannot be greater than max value for field ${field.name}`;
        }
      }
      break;

    case 'checkbox':
      if (field.defaultValue !== undefined && typeof field.defaultValue !== 'boolean') {
        return `Default value must be a boolean for field ${field.name}`;
      }
      break;

    case 'radio':
    case 'select':
      if (!Array.isArray(field.options)) {
        return `${field.type} field ${field.name} must have an options array`;
      }
      if (!isValidSelectOptions(field.options)) {
        return `Invalid options format for ${field.name}. Each option must have label and value properties`;
      }
      if (field.type === 'select' && field.mode && !['multiple', 'tags'].includes(field.mode)) {
        return `Invalid select mode for ${field.name}. Must be either 'multiple' or 'tags'`;
      }
      if (field.defaultValue !== undefined) {
        const validValues = field.options.map(opt => opt.value);
        if (field.mode === 'multiple' || field.mode === 'tags') {
          if (!Array.isArray(field.defaultValue)) {
            return `Default value must be an array for multiple select field ${field.name}`;
          }
          if (!field.defaultValue.every(v => validValues.includes(v))) {
            return `Default value contains invalid options for field ${field.name}`;
          }
        } else {
          if (!validValues.includes(field.defaultValue)) {
            return `Invalid default value for field ${field.name}`;
          }
        }
      }
      break;

    case 'upload':
      if (field.multiple !== undefined && typeof field.multiple !== 'boolean') {
        return `Multiple property must be a boolean for upload field ${field.name}`;
      }
      if (field.maxCount !== undefined && (!Number.isInteger(field.maxCount) || field.maxCount < 1)) {
        return `MaxCount must be a positive integer for upload field ${field.name}`;
      }
      if (field.defaultValue !== undefined && !Array.isArray(field.defaultValue)) {
        return `Default value must be an array for upload field ${field.name}`;
      }
      break;

    case 'array':
      if (!field.items || typeof field.items !== 'object') {
        return `Array field ${field.name} must have an items property defining the array elements`;
      }
      const itemsError = validateField(field.items);
      if (itemsError) {
        return `Invalid array items for field ${field.name}: ${itemsError}`;
      }
      if (field.defaultValue !== undefined) {
        if (!Array.isArray(field.defaultValue)) {
          return `Default value must be an array for field ${field.name}`;
        }
        for (const item of field.defaultValue) {
          const itemValidation = validateValue(item, field.items);
          if (!itemValidation.isValid) {
            return `Invalid default value item for field ${field.name}: ${itemValidation.error}`;
          }
        }
      }
      break;

    case 'object':
      if (!field.properties || typeof field.properties !== 'object') {
        return `Object field ${field.name} must have a properties object`;
      }
      for (const [propName, propField] of Object.entries(field.properties)) {
        const propError = validateField(propField);
        if (propError) {
          return `Invalid property ${propName} in object field ${field.name}: ${propError}`;
        }
      }
      if (field.defaultValue !== undefined) {
        if (typeof field.defaultValue !== 'object' || Array.isArray(field.defaultValue)) {
          return `Default value must be an object for field ${field.name}`;
        }
        for (const [key, value] of Object.entries(field.defaultValue)) {
          if (!field.properties[key]) {
            return `Unknown property ${key} in default value for field ${field.name}`;
          }
          const valueValidation = validateValue(value, field.properties[key]);
          if (!valueValidation.isValid) {
            return `Invalid default value for property ${key} in field ${field.name}: ${valueValidation.error}`;
          }
        }
      }
      break;

    case 'date':
      if (field.defaultValue !== undefined) {
        const date = new Date(field.defaultValue);
        if (isNaN(date.getTime())) {
          return `Invalid date format for default value in field ${field.name}`;
        }
      }
      break;
  }

  return null;
};

interface ValueValidationResult {
  isValid: boolean;
  error?: string;
}

const validateValue = (value: any, field: any): ValueValidationResult => {
  switch (field.type) {
    case 'string':
    case 'longtext':
      if (typeof value !== 'string') {
        return { isValid: false, error: 'Value must be a string' };
      }
      break;
    case 'number':
      if (typeof value !== 'number') {
        return { isValid: false, error: 'Value must be a number' };
      }
      break;
    case 'checkbox':
      if (typeof value !== 'boolean') {
        return { isValid: false, error: 'Value must be a boolean' };
      }
      break;
    case 'radio':
    case 'select':
      const validValues = field.options.map((opt: any) => opt.value);
      if (!validValues.includes(value)) {
        return { isValid: false, error: 'Invalid option value' };
      }
      break;
    // Add more type validations as needed
  }
  return { isValid: true };
};

export const verifyJsonSchema = (jsonString: string): SchemaVerificationResult => {
  try {
    const schema = JSON.parse(jsonString);

    // Basic schema structure validation
    if (!schema || typeof schema !== 'object') {
      return { isValid: false, error: 'Schema must be a valid JSON object' };
    }

    if (!Array.isArray(schema.fields)) {
      return { isValid: false, error: 'Schema must have a fields array' };
    }

    // Validate each field
    for (const field of schema.fields) {
      const fieldError = validateField(field);
      if (fieldError) {
        return { isValid: false, error: fieldError };
      }
    }

    // Validate layout if present
    if (schema.layout) {
      const { columns, mobileColumns, gutter } = schema.layout;
      
      if (columns !== undefined && (!Number.isInteger(columns) || columns < 1)) {
        return { isValid: false, error: 'Layout columns must be a positive integer' };
      }
      
      if (mobileColumns !== undefined && (!Number.isInteger(mobileColumns) || mobileColumns < 1)) {
        return { isValid: false, error: 'Layout mobileColumns must be a positive integer' };
      }
      
      if (gutter !== undefined) {
        if (!Array.isArray(gutter) || gutter.length !== 2 || 
            !gutter.every(value => Number.isInteger(value) && value >= 0)) {
          return { isValid: false, error: 'Layout gutter must be an array of two non-negative integers' };
        }
      }
    }

    return { isValid: true, schema: schema as FormSchema };
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' };
  }
};
