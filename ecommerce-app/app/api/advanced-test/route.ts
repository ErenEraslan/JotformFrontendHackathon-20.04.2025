import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

// Helper function to get form questions
async function getFormQuestions(formId: string) {
  try {
    const response = await axios.get(`${BASE_URL}/form/${formId}/questions?apiKey=${API_KEY}`);
    if (response.data && response.data.content) {
      return response.data.content;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching form questions for form ${formId}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Use form1 by default
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId') || FORM_IDS.form1;
    
    console.log(`Running advanced test submission to form ${formId}`);
    
    // First, get all questions in the form
    const questions = await getFormQuestions(formId);
    if (!questions) {
      return NextResponse.json({
        success: false,
        message: 'Failed to get form questions'
      });
    }
    
    // Log all questions for debugging
    console.log('Form questions:', Object.entries(questions).map(([id, q]: [string, any]) => 
      `${id}: ${q.text || q.name || 'Unnamed'} (${q.type || 'unknown'})`
    ));
    
    // Create form data
    const formData = new URLSearchParams();
    formData.append('apiKey', API_KEY);
    
    // Fill in values for each field based on type
    const fieldValues: Record<string, string> = {};
    
    for (const [qid, question] of Object.entries(questions)) {
      const q = question as any;
      const qtype = q.type || '';
      let value = '';
      
      // Skip internal field types
      if (qtype === 'control_head' || qtype === 'control_button' || qtype === 'control_pagebreak') {
        continue;
      }
      
      // Populate based on field type
      if (qtype === 'control_textbox' || qtype === 'control_text') {
        value = 'Test Text';
      } else if (qtype === 'control_textarea') {
        value = 'Test textarea with\nmultiple lines';
      } else if (qtype === 'control_fullname') {
        value = 'Test Name';
      } else if (qtype === 'control_email') {
        value = 'test@example.com';
      } else if (qtype === 'control_address') {
        value = '123 Test St\nTest City, Test State';
      } else if (qtype === 'control_phone') {
        value = '555-555-5555';
      } else if (qtype === 'control_number') {
        value = '42';
      } else if (qtype.includes('product') || qtype.includes('payment')) {
        value = 'Apple, Red\nQuantity: 1';
      } else {
        // Default value for other types
        value = 'Test value for ' + qid;
      }
      
      // Add to form data
      formData.append(`submission[${qid}]`, value);
      fieldValues[qid] = value;
    }
    
    // Name and address fields from the successful submission - ensure these exist
    if (!fieldValues['3']) {
      formData.append('submission[3]', 'deneme'); // Full Name
      fieldValues['3'] = 'deneme';
    }
    
    if (!fieldValues['4']) {
      formData.append('submission[4]', 'deneme'); // Address
      fieldValues['4'] = 'deneme';
    }
    
    if (!fieldValues['5']) {
      formData.append('submission[5]', 'Apple, Red\nQuantity: 1'); // Product list
      fieldValues['5'] = 'Apple, Red\nQuantity: 1';
    }
    
    // Make the submission
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
        message: 'Advanced test submission completed',
        submissionId: submissionId,
        submissionData: verifyResponse.data.content,
        fieldValues: fieldValues,
        formQuestions: Object.keys(questions).map(qid => ({ 
          id: qid, 
          type: (questions[qid] as any).type || 'unknown',
          text: (questions[qid] as any).text || (questions[qid] as any).name || 'Unnamed'
        }))
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Advanced test submission failed',
        error: response.data
      });
    }
  } catch (error) {
    console.error('Error in advanced test:', error);
    
    let errorMessage = 'An error occurred during advanced test submission';
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