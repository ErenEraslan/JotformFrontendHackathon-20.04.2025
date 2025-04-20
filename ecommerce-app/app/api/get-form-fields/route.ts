import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a'; // Jotform API key
const BASE_URL = 'https://api.jotform.com';

// This is a utility endpoint to fetch form fields from Jotform
// It will help us understand the form structure and field IDs
export async function GET(request: NextRequest) {
  try {
    // Get the form ID from the query string
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId') || FORM_IDS.form1;
    
    // Fetch form questions from Jotform API
    const response = await axios.get(`${BASE_URL}/form/${formId}/questions?apiKey=${API_KEY}`);
    
    if (response.data && response.data.content) {
      // Transform the response to a more usable format
      const fields = Object.entries(response.data.content).map(([id, field]: [string, any]) => {
        return {
          id,
          name: field.name || field.text || `Question ${id}`,
          type: field.type || 'unknown',
          text: field.text || '',
          ...field
        };
      });
      
      return NextResponse.json({
        success: true,
        formId,
        fields
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No form fields found',
        raw: response.data
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching form fields:', error);
    
    let errorMessage = 'Server error';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (axios.isAxiosError(error)) {
        errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        };
      }
    }
    
    return NextResponse.json({
      success: false,
      message: errorMessage,
      error: errorDetails
    }, { status: 500 });
  }
} 