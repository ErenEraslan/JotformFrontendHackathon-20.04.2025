'use client';

import React, { useState } from 'react';
import { FORM_IDS } from '../../api/jotform';
import { FiSend, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';

interface TestSubmission {
  formId: string;
  fields: Record<string, string>;
}

interface SubmissionResult {
  success: boolean;
  message: string;
  orderId?: string;
  formId?: string;
  error?: any;
}

const TestSubmitPage: React.FC = () => {
  const [selectedFormId, setSelectedFormId] = useState<string>(Object.values(FORM_IDS)[0]);
  const [fields, setFields] = useState<Record<string, string>>({
    '3': 'Test User',
    '4': '123 Test Street, Test City',
    '5': 'Test Product (1 x $10.00)',
    '6': '10.00',
    '7': '4.99',
    '8': '14.99',
    '9': 'Test User',
    '10': 'xxxx-xxxx-xxxx-1234',
    '11': '12/25'
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  // Create a mapping of form IDs to readable names
  const formNames: Record<string, string> = {
    [FORM_IDS.form1]: 'Electronics Store (Form 1)',
    [FORM_IDS.form2]: 'Fashion Shop (Form 2)',
    [FORM_IDS.form3]: 'Home Goods (Form 3)'
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const addNewField = () => {
    const newFields = { ...fields };
    let newFieldId = '12'; // Start with a reasonable default
    
    // Find an ID that doesn't exist yet
    while (newFieldId in newFields) {
      newFieldId = String(parseInt(newFieldId) + 1);
    }
    
    newFields[newFieldId] = '';
    setFields(newFields);
  };

  const removeField = (fieldId: string) => {
    const newFields = { ...fields };
    delete newFields[fieldId];
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    
    try {
      // Create a test submission
      const testSubmission: TestSubmission = {
        formId: selectedFormId,
        fields: fields
      };
      
      // Call our API to make the submission
      const response = await fetch('/api/test-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testSubmission),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        error: error instanceof Error ? error.toString() : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Form Submission</h1>
      <p className="text-gray-600 mb-6">
        Use this page to test direct submissions to Jotform forms
      </p>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Form:
          </label>
          <div className="flex flex-wrap gap-3">
            {Object.entries(FORM_IDS).map(([key, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedFormId(id)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedFormId === id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {formNames[id] || key}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Form ID: {selectedFormId}
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-900">Form Fields</h2>
            <button
              type="button"
              onClick={addNewField}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Field
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-600">
              Field IDs correspond to question IDs in the Jotform form.
              View the Form Details page to see the field mappings for each form.
            </p>
          </div>
          
          <div className="space-y-4">
            {Object.entries(fields).map(([id, value]) => (
              <div key={id} className="flex items-center space-x-4">
                <div className="w-16">
                  <label className="block text-sm font-medium text-gray-700">
                    ID {id}
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFieldChange(id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeField(id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Submit to Jotform
              </>
            )}
          </button>
        </div>
      </form>
      
      {result && (
        <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex">
            {result.success ? (
              <FiCheckCircle className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
            )}
            <div>
              <h3 className={`text-lg font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'Submission Successful' : 'Submission Failed'}
              </h3>
              <p className={`mt-2 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
              
              {result.success && result.orderId && (
                <p className="mt-1 text-sm text-green-700">
                  Order ID: {result.orderId}
                </p>
              )}
              
              {!result.success && result.error && (
                <details className="mt-2">
                  <summary className="text-sm text-red-800 cursor-pointer">Error Details</summary>
                  <pre className="mt-1 text-xs text-red-700 p-2 bg-red-100 rounded overflow-auto">
                    {typeof result.error === 'object' 
                      ? JSON.stringify(result.error, null, 2) 
                      : result.error}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSubmitPage; 