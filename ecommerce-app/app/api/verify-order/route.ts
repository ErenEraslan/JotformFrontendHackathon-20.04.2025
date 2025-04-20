import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

interface OrderVerification {
  orderId: string;
  formId?: string;
  fields: Record<string, any>;
  rawSubmission: any;
  answers: Record<string, any>;
  formatedValues: Record<string, string>;
  success: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Get order ID from query params
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Verifying order with ID: ${orderId}`);
    
    // Get submission data
    const submissionResponse = await axios.get(
      `${BASE_URL}/submission/${orderId}`,
      {
        params: {
          apiKey: API_KEY
        }
      }
    );
    
    if (submissionResponse.data.responseCode !== 200 || !submissionResponse.data.content) {
      return NextResponse.json({
        success: false,
        message: 'Failed to retrieve submission data',
        error: submissionResponse.data
      });
    }
    
    const submissionData = submissionResponse.data.content;
    const formId = submissionData.form_id;
    
    // Get form structure
    let formQuestions: Record<string, any> = {};
    try {
      const formResponse = await axios.get(
        `${BASE_URL}/form/${formId}/questions`,
        {
          params: {
            apiKey: API_KEY
          }
        }
      );
      
      if (formResponse.data.responseCode === 200 && formResponse.data.content) {
        formQuestions = formResponse.data.content;
      }
    } catch (error) {
      console.error('Error retrieving form questions:', error);
      // Continue without form questions
    }
    
    // Extract and format field data
    const verification: OrderVerification = {
      orderId: orderId,
      formId: formId,
      fields: {},
      rawSubmission: submissionData,
      answers: submissionData.answers || {},
      formatedValues: {},
      success: true
    };
    
    // Process answers and map to field names
    if (submissionData.answers) {
      Object.entries(submissionData.answers).forEach(([fieldId, answerData]: [string, any]) => {
        const fieldQuestion = formQuestions[fieldId];
        
        const fieldName = fieldQuestion 
          ? (fieldQuestion.text || fieldQuestion.name || `Field ${fieldId}`) 
          : `Field ${fieldId}`;
        
        let value = 'No value';
        
        if (answerData.answer) {
          if (typeof answerData.answer === 'string') {
            value = answerData.answer;
          } else if (Array.isArray(answerData.answer)) {
            value = answerData.answer.join(', ');
          } else {
            value = JSON.stringify(answerData.answer);
          }
        }
        
        verification.fields[fieldId] = {
          name: fieldName,
          type: fieldQuestion ? fieldQuestion.type : 'unknown',
          value: value
        };
        
        verification.formatedValues[fieldId] = value;
      });
    }
    
    return NextResponse.json({
      success: true,
      verification: verification,
      formQuestions: Object.entries(formQuestions).map(([id, q]: [string, any]) => ({
        id,
        text: q.text || q.name || 'Unnamed',
        type: q.type || 'unknown'
      }))
    });
  } catch (error) {
    console.error('Error verifying order:', error);
    
    let errorMessage = 'An error occurred while verifying the order';
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