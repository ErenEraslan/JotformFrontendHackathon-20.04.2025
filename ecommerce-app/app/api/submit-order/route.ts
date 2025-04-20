import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { FORM_IDS } from '../jotform';

// Jotform API configuration
const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

// Define the field mapping interface with optional payment fields
interface FieldMapping {
  fullName: string;
  address: string;
  productDetails: string;
  subtotal: string;
  shipping: string;
  total: string;
  cardName?: string;
  cardNumber?: string;
  cardExpiry?: string;
}

// Basic field mappings for our forms
const FIELD_MAPPINGS: Record<string, FieldMapping> = {
  [FORM_IDS.form1]: {
    fullName: '34',         // Full Name field
    address: '36',          // Address field
    productDetails: '21',   // Product details field - Updated to match the forWholesale field
    subtotal: '38',         // Subtotal field - Updated to use correct field IDs
    shipping: '39',         // Shipping field - Updated to use correct field IDs
    total: '40'             // Total field - Updated to use correct field IDs
    // Payment fields can be added if the form has them
    // cardName: '42',
    // cardNumber: '43',
    // cardExpiry: '44'
  },
  // Add mappings for other forms if needed
};

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
  images?: string[];
}

interface OrderData {
  source?: string;
  formId?: string;
  items: OrderItem[];
  customer: {
    fullName: string;
    address: string;
  };
  payment?: {
    cardName?: string;
    cardNumber?: string;
    expiry?: string;
  };
}

// Function to escape slashes in URLs for JSON - Jotform requires this format
function escapeSlashes(url: string): string {
  return url.replace(/\//g, '\\/');
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const orderData: OrderData = await request.json();
    
    // Determine which form to submit to
    let formId = orderData.formId || FORM_IDS.form1;
    if (orderData.source && orderData.source in FORM_IDS) {
      formId = FORM_IDS[orderData.source as keyof typeof FORM_IDS];
    }
    
    // Get field mappings for this form
    const fieldMapping = FIELD_MAPPINGS[formId as keyof typeof FIELD_MAPPINGS] || FIELD_MAPPINGS[FORM_IDS.form1];
    
    // Calculate totals
    const subtotal = orderData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 4.99;
    const total = subtotal + shipping;
    
    console.log(`Submitting order to form: ${formId}`);
    console.log('Order data:', JSON.stringify(orderData, null, 2));
    
    // Create form data
    const formData = new URLSearchParams();
    
    // Add API key
    formData.append('apiKey', API_KEY);
    
    // Add customer info
    formData.append(`submission[${fieldMapping.fullName}]`, orderData.customer.fullName);
    formData.append(`submission[${fieldMapping.address}]`, orderData.customer.address);
    
    // Format and add product information - using the exact structure from the Jotform example
    if (orderData.items.length > 0) {
      // Process products according to the format in the successful submission
      const products = orderData.items.map((item, index) => {
        // Format images the way Jotform expects them
        let imagesJson = "[]";
        if (item.images && item.images.length > 0) {
          // Format image URLs with escaped slashes in JSON format
          const escapedImages = item.images.map(url => escapeSlashes(url));
          imagesJson = JSON.stringify([...escapedImages]);
        } else if (item.image) {
          // Single image case
          imagesJson = JSON.stringify([escapeSlashes(item.image)]);
        }
        
        // Build product object exactly matching the successful submission format for field 21
        return {
          name: item.name,
          price: String(item.price.toFixed(2)),
          quantity: item.quantity,
          pid: item.id,
          description: item.description || `${item.name}`,
          image: item.image,
          images: imagesJson,
          order: String(index + 1),
          cid: "", 
          corder: "",
          customPrice: "",
          hasImage: "1",
          hasQuantity: "1", 
          hasSpecialPrice: "", 
          specialPriceVal: "0", 
          specialChecked: false,
          selected: "1",
          specialPrices: "0,0,0,0,0,0,0,0,0,0,0",
          specialPriceType: "0"
        };
      });
      
      // Format exactly as seen in the response
      const productsData = {
        products: products,
        paymentType: "product",
        text: "Product List"
      };
      
      // Add the product field with the correct format
      formData.append(`submission[${fieldMapping.productDetails}]`, JSON.stringify(productsData));
    }
    
    // Add totals
    formData.append(`submission[${fieldMapping.subtotal}]`, subtotal.toFixed(2));
    formData.append(`submission[${fieldMapping.shipping}]`, shipping.toFixed(2));
    formData.append(`submission[${fieldMapping.total}]`, total.toFixed(2));
    
    // Add payment details if available
    if (orderData.payment) {
      if (fieldMapping.cardName && orderData.payment.cardName) {
        formData.append(`submission[${fieldMapping.cardName}]`, orderData.payment.cardName);
      }
      
      if (fieldMapping.cardNumber && orderData.payment.cardNumber) {
        // Mask card number for security
        formData.append(`submission[${fieldMapping.cardNumber}]`, 
          `xxxx-xxxx-xxxx-${orderData.payment.cardNumber.slice(-4)}`);
      }
      
      if (fieldMapping.cardExpiry && orderData.payment.expiry) {
        formData.append(`submission[${fieldMapping.cardExpiry}]`, orderData.payment.expiry);
      }
    }
    
    // Log request details
    console.log('Request URL:', `${BASE_URL}/form/${formId}/submissions`);
    console.log('Form data keys:', [...formData.keys()]);
    
    // Submit to Jotform
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/form/${formId}/submissions`,
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('Jotform response:', JSON.stringify(response.data, null, 2));
    
    // Process response
    if (response.data && response.data.responseCode === 200 && response.data.content?.submissionID) {
      const submissionId = response.data.content.submissionID;
      
      // Wait for submission to process and fetch details
      console.log('Waiting for submission to be processed...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const detailsResponse = await axios({
        method: 'get',
        url: `${BASE_URL}/submission/${submissionId}`,
        params: {
          apiKey: API_KEY
        }
      });
      
      console.log('Submission details:', JSON.stringify(detailsResponse.data, null, 2));
      
      return NextResponse.json({
        success: true,
        message: 'Order submitted successfully',
        orderId: submissionId,
        formId: formId,
        orderDetails: detailsResponse.data.content
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Order submission failed',
        response: response.data
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error submitting order:', error);
    
    let errorMessage = 'An error occurred during order submission';
    let errorDetails = null;
    
    if (axios.isAxiosError(error)) {
      errorMessage = error.message;
      errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      };
      console.error('Failed request config:', error.config);
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