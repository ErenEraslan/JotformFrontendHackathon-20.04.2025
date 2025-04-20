'use client';

import React, { useEffect, useState } from 'react';
import { useJotform } from '../hooks/useJotform';

interface JotformViewerProps {
  onSelectForm?: (formId: string) => void;
}

export const JotformViewer: React.FC<JotformViewerProps> = ({ onSelectForm }) => {
  const { forms, formFields, loading, error, fetchForms, fetchFormFields } = useJotform();
  const [selectedFormId, setSelectedFormId] = useState<string>('');

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId);
    fetchFormFields(formId);
    if (onSelectForm) {
      onSelectForm(formId);
    }
  };

  if (loading && !forms) {
    return <div className="p-4">Loading forms...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Jotform Viewer</h1>
      
      {/* Form selector */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Select a Form</h2>
        <select 
          className="w-full p-2 border rounded"
          value={selectedFormId}
          onChange={(e) => handleFormSelect(e.target.value)}
        >
          <option value="">-- Select a form --</option>
          {forms?.map((form) => (
            <option key={form.id} value={form.id}>
              {form.title}
            </option>
          ))}
        </select>
      </div>

      {/* Form fields */}
      {selectedFormId && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Form Fields</h2>
          {loading ? (
            <div>Loading fields...</div>
          ) : (
            <div className="border rounded p-4">
              {formFields?.length ? (
                <ul className="divide-y">
                  {formFields.map((field) => (
                    <li key={field.id} className="py-2">
                      <div className="font-medium">{field.name}</div>
                      <div className="text-sm text-gray-500">
                        Type: {field.type} | 
                        {field.required ? (
                          <span className="text-red-500"> Required</span>
                        ) : (
                          <span> Optional</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No fields found for this form.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 