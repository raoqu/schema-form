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
  message,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { FormSchema, FormField, ImageField } from '../types/form';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { verifyJsonSchema } from '../utils/jsonSchemaVerifier';
import { RcFile } from 'antd/lib/upload';
import dayjs, { Dayjs } from 'dayjs';

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

  // Extract default values from schema
  const defaultValues = useMemo(() => {
    if (!schema) return {};
    return schema.fields.reduce((acc, field) => {
      if (field.defaultValue !== undefined) {
        // Convert date strings to moment objects for DatePicker
        if (field.type === 'date' && field.defaultValue) {
          acc[field.name] = dayjs(field.defaultValue);
        } else {
          acc[field.name] = field.defaultValue;
        }
      }
      if (field.type === 'object' && field.properties) {
        Object.entries(field.properties).forEach(([key, prop]) => {
          if (prop.defaultValue !== undefined) {
            // Convert date strings to moment objects for DatePicker
            if (prop.type === 'date' && prop.defaultValue) {
              acc[key] = dayjs(prop.defaultValue);
            } else {
              acc[key] = prop.defaultValue;
            }
          }
        });
      }
      return acc;
    }, {} as Record<string, any>);
  }, [schema]);

  useEffect(() => {
    const values = {
      ...defaultValues,
      ...initialValues,
    };
    if (Object.keys(values).length > 0) {
      form.setFieldsValue(values);
    }
  }, [form, defaultValues, initialValues]);

  if (error || !schema) {
    return <div style={{ color: 'red' }}>{error || 'Invalid schema'}</div>;
  }

  const renderField = (field: FormField, parentField?: string): React.ReactNode => {
    switch (field.type) {
      case 'string':
        return (
          <Input
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
          />
        );

      case 'date':
        return (
          <DatePicker
            style={{ width: '100%' }}
            format={field.format || 'YYYY-MM-DD'}
            placeholder={`选择${field.label}`}
            showTime={field.showTime}
            onChange={(date) => {
              // Convert to ISO string for form value
              if (date) {
                const value = date.toISOString();
                form.setFieldValue(field.name, value);
              }
            }}
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
          <Radio.Group 
            options={field.options}
            style={{ display: 'flex', alignItems: 'center' }}
          />
        );

      case 'checkbox':
        return (
          <Checkbox />
        );

      case 'array':
        return (
          <Form.List name={field.name}>
            {(fields, { add, remove }, { errors }) => (
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
                                  name: [name, propKey],
                                  label: prop.label,
                                },
                                field.name
                              )}
                            </Col>
                          ))}
                        </Row>
                      </Card>
                    ) : (
                      renderFormItem(
                        {
                          ...field.items,
                          name: [name, field.items.name || 'item'],
                          label: field.items.label,
                        },
                        field.name
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

      case 'image':
        const beforeUpload = (file: RcFile) => {
          const isValidType = (field as ImageField).accept ? 
            (field as ImageField).accept?.split(',').some(type => 
              file.type === type.trim() || file.type.startsWith(type.trim().replace('*', ''))
            ) : true;
          
          const isValidSize = (field as ImageField).maxSize ? 
            file.size / 1024 / 1024 < (field as ImageField).maxSize! : true;

          if (!isValidType) {
            message.error('请上传正确的文件类型!');
            return Upload.LIST_IGNORE;
          }

          if (!isValidSize) {
            message.error(`文件大小不能超过 ${(field as ImageField).maxSize}MB!`);
            return Upload.LIST_IGNORE;
          }

          return true;
        };

        const normFile = (e: any) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e?.fileList;
        };

        return (
          <Upload
            listType={(field as ImageField).listType || 'picture-card'}
            maxCount={(field as ImageField).maxCount}
            multiple={(field as ImageField).multiple}
            accept={(field as ImageField).accept}
            beforeUpload={beforeUpload}
            customRequest={({ onSuccess }) => {
              setTimeout(() => {
                onSuccess?.("ok");
              }, 0);
            }}
          >
            {(!field.maxCount || field.maxCount > 1) && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            )}
          </Upload>
        );

      case 'upload':
        const uploadProps = {
          name: 'file',
          listType: field.listType || 'picture-card',
          maxCount: field.maxCount,
          multiple: field.multiple,
          accept: field.accept,
          beforeUpload: (file: RcFile) => {
            const isValidType = field.accept ? 
              field.accept.split(',').some(type => 
                file.type === type.trim() || file.type.startsWith(type.trim().replace('*', ''))
              ) : true;
            
            const isValidSize = field.maxSize ? 
              file.size / 1024 / 1024 < field.maxSize : true;

            if (!isValidType) {
              message.error('请上传正确的文件类型!');
              return Upload.LIST_IGNORE;
            }

            if (!isValidSize) {
              message.error(`文件大小不能超过 ${field.maxSize}MB!`);
              return Upload.LIST_IGNORE;
            }

            return true;
          },
          customRequest: ({ onSuccess }: any) => {
            setTimeout(() => {
              onSuccess?.("ok");
            }, 0);
          }
        };

        return (
          <Upload {...uploadProps}>
            {(!field.maxCount || field.maxCount > 1) && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            )}
          </Upload>
        );

      default:
        return null;
    }
  };

  const renderFormItem = (field: FormField, parentField?: string): React.ReactNode => {
    const fieldName = Array.isArray(field.name) ? field.name : parentField ? [parentField, field.name] : field.name;
    const formItemProps = {
      label: field.label,
      name: fieldName,
      rules: field.rules || [
        ...(field.required ? [{ required: true, message: `请输入${field.label}` }] : []),
        ...(field.type === 'number' ? [{ type: 'number', min: field.min, max: field.max, message: `${field.label}必须在${field.min}到${field.max}之间` }] : []),
        ...(field.type === 'email' ? [{ type: 'email', message: '请输入有效的邮箱地址' }] : []),
        ...(field.type === 'date' ? [{ 
          type: 'date',
          transform: (value: any) => {
            if (value) {
              return dayjs(value);
            }
            return value;
          }
        }] : [])
      ],
      required: field.required,
      labelCol: field.newline ? undefined : { flex: '100px' },
      wrapperCol: field.newline ? undefined : { flex: 1 },
      'data-newline': field.newline,
      ...(field.type === 'checkbox' ? { valuePropName: 'checked' } : {}),
      ...(field.type === 'upload' ? { 
        valuePropName: 'fileList',
        getValueFromEvent: (e: any) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e?.fileList;
        }
      } : {})
    };

    const content = (
      <Form.Item {...formItemProps}>
        {renderField(field)}
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

  const handleFormFinish = (values: any) => {
    console.log('SchemaForm onFinish:', values);
    if (onFinish) {
      onFinish(values);
    }
  };

  const handleFormFinishFailed = (errorInfo: any) => {
    console.log('Form validation failed:', errorInfo);
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={handleFormFinish}
      onFinishFailed={handleFormFinishFailed}
      initialValues={initialValues}
      labelAlign="right"
      size="middle"
      validateMessages={{
        required: '${label} 是必填项',
        types: {
          email: '请输入有效的邮箱地址',
          number: '请输入有效的数字',
        },
        number: {
          range: '${label} 必须在 ${min} 和 ${max} 之间',
        },
      }}
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
