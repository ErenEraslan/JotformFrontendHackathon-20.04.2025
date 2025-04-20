import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Replace with your actual Jotform API key
const API_KEY = 'YOUR_JOTFORM_API_KEY';
const BASE_URL = 'https://api.jotform.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    
    // If a specific form ID is provided, get that form's fields
    if (formId) {
      const response = await axios.get(`${BASE_URL}/form/${formId}/questions?apiKey=${API_KEY}`);
      
      if (response.data.responseCode === 200) {
        const questions = response.data.content || {};
        
        // Transform the questions data into a more usable format
        const fields = Object.values(questions).map((question: any) => ({
          id: question.qid,
          name: question.text || question.name || `Field ${question.qid}`,
          type: question.type || 'text',
          required: question.required === "1"
        }));
        
        return NextResponse.json({
          success: true,
          formId,
          fields
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `Failed to retrieve form questions: ${response.data.message}`,
        }, { status: 400 });
      }
    } 
    
    // Otherwise, get a list of all forms
    else {
      const response = await axios.get(`${BASE_URL}/user/forms?apiKey=${API_KEY}`);
      
      if (response.data.responseCode === 200) {
        const forms = (response.data.content || []).map((form: any) => ({
          id: form.id,
          title: form.title,
          status: form.status,
          created_at: form.created_at,
          updated_at: form.updated_at,
          count: form.count
        }));
        
        return NextResponse.json({
          success: true,
          forms
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `Failed to retrieve forms: ${response.data.message}`,
        }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('Error fetching forms:', error);
    
    let errorMessage = 'An error occurred while fetching forms';
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