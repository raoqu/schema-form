import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Switch, 
  DatePicker, 
  Row, 
  Col, 
  Button,
  Radio,
  Select,
  Checkbox,
  Upload,
  Card,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { FormSchema, FormField } from '../types/form';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { verifyJsonSchema } from '../utils/jsonSchemaVerifier';
import { RcFile } from 'antd/lib/upload';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { TextArea } = Input;

interface SchemaFormProps {
  jsonSchema: string;
  onFinish?: (values: any) => void;
  initialValues?: any;
}

const SchemaForm: React.FC<SchemaFormProps> = ({
  jsonSchema,
  onFinish,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const schemaRef = useRef<FormSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const schema = useMemo(() => {
    try {
      const result = verifyJsonSchema(jsonSchema);
      if (result.isValid) {
        schemaRef.current = result.schema;
        setError(null);
        return result.schema;
      } else {
        setError(result.error || 'Invalid schema');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse schema');
      return null;
    }
  }, [jsonSchema]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  if (error || !schema) {
    return <div style={{ color: 'red' }}>{error || 'Invalid schema'}</div>;
  }

  const renderField = (field: FormField, parentField?: string): React.ReactNode => {
    const fieldName = parentField ? [parentField, field.name] : field.name;

    switch (field.type) {
      case 'string':
        return <Input placeholder={field.placeholder} />;

      case 'number':
        return (
          <InputNumber
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );

      case 'date':
        return (
          <DatePicker
            format={field.format}
            showTime={field.showTime}
            style={{ width: '100%' }}
          />
        );

      case 'select':
        return (
          <Select
            mode={field.mode}
            options={field.options}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
          />
        );

      case 'radio':
        return (
          <Radio.Group options={field.options} />
        );

      case 'checkbox':
        return (
          <Checkbox>{field.label}</Checkbox>
        );

      case 'array':
        return (
          <Form.List name={fieldName}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: 8,
                    }}>
                      <div style={{ flex: 1, fontWeight: 500 }}>
                        {field.label} {index + 1}
                      </div>
                      <Button 
                        type="text" 
                        danger 
                        onClick={() => remove(name)}
                        icon={<MinusCircleOutlined />}
                      >
                        删除
                      </Button>
                    </div>
                    {field.items.type === 'object' && field.items.properties ? (
                      <Card size="small" bordered>
                        <Row gutter={[12, 0]}>
                          {Object.entries(field.items.properties).map(([propKey, prop]) => (
                            <Col 
                              key={propKey} 
                              xs={24} 
                              sm={prop.type === 'checkbox' ? 8 : 12}
                            >
                              {renderFormItem(
                                { 
                                  ...prop,
                                  name: propKey,
                                },
                                `${fieldName}.${name}`
                              )}
                            </Col>
                          ))}
                        </Row>
                      </Card>
                    ) : (
                      renderFormItem(
                        { 
                          ...field.items,
                          name: field.items.name || 'item',
                        },
                        `${fieldName}.${name}`
                      )
                    )}
                  </div>
                ))}
                <Form.Item className="array-field-add">
                  <Button 
                    type="dashed" 
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ height: 32 }}
                  >
                    添加
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );

      default:
        return null;
    }
  };

  const renderFormItem = (field: FormField, parentField?: string): React.ReactNode => {
    const fieldName = parentField ? [parentField, field.name] : field.name;
    const formItemProps = {
      label: field.label,
      name: fieldName,
      rules: field.rules,
      required: field.required,
      labelCol: field.newline ? undefined : { flex: '100px' },
      wrapperCol: field.newline ? undefined : { flex: 1 },
      'data-newline': field.newline,
    };

    const content = (
      <Form.Item {...formItemProps}>
        {renderField(field, parentField)}
      </Form.Item>
    );

    if (field.card) {
      return (
        <Card
          title={field.card.title || field.label}
          size={field.card.size}
          bordered={field.card.bordered}
          extra={field.card.extra}
        >
          {field.card.description && (
            <p style={{ marginBottom: 12 }}>{field.card.description}</p>
          )}
          {field.type === 'object' ? (
            <Row gutter={[12, 0]}>
              {Object.entries(field.properties).map(([key, prop]) => {
                const colSpan = prop.newline ? 24 : (24 / (schema.layout?.columns || 1));
                return (
                  <Col
                    key={key}
                    xs={24}
                    sm={colSpan}
                  >
                    {renderFormItem({ ...prop, name: key }, parentField)}
                  </Col>
                );
              })}
            </Row>
          ) : (
            content
          )}
        </Card>
      );
    }

    return content;
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={onFinish}
      initialValues={initialValues}
      labelAlign="right"
      size="middle"
    >
      <div>
        {schema.fields.map((field) => (
          <div key={field.name}>
            {renderFormItem(field)}
          </div>
        ))}
      </div>
      {onFinish && (
        <Form.Item className="form-submit">
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default SchemaForm;
