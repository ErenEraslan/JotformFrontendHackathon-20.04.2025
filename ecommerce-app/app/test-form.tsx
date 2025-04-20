"use client";

import { useState } from 'react';

// Function to escape slashes in URLs for JSON - Jotform requires this format
function escapeSlashes(url: string): string {
  return url.replace(/\//g, '\\/');
}

export default function TestForm() {
  const [formId, setFormId] = useState("251074116166956");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [productId, setProductId] = useState("1096");
  const [productName, setProductName] = useState("Apple, Red");
  const [productPrice, setProductPrice] = useState("54");
  const [productQty, setProductQty] = useState("1");
  const [productImage, setProductImage] = useState("https://www.jotform.com/uploads/delmonofresh/form_files/download.jpg?nc=1");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Split images by comma if multiple are provided
      const images = productImage
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      // Format the image the exact way Jotform expects
      const imagesJson = JSON.stringify(
        images.map(url => escapeSlashes(url))
      );

      // Create the products array in the exact format Jotform expects
      const product = {
        description: `${productName} 40 lb`,
        disabled: "show",
        fitImageToCanvas: "Yes",
        hasExpandedOption: "",
        hasQuantity: "1",
        hasSpecialPricing: "",
        icon: "",
        images: imagesJson,
        name: productName,
        options: JSON.stringify([{
          type: "quantity",
          properties: "0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15",
          name: "Quantity",
          defaultQuantity: "",
          specialPricing: false,
          specialPrices: Array(16).fill(0).map((_, i) => parseFloat(productPrice) * i).join(','),
          expanded: false
        }]),
        order: "1",
        paymentUUID: `01937a3bb${Math.random().toString(16).substr(2, 16)}`,
        pid: productId,
        price: productPrice,
        required: "0",
        selected: "0",
        showSubtotal: "1"
      };

      // Create complete products field structure
      const productsField = {
        products: [product]
      };

      // Call our test-submit API endpoint
      const res = await fetch('/api/test-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          fields: {
            "34": name,                                  // Field ID for name 
            "36": address,                               // Field ID for address
            "37": JSON.stringify(productsField)          // Products field
          }
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Test Form Submission</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="formId" className="block mb-1">Form ID:</label>
          <input
            id="formId"
            type="text"
            value={formId}
            onChange={(e) => setFormId(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        
        <div>
          <label htmlFor="name" className="block mb-1">Name (Field 34):</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        
        <div>
          <label htmlFor="address" className="block mb-1">Address (Field 36):</label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        
        <div className="border p-3 rounded bg-gray-50">
          <h3 className="font-bold mb-2">Product Details:</h3>
          
          <div className="space-y-2">
            <div>
              <label htmlFor="productId" className="block text-sm">Product ID:</label>
              <input
                id="productId"
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="productName" className="block text-sm">Product Name:</label>
              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="productPrice" className="block text-sm">Price:</label>
              <input
                id="productPrice"
                type="text"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="productQty" className="block text-sm">Quantity:</label>
              <input
                id="productQty"
                type="text"
                value={productQty}
                onChange={(e) => setProductQty(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="productImage" className="block text-sm">Image URL:</label>
              <input
                id="productImage"
                type="text"
                value={productImage}
                onChange={(e) => setProductImage(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Enter image URL (comma separated for multiple)"
              />
              <p className="text-xs text-gray-500 mt-1">
                For multiple images, separate URLs with commas
              </p>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Test Form'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 