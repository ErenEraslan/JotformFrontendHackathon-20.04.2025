'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { FiCreditCard, FiLock, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface CheckoutFormData {
  fullName: string;
  address: string;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

interface OrderResult {
  success: boolean;
  message: string;
  orderId?: string;
  formId?: string;
  error?: any;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { items, totalPrice, clearCart, currentSource } = useCart();
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    address: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  // Check if cart is valid before proceeding
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      router.push('/');
    }
    
    // Ensure all items are from the same source
    if (items.length > 0) {
      const itemSources = new Set(items.map(item => item.source));
      if (itemSources.size > 1) {
        alert('Your cart contains items from different sources. Please clear your cart and try again.');
        router.push('/');
      }
    }
  }, [items, orderComplete, router]);

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Your cart is empty</h1>
          <p className="mt-4 text-lg text-gray-500">Add some products to your cart to proceed to checkout.</p>
          <div className="mt-8">
            <button
              onClick={() => router.push('/')}
              className="inline-block rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }

    // Format expiry date
    if (name === 'expiry') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '$1/$2')
        .slice(0, 5);
    }

    // Limit CVV to 3 or 4 digits
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData({
      ...formData,
      [name]: formattedValue
    });

    // Clear error for this field if it exists
    if (formErrors[name]) {
      const newErrors = {...formErrors};
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 16) {
      errors.cardNumber = 'Valid card number is required';
    }
    
    if (!formData.cardName.trim()) {
      errors.cardName = 'Name on card is required';
    }
    
    if (!formData.expiry.trim() || !formData.expiry.includes('/')) {
      errors.expiry = 'Valid expiry date is required';
    }
    
    if (!formData.cvv.trim() || formData.cvv.length < 3) {
      errors.cvv = 'Valid CVV is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setOrderResult(null);
    
    try {
      // Create the order data object
      const orderData = {
        source: currentSource,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customer: {
          fullName: formData.fullName,
          address: formData.address
        },
        payment: {
          cardName: formData.cardName,
          cardNumber: formData.cardNumber.replace(/\s/g, '').slice(-4), // Send only last 4 digits for security
          expiry: formData.expiry
        }
      };
      
      // Make the API call to our order submission endpoint
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      setOrderResult(result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit order');
      }
      
      // If we got here, the order was successful
      setIsProcessing(false);
      setOrderComplete(true);
      
      // Reset cart after successful order
      setTimeout(() => {
        clearCart();
      }, 2000);
      
      // Log confirmation details for debugging
      console.log('Order confirmation:', result);
    } catch (error) {
      setIsProcessing(false);
      console.error('Order submission error:', error);
      
      // Show error alert only if we don't already have result details
      if (!orderResult) {
        setOrderResult({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {orderComplete ? (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FiCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Complete!</h2>
              <p className="text-gray-700 mb-2">Thank you for your purchase, {formData.fullName}</p>
              
              {orderResult?.orderId && (
                <p className="text-gray-600 mb-2">Order ID: {orderResult.orderId}</p>
              )}
              
              <p className="text-gray-600 mb-4">We'll send a confirmation email to you shortly with order details.</p>
              <button
                onClick={() => router.push('/')}
                className="mt-6 rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {currentSource && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
                  <FiAlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    You are checking out items from source: {currentSource}
                  </p>
                </div>
              )}
              
              {/* Display order submission error if any */}
              {orderResult && !orderResult.success && (
                <div className="bg-red-50 rounded-lg p-4 mb-6 flex items-start">
                  <FiXCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Order Submission Error
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      {orderResult.message}
                    </p>
                    {orderResult.error && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-800 cursor-pointer">Error Details</summary>
                        <pre className="mt-1 text-xs text-red-700 p-2 bg-red-100 rounded overflow-auto">
                          {JSON.stringify(orderResult.error, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}
              
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <li key={item.id} className="flex py-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.image || `https://placehold.co/400x300/4096ff/ffffff?text=${encodeURIComponent(item.name)}`}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.name}</h3>
                              <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <p className="text-gray-500">Qty {item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Shipping</span>
                  <span className="font-medium">$4.99</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">${(totalPrice + 4.99).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiCreditCard className="mr-2 h-5 w-5 text-blue-600" />
                Payment Details
              </h2>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
                <FiLock className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Your payment information is encrypted and secure. We never store your full credit card details.
                </p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b border-blue-200">Shipping Information</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-bold text-gray-800 mb-2">
                      Full Name <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full p-3 border-2 ${formErrors.fullName ? 'border-red-500' : 'border-gray-400'} bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium`}
                      required
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">This field is required.</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-bold text-gray-800 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full p-3 border-2 ${formErrors.address ? 'border-red-500' : 'border-gray-400'} bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium`}
                      required
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600">This field is required.</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b border-blue-200">Card Information</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="cardNumber" className="block text-sm font-bold text-gray-800 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className={`w-full p-3 border-2 ${formErrors.cardNumber ? 'border-red-500' : 'border-gray-400'} bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium`}
                      required
                    />
                    {formErrors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">Please enter a valid card number.</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="cardName" className="block text-sm font-bold text-gray-800 mb-2">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className={`w-full p-3 border-2 ${formErrors.cardName ? 'border-red-500' : 'border-gray-400'} bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium`}
                      required
                    />
                    {formErrors.cardName && (
                      <p className="mt-1 text-sm text-red-600">Please enter the name on your card.</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      <label htmlFor="expiry" className="block text-sm font-bold text-gray-800 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        name="expiry"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        className={`w-full p-3 border-2 ${formErrors.expiry ? 'border-red-500' : 'border-gray-400'} bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium`}
                        required
                      />
                      {formErrors.expiry && (
                        <p className="mt-1 text-sm text-red-600">Please enter a valid expiry date.</p>
                      )}
                    </div>
                    <div className="w-1/2">
                      <label htmlFor="cvv" className="block text-sm font-bold text-gray-800 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={`w-full p-3 border-2 ${formErrors.cvv ? 'border-red-500' : 'border-gray-400'} bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium`}
                        required
                      />
                      {formErrors.cvv && (
                        <p className="mt-1 text-sm text-red-600">Please enter a valid CVV.</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-4 mt-8">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-blue-600 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none flex justify-center items-center"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Order...
                      </>
                    ) : (
                      `Place Order • ${(totalPrice + 4.99).toFixed(2)} USD`
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="w-full rounded-md border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                    disabled={isProcessing}
                  >
                    Return to Shopping
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage; 