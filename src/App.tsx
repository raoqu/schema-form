import React, { useState } from 'react';
import JsonFormGenerator from './components/JsonFormGenerator';
import { defaultSchema } from './schemas/defaultSchema';
import './App.css';

function App() {
  const [schema, setSchema] = useState(defaultSchema);

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values);
  };

  return (
    <div className="app-container" style={{ 
      padding: '2rem', 
      margin: '0 auto',
      width: '100%',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <h1>JSON Form Generator Demo</h1>
      <JsonFormGenerator
        schema={schema}
        onFinish={handleFormSubmit}
      />
    </div>
  );
}

export default App;