import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

// Jotform API configuration
const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    let { formId, fields } = body;

    // Use default form if not provided
    if (!formId) {
      formId = FORM_IDS.form1;
      console.log(`No form ID provided, using default: ${formId}`);
    }

    // Validate fields
    if (!fields || Object.keys(fields).length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one field is required' },
        { status: 400 }
      );
    }

    console.log(`Submitting to form: ${formId}`);
    console.log('Fields data:', JSON.stringify(fields, null, 2));

    // Create form data using URLSearchParams (works well with axios)
    const formData = new URLSearchParams();
    
    // Add API key as a parameter (not as form field)
    formData.append('apiKey', API_KEY);
    
    // Add each field with the correct format for Jotform
    Object.entries(fields).forEach(([fieldId, value]) => {
      // Special handling for product fields which might contain arrays in JSON format
      if (fieldId.includes('[') && typeof value === 'string') {
        try {
          // Try to parse as JSON in case it's a stringified array or object
          const parsedValue = JSON.parse(value);
          
          // If it's an array or object containing an array, handle specially
          if (Array.isArray(parsedValue) || (typeof parsedValue === 'object' && parsedValue !== null)) {
            console.log(`Adding product field with complex data: submission[${fieldId}]`);
            
            // For arrays or objects with arrays, keep as JSON string
            formData.append(`submission[${fieldId}]`, value);
            return;
          }
        } catch (e) {
          // Not JSON, proceed as normal string
        }
      }
      
      console.log(`Adding field: submission[${fieldId}] = ${value}`);
      formData.append(`submission[${fieldId}]`, String(value));
    });

    // Log request details
    console.log('Request URL:', `${BASE_URL}/form/${formId}/submissions`);
    console.log('Form data:', formData.toString());

    // Submit to Jotform
    // NOTE: Do not convert formData to string when passing to axios
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/form/${formId}/submissions`,
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Jotform response:', JSON.stringify(response.data, null, 2));

    // Process response
    if (response.data && response.data.responseCode === 200 && response.data.content?.submissionID) {
      const submissionId = response.data.content.submissionID;
      
      // Give Jotform time to process the submission
      console.log('Waiting for submission to be processed...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the complete submission details
      console.log(`Fetching details for submission ${submissionId}`);
      const detailsResponse = await axios({
        method: 'get',
        url: `${BASE_URL}/submission/${submissionId}`,
        params: {
          apiKey: API_KEY
        }
      });
      
      console.log('Submission details:', JSON.stringify(detailsResponse.data, null, 2));
      
      // Return success response with full details
      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully',
        submissionId,
        formId,
        submissionDetails: detailsResponse.data.content
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Form submission failed',
        response: response.data
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    
    // Prepare error response
    let errorMessage = 'An error occurred during form submission';
    let errorDetails = null;

    if (axios.isAxiosError(error)) {
      errorMessage = error.message;
      errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      };
      console.error('Failed request config:', error.config);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: errorDetails || String(error)
      },
      { status: 500 }
    );
  }
} 