'use client';

import React, { useState, useEffect } from 'react';
import { FORM_IDS } from '../api/jotform';
import { FiExternalLink, FiLoader, FiAlertCircle } from 'react-icons/fi';

interface FormField {
  id: string;
  name: string;
  type: string;
  text: string;
  [key: string]: any;
}

interface FormDetailsResponse {
  success: boolean;
  formId: string;
  fields: FormField[];
  message?: string;
  error?: any;
}

const FormDetailsPage: React.FC = () => {
  const [selectedFormId, setSelectedFormId] = useState<string>(Object.values(FORM_IDS)[0]);
  const [formDetails, setFormDetails] = useState<FormDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create a mapping of form IDs to readable names
  const formNames: Record<string, string> = {
    [FORM_IDS.form1]: '(Form 1)',
    [FORM_IDS.form2]: '(Form 2)',
    [FORM_IDS.form3]: '(Form 3)'
  };

  // Fetch form details when form ID changes
  useEffect(() => {
    const fetchFormDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/get-form-fields?formId=${selectedFormId}`);
        const data = await response.json();
        
        if (response.ok) {
          setFormDetails(data);
        } else {
          setError(data.message || 'Failed to fetch form details');
          console.error('API error:', data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormDetails();
  }, [selectedFormId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Jotform Form Details</h1>
      
      <div className="mb-6">
        <label htmlFor="formSelect" className="block text-sm font-medium text-gray-700 mb-2">
          Select a form:
        </label>
        <div className="flex gap-4 flex-wrap">
          {Object.values(FORM_IDS).map(formId => (
            <button
              key={formId}
              onClick={() => setSelectedFormId(formId)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedFormId === formId 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {formNames[formId] || `Form ${formId}`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Form ID: {selectedFormId}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            <a 
              href={`https://form.jotform.com/${selectedFormId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
            >
              View form on Jotform <FiExternalLink className="ml-1" />
            </a>
          </p>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <FiLoader className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-700">Loading form details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
              <div className="flex">
                <FiAlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && formDetails && (
            <>
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                <p>Found {formDetails.fields?.length || 0} fields in this form.</p>
                <p className="text-sm mt-1">These field IDs can be used to map form submissions correctly.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Field ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name/Text
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Suggested Map
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formDetails.fields?.map((field) => (
                      <tr key={field.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {field.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {field.text || field.name || 'Unnamed Field'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {field.type || 'unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getSuggestedFieldMapping(field)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Suggested Field Mapping</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-gray-800">
                  {generateFieldMappingCode(selectedFormId, formDetails.fields)}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to suggest a field mapping based on field name/type
function getSuggestedFieldMapping(field: FormField): string {
  const text = field.text?.toLowerCase() || '';
  const name = field.name?.toLowerCase() || '';
  const type = field.type?.toLowerCase() || '';
  
  if (text.includes('name') || name.includes('name')) {
    if (!text.includes('card') && !name.includes('card')) {
      return 'fullName';
    } else {
      return 'cardName';
    }
  }
  
  if (text.includes('address') || name.includes('address')) {
    return 'address';
  }
  
  if (text.includes('order') || text.includes('items') || name.includes('items')) {
    return 'items';
  }
  
  if (text.includes('subtotal') || name.includes('subtotal')) {
    return 'subtotal';
  }
  
  if (text.includes('shipping') || name.includes('shipping')) {
    return 'shipping';
  }
  
  if (text.includes('total') && !text.includes('sub') && !name.includes('sub')) {
    return 'total';
  }
  
  if ((text.includes('card') || name.includes('card')) && (text.includes('number') || name.includes('number'))) {
    return 'cardNumber';
  }
  
  if ((text.includes('expiry') || name.includes('expiry') || text.includes('expiration') || name.includes('expiration'))) {
    return 'cardExpiry';
  }
  
  return '?';
}

// Generate code snippet for field mapping
function generateFieldMappingCode(formId: string, fields: FormField[]): string {
  const mappings: Record<string, string> = {};
  
  fields.forEach(field => {
    const suggestion = getSuggestedFieldMapping(field);
    if (suggestion !== '?') {
      mappings[suggestion] = field.id;
    }
  });
  
  return `// Suggested field mapping for form ${formId}
const ${formId.replace(/[^a-zA-Z0-9_]/g, '_')}_MAPPING = {
  ${Object.entries(mappings).map(([key, value]) => `${key}: '${value}', // ${fields.find(f => f.id === value)?.text || 'Unknown field'}`).join('\n  ')}
};`;
}

export default FormDetailsPage; 