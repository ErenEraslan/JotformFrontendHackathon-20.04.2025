import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Use the same API key as in submit-order route
const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, fields } = body;

    if (!formId) {
      return NextResponse.json(
        { success: false, message: 'Form ID is required' },
        { status: 400 }
      );
    }

    if (!fields || Object.keys(fields).length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one field is required' },
        { status: 400 }
      );
    }

    // Detailed logging to help diagnose issues
    console.log(`Submitting to form ${formId}`);
    console.log('Field data:', JSON.stringify(fields, null, 2));

    // Create FormData object for submission - Jotform expects form data, not URL params
    const formData = new URLSearchParams();
    
    // Add API key to form data
    formData.append('apiKey', API_KEY);
    
    // Add each field to the submission data with proper format
    Object.entries(fields).forEach(([fieldId, value]) => {
      formData.append(`submission[${fieldId}]`, String(value));
    });
    
    // Log the full request details for debugging
    console.log('Submission URL:', `${BASE_URL}/form/${formId}/submissions`);
    console.log('Form data:', formData.toString());

    // Extra debug log for exact request content
    console.log('--------- EXACT REQUEST DATA --------');
    console.log('URL:', `${BASE_URL}/form/${formId}/submissions`);
    console.log('Method: POST');
    console.log('Headers:', { 'Content-Type': 'application/x-www-form-urlencoded' });
    console.log('Body:', formData.toString());
    console.log('-------------------------------------');

    // Make the API request to Jotform - using form data approach correctly
    const response = await axios.post(
      `${BASE_URL}/form/${formId}/submissions`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Jotform API response:', JSON.stringify(response.data, null, 2));

    if (response.data.responseCode === 200 && response.data.content?.submissionID) {
      const submissionId = response.data.content.submissionID;
      
      // Wait for submission to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch and verify the submission to get full details including answers
      const verifyResponse = await axios.get(
        `${BASE_URL}/submission/${submissionId}`,
        {
          params: {
            apiKey: API_KEY
          }
        }
      );
      
      console.log('Verification response:', JSON.stringify(verifyResponse.data, null, 2));
      
      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully',
        orderId: submissionId,
        formId: formId,
        submissionDetails: verifyResponse.data.content
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Form submission failed',
        error: response.data
      });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    
    let errorMessage = 'An error occurred during form submission';
    let errorDetails = null;

    if (axios.isAxiosError(error)) {
      errorMessage = error.message;
      errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      };
      
      // Log the request that failed
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