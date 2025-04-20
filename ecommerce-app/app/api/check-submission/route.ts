import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

export async function GET(request: NextRequest) {
  // Get the submissionId from the query params
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get('id');

  if (!submissionId) {
    return NextResponse.json(
      { success: false, message: 'Submission ID is required' },
      { status: 400 }
    );
  }

  try {
    console.log(`Checking submission with ID: ${submissionId}`);
    
    // Make the API request to Jotform to get submission data
    const response = await axios.get(
      `${BASE_URL}/submission/${submissionId}`,
      {
        params: {
          apiKey: API_KEY
        }
      }
    );

    console.log('Jotform submission data response:', JSON.stringify(response.data, null, 2));

    if (response.data.responseCode === 200 && response.data.content) {
      return NextResponse.json({
        success: true,
        submission: response.data.content
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to retrieve submission data',
        error: response.data
      });
    }
  } catch (error) {
    console.error('Error retrieving submission:', error);
    
    let errorMessage = 'An error occurred while retrieving submission data';
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