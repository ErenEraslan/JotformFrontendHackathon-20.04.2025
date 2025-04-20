'use client';

import React, { useState } from 'react';
import { useJotform } from '../hooks/useJotform';

interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: Array<{ value: string; text: string }>;
}

interface FormData {
  [key: string]: string;
}

export const JotformSubmitter: React.FC<{ formId: string }> = ({ formId }) => {
  const { formFields: apiFormFields, loading, error, submitForm, fetchFormFields } = useJotform();
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Cast to our local FormField type that includes options
  const formFields = apiFormFields as FormField[] | null;

  React.useEffect(() => {
    if (formId) {
      fetchFormFields(formId);
    }
  }, [formId, fetchFormFields]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      const result = await submitForm({
        formId,
        fields: formData,
      });
      
      if (result.success) {
        setSubmitSuccess(true);
        setFormData({});
      } else {
        setSubmitError(result.message || 'Submission failed');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading form fields...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!formFields?.length) {
    return <div className="p-4">No form fields available for this form.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Submit Form</h1>
      
      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Form submitted successfully!
        </div>
      )}
      
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {formFields.map((field) => (
          <div key={field.id} className="mb-4">
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
              {field.name} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            )}
            
            {field.type === 'dropdown' && (
              <select
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select an option</option>
                {field.options?.map((option: { value: string; text: string }) => (
                  <option key={option.value} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </div>
  );
}; 