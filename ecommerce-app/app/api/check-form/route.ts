import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

export async function GET(request: NextRequest) {
  try {
    // Get formId from query params or default to form1
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId') || FORM_IDS.form1;
    
    console.log(`Checking form fields for form ${formId}`);
    
    // Get form questions
    const questionsResponse = await axios.get(
      `${BASE_URL}/form/${formId}/questions`,
      {
        params: {
          apiKey: API_KEY
        }
      }
    );
    
    // Log raw response for debugging
    console.log('Form questions raw response:', JSON.stringify(questionsResponse.data).substring(0, 500) + '...');
    
    // If successful, process the questions data
    if (questionsResponse.data.responseCode === 200 && questionsResponse.data.content) {
      const questions = questionsResponse.data.content;
      
      // Format questions to be more readable
      const formattedQuestions = Object.entries(questions).map(([qid, qdata]: [string, any]) => {
        return {
          id: qid,
          name: qdata.name || 'Unnamed',
          text: qdata.text || 'No text',
          type: qdata.type || 'Unknown type',
          required: qdata.required === true || qdata.required === 'Yes',
          order: qdata.order || 0,
          properties: qdata.properties || {}
        };
      }).sort((a, b) => a.order - b.order);
      
      return NextResponse.json({
        success: true,
        formId: formId,
        questions: formattedQuestions
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to retrieve form questions',
        error: questionsResponse.data
      });
    }
  } catch (error) {
    console.error('Error retrieving form questions:', error);
    
    let errorMessage = 'An error occurred while retrieving form questions';
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