'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiMinus, FiShoppingCart, FiCreditCard, FiLock } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import Image from 'next/image';

interface ImageErrorMap {
  [key: string]: boolean;
}

interface CheckoutFormData {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

// Create a context to allow other components to open the cart
export const CartOpenContext = React.createContext<() => void>(() => {});

const ShoppingCart: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [imageErrors, setImageErrors] = useState<ImageErrorMap>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set animating state to prevent immediate closing
      setIsAnimating(true);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
    } else {
      // Allow scrolling when sidebar is closed
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto'; // Ensure scrolling is restored
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(true);
    setIsOpen(false);
    setIsCheckoutOpen(false);
  };

  const openCart = () => {
    setIsOpen(true);
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  const getFallbackImage = (itemName: string) => {
    return `https://placehold.co/400x300/4096ff/ffffff?text=${encodeURIComponent(itemName)}`;
  };

  const getItemImageUrl = (item: any) => {
    if (imageErrors[item.id]) return getFallbackImage(item.name);
    
    // Try to get image from images array first
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    
    // Fallback to single image property or default
    return item.image || getFallbackImage(item.name);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      
      // Reset cart after successful order
      setTimeout(() => {
        clearCart();
        setIsCheckoutOpen(false);
        setOrderComplete(false);
        setFormData({
          cardNumber: '',
          cardName: '',
          expiry: '',
          cvv: ''
        });
        handleClose();
      }, 2000);
    }, 1500);
  };

  return (
    <CartOpenContext.Provider value={openCart}>
      {/* Floating Cart Button */}
      <button
        onClick={openCart}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700"
        aria-label="Open shopping cart"
      >
        <FiShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {totalItems}
          </span>
        )}
      </button>

      {/* Backdrop - only visible but not blocking */}
      <div 
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-30' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sliding Cart Sidebar */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out bg-white shadow-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTransitionEnd={() => setIsAnimating(false)}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="px-4 py-6 sm:px-6">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
              <button
                onClick={handleClose}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <span className="sr-only">Close panel</span>
                <FiX className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          {!isCheckoutOpen ? (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                {items.length > 0 ? (
                  <div className="flow-root">
                    <ul className="divide-y divide-gray-200">
                      {items.map((item) => (
                        <li key={item.id} className="flex py-6">
                          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <Image
                              src={getItemImageUrl(item)}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                              width={96}
                              height={96}
                              onError={() => handleImageError(item.id)}
                              unoptimized={true}
                            />
                          </div>
                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3 className="line-clamp-1">{item.name}</h3>
                                <p className="ml-4">${item.price.toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-700 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="flex flex-1 items-end justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="rounded-full p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                                >
                                  <FiMinus className="h-4 w-4" />
                                </button>
                                <span className="min-w-[24px] text-center text-gray-700">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="rounded-full p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                                >
                                  <FiPlus className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <FiShoppingCart className="h-12 w-12 text-gray-600" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
                    <p className="mt-1 text-sm text-gray-700">Start shopping to add items to your cart</p>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${totalPrice.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-700">Shipping and taxes calculated at checkout.</p>
                  <div className="mt-6">
                    <button 
                      onClick={handleCheckout}
                      className="w-full rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      Checkout
                    </button>
                  </div>
                  <div className="mt-2">
                    <button 
                      onClick={clearCart}
                      className="w-full rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                  <div className="mt-6 flex justify-center text-center text-sm text-gray-700">
                    <p>
                      or{' '}
                      <button
                        type="button"
                        className="font-medium text-blue-600 hover:text-blue-500"
                        onClick={handleClose}
                      >
                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 px-4 py-6 sm:px-6 overflow-y-auto">
              {orderComplete ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Complete!</h2>
                  <p className="text-gray-700 mb-8">Thank you for your purchase</p>
                  <p className="text-gray-700 text-sm">You will receive a confirmation email shortly.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
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
                    <div className="mb-10">
                      <div className="bg-white rounded-lg shadow-lg p-5 mb-4">
                        <div className="flex justify-between mb-4">
                          <div>
                            <img src="/visa.svg" alt="Visa" className="h-6" />
                          </div>
                          <div className="flex space-x-2">
                            <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
                            <img src="/amex.svg" alt="American Express" className="h-6" />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                              Card Number
                            </label>
                            <input
                              type="text"
                              id="cardNumber"
                              name="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 text-gray-800 placeholder-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              id="cardName"
                              name="cardName"
                              placeholder="John Doe"
                              value={formData.cardName}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 text-gray-800 placeholder-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          
                          <div className="flex space-x-4">
                            <div className="w-1/2">
                              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                id="expiry"
                                name="expiry"
                                placeholder="MM/YY"
                                value={formData.expiry}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 text-gray-800 placeholder-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div className="w-1/2">
                              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                                CVV
                              </label>
                              <input
                                type="text"
                                id="cvv"
                                name="cvv"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 text-gray-800 placeholder-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-700">Subtotal</span>
                          <span className="font-medium">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-700">Shipping</span>
                          <span className="font-medium">$4.99</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-bold text-gray-900">${(totalPrice + 4.99).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsCheckoutOpen(false)}
                        className="flex-1 rounded-md border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                      >
                        Back to Cart
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-md bg-blue-600 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none flex justify-center items-center"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          `Pay ${(totalPrice + 4.99).toFixed(2)} USD`
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </CartOpenContext.Provider>
  );
};

export default ShoppingCart; 