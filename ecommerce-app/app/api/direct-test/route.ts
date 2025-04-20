import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

export async function GET(request: NextRequest) {
  try {
    // Use form1 by default
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId') || FORM_IDS.form1;
    
    console.log(`Running direct test submission to form ${formId}`);
    
    // Create form data exactly as shown in the successful submission
    const formData = new URLSearchParams();
    
    // API key
    formData.append('apiKey', API_KEY);
    
    // Add exactly the successful field values
    formData.append('submission[3]', 'deneme'); // Full Name
    formData.append('submission[4]', 'deneme'); // Address
    formData.append('submission[5]', 'Apple, Red\nQuantity: 1'); // Product list
    
    // Make the API request to Jotform
    console.log('Form data:', formData.toString());
    
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
    
    if (response.data.responseCode === 200 && response.data.content?.submissionID) {
      const submissionId = response.data.content.submissionID;
      
      // Wait for submission to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch and verify the submission
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
        message: 'Direct test submission completed',
        submissionId: submissionId,
        submissionData: verifyResponse.data.content,
        formData: {
          "3": "deneme",
          "4": "deneme",
          "5": "Apple, Red\nQuantity: 1"
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Direct test submission failed',
        error: response.data
      });
    }
  } catch (error) {
    console.error('Error in direct test:', error);
    
    let errorMessage = 'An error occurred during direct test submission';
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