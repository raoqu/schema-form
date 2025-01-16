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
          rules: [
            { required: true, message: 'Please input your age!' },
            { type: 'number', min: 0, max: 150, message: 'Age must be between 0 and 150' }
          ],
        },
        birthDate: {
          name: 'birthDate',
          label: 'Birth Date',
          type: 'date',
          format: 'YYYY-MM-DD',
          defaultValue: '2000-01-01',
          required: true,
          rules: [{ required: true, message: 'Please select your birth date!' }],
        },
        gender: {
          name: 'gender',
          label: 'Gender',
          type: 'radio',
          required: true,
          defaultValue: 'male',
          rules: [{ required: true, message: 'Please select your gender!' }],
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
      label: '联系方式',
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
            rules: [{ required: true, message: 'Please select contact type!' }],
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
      name: 'photos',
      label: '相册',
      type: 'upload',
      required: false,
      maxCount: 5,
      maxSize: 5, // 5MB per image
      accept: 'image/png,image/jpeg',
      listType: 'picture-card',
      multiple: true,
    },
     {
      name: 'subscribe',
      label: '订阅邮件',
      type: 'checkbox',
      defaultValue: true,
    },
     {
      name: 'interests',
      label: '兴趣爱好',
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
  ],
  layout: {
    columns: 2,
    gutter: [16, 16],
  },
};
