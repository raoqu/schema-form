import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import Editor from "@monaco-editor/react";
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import SchemaForm from './SchemaForm';
import { FormSchema } from '../types/form';

interface JsonFormGeneratorProps {
  schema: FormSchema;
  onFinish?: (values: any) => void;
  initialValues?: any;
}

const JsonFormGenerator: React.FC<JsonFormGeneratorProps> = ({
  schema,
  onFinish,
  initialValues,
}) => {
  const [jsonString, setJsonString] = useState<string>('');
  const [editingSchema, setEditingSchema] = useState<string>('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const formattedSchema = JSON.stringify(schema, null, 2);
    setEditingSchema(formattedSchema);
    setJsonString(formattedSchema);
  }, [schema]);

  const handleSchemaEdit = () => {
    setJsonString(editingSchema);
  };

  const handleEditorChange = (value: string | undefined) => {
    setEditingSchema(value || '');
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleFormFinish = (values: any) => {
    console.log('JsonFormGenerator onFinish:', values);
    setResult(values);
    if (onFinish) {
      onFinish(values);
    }
  };

  return (
    <div>
      <div className={`editor-container ${isMaximized ? 'maximized' : ''}`}>
        <div className="editor-wrapper">
          <Editor
            height="100%"
            defaultLanguage="json"
            value={editingSchema}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              formatOnPaste: true,
              formatOnType: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        <Button
          className="maximize-button"
          icon={isMaximized ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={toggleMaximize}
        />
      </div>
      {!isMaximized && (
        <>
          <Button 
            type="primary" 
            onClick={handleSchemaEdit}
            style={{ marginTop: '16px' }}
          >
            Update Form
          </Button>
          <div style={{ marginTop: '16px' }}>
            <SchemaForm jsonSchema={jsonString} onFinish={handleFormFinish} initialValues={initialValues} />
          </div>
          {result && (
            <div className="result-json">
              <div className="title">表单数据</div>
              <pre>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JsonFormGenerator;
