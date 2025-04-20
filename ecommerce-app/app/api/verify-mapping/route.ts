import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

// Default field mapping from our code
const FORM_FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  [FORM_IDS.form1]: {
    fullName: '3', // Full Name field ID
    address: '4',  // Address field ID
    items: '5',    // Order items field ID 
    subtotal: '6', // Subtotal field ID
    shipping: '7', // Shipping field ID
    total: '8',    // Total field ID
    cardName: '9', // Card name field ID
    cardNumber: '10', // Card number field ID
    cardExpiry: '11'  // Card expiry field ID
  },
  [FORM_IDS.form2]: {
    fullName: '3',
    address: '4',
    items: '5',
    subtotal: '6',
    shipping: '7',
    total: '8',
    cardName: '9',
    cardNumber: '10',
    cardExpiry: '11'
  },
  [FORM_IDS.form3]: {
    fullName: '3',
    address: '4',
    items: '5',
    subtotal: '6',
    shipping: '7',
    total: '8',
    cardName: '9',
    cardNumber: '10',
    cardExpiry: '11'
  }
};

// Helper function to get form questions from Jotform
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
    // Get formId from query params or default to form1
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId') || FORM_IDS.form1;
    
    console.log(`Verifying field mappings for form ${formId}`);
    
    // Get form questions
    const questions = await getFormQuestions(formId);
    if (!questions) {
      return NextResponse.json({
        success: false,
        message: 'Failed to retrieve form questions'
      });
    }
    
    // Get our configured field mapping for this form
    const fieldMapping = FORM_FIELD_MAPPINGS[formId] || FORM_FIELD_MAPPINGS[FORM_IDS.form1];
    
    // Format questions to be more readable
    const questionDetails = Object.entries(questions).map(([qid, qdata]: [string, any]) => {
      return {
        id: qid,
        name: qdata.name || 'Unnamed',
        text: qdata.text || 'No text',
        type: qdata.type || 'Unknown type',
        order: qdata.order || 0
      };
    }).sort((a, b) => a.order - b.order);
    
    // Compare our field mapping with actual form questions
    const mappingVerification: Record<string, any> = {};
    Object.entries(fieldMapping).forEach(([fieldKey, fieldId]) => {
      const matchingQuestion = questionDetails.find(q => q.id === fieldId);
      mappingVerification[fieldKey] = {
        mappedId: fieldId,
        found: !!matchingQuestion,
        details: matchingQuestion || 'Not found in form'
      };
    });
    
    // Generate a verified mapping
    const verifiedMapping: Record<string, string> = {};
    // Try to match fields by name/text
    const nameMatches = {
      fullName: ['name', 'full name', 'customer name'],
      address: ['address', 'shipping address', 'customer address'],
      items: ['products', 'items', 'order items', 'product list'],
      subtotal: ['subtotal', 'sub-total', 'sub total'],
      shipping: ['shipping', 'shipping cost', 'delivery'],
      total: ['total', 'total cost', 'order total'],
      cardName: ['card name', 'name on card', 'credit card name'],
      cardNumber: ['card number', 'credit card number'],
      cardExpiry: ['expiry', 'expiration', 'card expiry']
    };
    
    for (const [fieldKey, searchTerms] of Object.entries(nameMatches)) {
      for (const question of questionDetails) {
        const text = (question.text || '').toLowerCase();
        const name = (question.name || '').toLowerCase();
        
        if (searchTerms.some(term => text.includes(term) || name.includes(term))) {
          verifiedMapping[fieldKey] = question.id;
          break;
        }
      }
      
      // If not found, use our existing mapping
      if (!verifiedMapping[fieldKey]) {
        verifiedMapping[fieldKey] = fieldMapping[fieldKey];
      }
    }
    
    return NextResponse.json({
      success: true,
      formId: formId,
      currentMapping: fieldMapping,
      verifiedMapping: verifiedMapping,
      verification: mappingVerification,
      formQuestions: questionDetails
    });
  } catch (error) {
    console.error('Error verifying field mappings:', error);
    
    let errorMessage = 'An error occurred while verifying field mappings';
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