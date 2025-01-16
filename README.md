# JSON Form Generator

A React component that generates dynamic forms from JSON schema definitions. Built with Vite, TypeScript, and Ant Design.

## Features

- Generate forms from JSON schema
- Support for various field types:
  - String
  - Number
  - Boolean
  - Date
  - Array
  - Nested Objects
- Responsive layout (desktop and mobile)
- Customizable column layout
- Form validation
- TypeScript support

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Usage

```typescript
import { JsonFormGenerator } from './components/JsonFormGenerator';
import { FormSchema } from './types/form';

const schema: FormSchema = {
  fields: [
    {
      name: 'username',
      label: 'Username',
      type: 'string',
      required: true,
    },
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      min: 0,
      max: 150,
    },
    // ... more fields
  ],
  layout: {
    columns: 2, // Number of columns on desktop
    mobileColumns: 1, // Number of columns on mobile
    gutter: [16, 16], // Horizontal and vertical spacing
  },
};

function MyForm() {
  const handleSubmit = (values: any) => {
    console.log(values);
  };

  return (
    <JsonFormGenerator
      schema={schema}
      onFinish={handleSubmit}
    />
  );
}
```

## Schema Definition

The form schema is defined using TypeScript interfaces. Here's an overview of the available field types and their properties:

### Common Field Properties
- `name`: Field name (required)
- `label`: Display label (required)
- `type`: Field type (required)
- `required`: Whether the field is required
- `span`: Number of columns this field should occupy (1-24)
- `rules`: Validation rules array

### Field Types
- `string`: Text input with optional min/max length
- `number`: Number input with optional min/max values
- `boolean`: Switch component
- `date`: Date picker with optional format
- `array`: Dynamic list of fields
- `object`: Nested form fields

## License

MIT
