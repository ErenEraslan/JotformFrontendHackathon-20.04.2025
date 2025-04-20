import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

export async function POST(request: NextRequest) {
  try {
    // Parse request for custom test data or use default
    let formId = FORM_IDS.form1; // Default to form1 for testing
    let testData: Record<string, string> = {};
    
    try {
      const body = await request.json();
      if (body.formId) formId = body.formId;
      if (body.fields && Object.keys(body.fields).length > 0) {
        testData = body.fields;
      }
    } catch (e) {
      // Use default test data if request body can't be parsed
      console.log('Using default test data');
    }
    
    // If no custom test data provided, use default that matches the successful submission
    if (Object.keys(testData).length === 0) {
      testData = {
        // Based on successful submission shown in the image
        "3": "Test Customer", // Full Name field
        "4": "123 Test Street, Test City", // Address field
        "5": "Apple, Red\nQuantity: 1", // Product list field
        // Add other fields if needed
        "6": "9.99", // Subtotal
        "7": "4.99", // Shipping
        "8": "14.98" // Total
      };
    }
    
    console.log(`Submitting debug test to form ${formId}`);
    console.log('Test data:', JSON.stringify(testData, null, 2));

    // Get form questions to verify field IDs
    const questionsResponse = await axios.get(
      `${BASE_URL}/form/${formId}/questions`,
      {
        params: {
          apiKey: API_KEY
        }
      }
    );
    
    if (questionsResponse.data.responseCode === 200) {
      const questions = questionsResponse.data.content;
      console.log('Form questions:', Object.entries(questions).map(([id, q]: [string, any]) => 
        `${id}: ${q.text || q.name || 'Unnamed'} (${q.type || 'unknown'})`
      ));
    }

    // Create FormData object for submission
    const formData = new URLSearchParams();
    
    // Add API key to form data
    formData.append('apiKey', API_KEY);
    
    // Add each field to the submission data with proper format
    Object.entries(testData).forEach(([fieldId, value]) => {
      formData.append(`submission[${fieldId}]`, String(value));
    });
    
    // Log the full request details for debugging
    console.log('Submission URL:', `${BASE_URL}/form/${formId}/submissions`);
    console.log('Form data:', formData.toString());

    // Make the API request to Jotform
    const response = await axios.post(
      `${BASE_URL}/form/${formId}/submissions`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Jotform API response:', JSON.stringify(response.data, null, 2));

    // If successful, let's also check the submission data
    if (response.data.responseCode === 200 && response.data.content?.submissionID) {
      const submissionId = response.data.content.submissionID;
      
      // Wait a moment for the submission to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch the submission data to verify it was submitted correctly
      const submissionResponse = await axios.get(
        `${BASE_URL}/submission/${submissionId}`,
        {
          params: {
            apiKey: API_KEY
          }
        }
      );
      
      console.log('Submission data:', JSON.stringify(submissionResponse.data, null, 2));
      
      return NextResponse.json({
        success: true,
        message: 'Debug submission successful',
        orderId: submissionId,
        formId: formId,
        submissionData: submissionResponse.data.content,
        sentData: testData
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Debug submission failed',
        error: response.data
      });
    }
  } catch (error) {
    console.error('Error in debug submission:', error);
    
    let errorMessage = 'An error occurred during debug submission';
    let errorDetails = null;

    if (axios.isAxiosError(error)) {
      errorMessage = error.message;
      errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      };
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