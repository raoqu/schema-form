import { FormSchema } from '../types/form';

export const defaultSchema: FormSchema = {
  fields: [
    {
      name: 'personalInfo',
      label: 'Personal Information',
      type: 'object',
      card: {
        title: '基础信息',
        bordered: true,
        size: 'default',
      },
      properties: {
        name: {
          name: 'name',
          label: 'Name',
          type: 'string',
          required: true,
          defaultValue: 'John Doe',
          rules: [{ required: true, message: 'Please input your name!' }],
        },
        age: {
          name: 'age',
          label: 'Age',
          type: 'number',
          required: true,
          min: 0,
          max: 150,
          step: 1,
          defaultValue: 25,
        },
        birthDate: {
          name: 'birthDate',
          label: 'Birth Date',
          type: 'date',
          format: 'YYYY-MM-DD',
          defaultValue: '2000-01-01',
          required: true,
        },
        gender: {
          name: 'gender',
          label: 'Gender',
          type: 'radio',
          required: true,
          defaultValue: 'male',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
          ],
        },
      },
    },
    {
      name: 'contactMethods',
      label: 'Contact Methods',
      type: 'array',
      card: {
        title: '联系方式',
        bordered: true,
        size: 'default',
      },
      items: {
        name: 'contactMethod',
        type: 'object',
        properties: {
          type: {
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { label: 'Email', value: 'email' },
              { label: 'Phone', value: 'phone' },
              { label: 'WeChat', value: 'wechat' },
              { label: 'WhatsApp', value: 'whatsapp' },
            ],
          },
          value: {
            name: 'value',
            label: 'Value',
            type: 'string',
            required: true,
            placeholder: 'Enter contact details',
          },
          preferred: {
            name: 'preferred',
            label: 'Preferred',
            type: 'checkbox',
            defaultValue: false,
          },
        },
      },
      defaultValue: [
        {
          type: 'email',
          value: 'john@example.com',
          preferred: true,
        },
        {
          type: 'phone',
          value: '+1 (234) 567-8900',
          preferred: false,
        },
      ],
    },
    {
      name: 'preferences',
      label: 'Preferences',
      type: 'object',
      card: {
        title: '偏好设置',
        bordered: true,
        size: 'default',
      },
      properties: {
        subscribe: {
          name: 'subscribe',
          label: 'Subscribe to newsletter',
          type: 'checkbox',
          defaultValue: true,
        },
        interests: {
          name: 'interests',
          label: 'Interests',
          type: 'select',
          mode: 'multiple',
          placeholder: 'Select your interests',
          defaultValue: ['sports', 'music'],
          newline: true,
          options: [
            { label: 'Sports', value: 'sports' },
            { label: 'Music', value: 'music' },
            { label: 'Reading', value: 'reading' },
            { label: 'Travel', value: 'travel' },
          ],
        },
        bio: {
          name: 'bio',
          label: 'Biography',
          type: 'string',
          required: false,
          placeholder: 'Tell us about yourself',
          newline: true,
        },
      },
    },
  ],
  layout: {
    columns: 2,
    gutter: [16, 16],
  },
};
