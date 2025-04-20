import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a'; // Jotform API key
const BASE_URL = 'https://api.jotform.com';

// Form field mappings - in a real application, you would inspect each form
// to get the exact field IDs for each form and update this accordingly
const FORM_FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  // These mappings may need to be updated after inspecting actual forms
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

// If the field mapping isn't found, this is our fallback
const DEFAULT_FIELD_MAPPING = {
  fullName: '3',
  address: '4',
  items: '5',
  subtotal: '6',
  shipping: '7',
  total: '8',
  cardName: '9',
  cardNumber: '10',
  cardExpiry: '11'
};

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  source: string;
  items: OrderItem[];
  customer: {
    fullName: string;
    address: string;
  };
  payment: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv?: string;
  };
}

// Helper function to fetch form questions from Jotform
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

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const orderData: OrderData = await request.json();
    
    // Determine which form to submit to based on source
    let formId = '';
    if (orderData.source in FORM_IDS) {
      formId = FORM_IDS[orderData.source as keyof typeof FORM_IDS];
    } else if (Object.values(FORM_IDS).includes(orderData.source)) {
      formId = orderData.source;
    } else {
      formId = FORM_IDS.form1; // Default to form1 if source is unknown
    }
    
    // Get field mappings for this form or use default
    const fieldMapping = FORM_FIELD_MAPPINGS[formId] || DEFAULT_FIELD_MAPPING;
    
    // Calculate total price
    const subtotal = orderData.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = 4.99;
    const total = subtotal + shipping;
    
    // Format items for submission - match the format of successful submission
    // Format each item as "Name\nQuantity: X" for each product - exact match to working example
    const itemsList = orderData.items.map(item => 
      `${item.name}\nQuantity: ${item.quantity}`
    ).join('\n\n');
    
    // Create submission data for Jotform using the correct field IDs
    const submissionData: Record<string, string> = {};
    
    // Try to get actual questions for the form to verify field mappings
    const formQuestions = await getFormQuestions(formId);
    let formQuestionsLog = 'No form questions found';
    if (formQuestions) {
      formQuestionsLog = `Form has ${Object.keys(formQuestions).length} questions`;
      // Log field names to help with debugging
      console.log('Form questions:', Object.entries(formQuestions).map(([id, q]: [string, any]) => 
        `${id}: ${q.text || q.name || 'Unnamed question'} (${q.type || 'unknown type'})`
      ));
    }
    
    // Add each field with the correct field ID
    submissionData[`submission[${fieldMapping.fullName}]`] = orderData.customer.fullName;
    submissionData[`submission[${fieldMapping.address}]`] = orderData.customer.address;
    submissionData[`submission[${fieldMapping.items}]`] = itemsList;
    submissionData[`submission[${fieldMapping.subtotal}]`] = subtotal.toFixed(2);
    submissionData[`submission[${fieldMapping.shipping}]`] = shipping.toFixed(2);
    submissionData[`submission[${fieldMapping.total}]`] = total.toFixed(2);
    submissionData[`submission[${fieldMapping.cardName}]`] = orderData.payment.cardName;
    submissionData[`submission[${fieldMapping.cardNumber}]`] = `xxxx-xxxx-xxxx-${orderData.payment.cardNumber}`;
    submissionData[`submission[${fieldMapping.cardExpiry}]`] = orderData.payment.expiry;
    
    // Set submission URL
    const submissionUrl = `${BASE_URL}/form/${formId}/submissions`;
    
    // Log the submission (for debugging)
    console.log('Submitting order to:', submissionUrl);
    console.log('Form ID:', formId);
    console.log('Form questions:', formQuestionsLog);
    console.log('Field mapping:', fieldMapping);
    
    // Create FormData object for submission - IMPORTANT: This is the key part that makes it work
    const formData = new URLSearchParams();
    
    // Add API key and submission data directly without intermediate object
    formData.append('apiKey', API_KEY);
    
    // Add each field directly to the form data
    Object.entries(submissionData).forEach(([key, value]) => {
      if (key !== 'apiKey') { // Skip apiKey as we already added it
        formData.append(key, value);
      }
    });
    
    console.log('Form data:', formData.toString());
    
    // Extra debug log for exact request content
    console.log('--------- EXACT REQUEST DATA --------');
    console.log('URL:', submissionUrl);
    console.log('Method: POST');
    console.log('Headers:', { 'Content-Type': 'application/x-www-form-urlencoded' });
    console.log('Body:', formData.toString());
    console.log('-------------------------------------');
    
    // Submit to Jotform using the correct form data approach
    const response = await axios.post(submissionUrl, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Log full response for debugging
    console.log('Jotform API response:', JSON.stringify(response.data, null, 2));
    
    // Check response
    if (response.data && response.data.responseCode === 200) {
      const submissionID = response.data.content?.submissionID || 'unknown';
      console.log('Successfully submitted order, received order ID:', submissionID);
      
      return NextResponse.json({
        success: true,
        message: 'Order submitted successfully',
        orderId: submissionID,
        formId: formId
      });
    } else {
      console.error('Jotform submission error:', response.data);
      return NextResponse.json({
        success: false,
        message: 'Error submitting order to Jotform',
        error: response.data
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Order submission error:', error);
    
    // Provide more detailed error information for debugging
    let errorMessage = 'Server error processing order';
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