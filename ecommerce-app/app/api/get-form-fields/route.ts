import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

// Jotform API configuration
const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const formId = searchParams.get('formId');

    if (!formId) {
      return NextResponse.json({
        success: false,
        message: 'Form ID is required'
      }, { status: 400 });
    }

    if (!Object.values(FORM_IDS).includes(formId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid Form ID'
      }, { status: 400 });
    }

    // Fetch form questions from Jotform API
    const response = await axios.get(`${BASE_URL}/form/${formId}/questions?apiKey=${API_KEY}`);
    
    // Check response status
    if (response.data && response.data.responseCode === 200) {
      const questions = response.data.content || {};
      
      // Transform the questions object into an array of fields
      const fields = Object.entries(questions).map(([id, data]: [string, any]) => ({
        id,
        ...data,
      }));
      
      return NextResponse.json({
        success: true,
        formId,
        fields
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch form fields',
        error: response.data
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching form fields:', error);
    
    let errorMessage = 'An error occurred while fetching form fields';
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
    
    return NextResponse.json({
      success: false,
      message: errorMessage,
      error: errorDetails || String(error)
    }, { status: 500 });
  }
} 