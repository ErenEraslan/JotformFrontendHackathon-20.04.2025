import { useState, useCallback } from 'react';
import axios from 'axios';

interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

interface Form {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  count: number;
}

interface SubmitFormData {
  formId: string;
  fields: Record<string, any>;
}

interface UseJotformReturn {
  forms: Form[] | null;
  formFields: FormField[] | null;
  loading: boolean;
  error: string | null;
  fetchForms: () => Promise<void>;
  fetchFormFields: (formId: string) => Promise<void>;
  submitForm: (data: SubmitFormData) => Promise<{ success: boolean; message?: string }>;
}

export const useJotform = (): UseJotformReturn => {
  const [forms, setForms] = useState<Form[] | null>(null);
  const [formFields, setFormFields] = useState<FormField[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/forms');
      
      if (response.data.success) {
        setForms(response.data.forms);
      } else {
        setError(response.data.message || 'Failed to fetch forms');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching forms');
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFormFields = useCallback(async (formId: string) => {
    if (!formId) {
      setError('Form ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/forms?formId=${formId}`);
      
      if (response.data.success) {
        setFormFields(response.data.fields);
      } else {
        setError(response.data.message || 'Failed to fetch form fields');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching form fields');
      console.error('Error fetching form fields:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitForm = useCallback(async ({ formId, fields }: SubmitFormData) => {
    if (!formId) {
      return { success: false, message: 'Form ID is required' };
    }

    if (!fields || Object.keys(fields).length === 0) {
      return { success: false, message: 'Form fields are required' };
    }

    try {
      const response = await axios.post('/api/test-submit', {
        formId,
        fields
      });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (err) {
      console.error('Error submitting form:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'An error occurred while submitting the form'
      };
    }
  }, []);

  return {
    forms,
    formFields,
    loading,
    error,
    fetchForms,
    fetchFormFields,
    submitForm
  };
}; 