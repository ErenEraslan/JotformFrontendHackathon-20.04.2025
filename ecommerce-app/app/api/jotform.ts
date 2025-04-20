import axios from 'axios';

const API_KEY = '5b3b3313668f2192e75dce86fd79fd8a';
const BASE_URL = 'https://api.jotform.com';

export const FORM_IDS = {
  form1: '251074116166956',
  form2: '251073669442965',
  form3: '251073643151954'
};

export type ProductItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  images?: string[]; // Array of image URLs
  category?: string;
  stock?: number;
  source?: string; // Added to track which form the product came from
};

export const fetchProducts = async (formId: string = FORM_IDS.form1): Promise<ProductItem[]> => {
  try {
    const endpoint = `${BASE_URL}/form/${formId}/payment-info?apiKey=${API_KEY}`;
    const response = await axios.get(endpoint);
    
    // Log the API response for debugging
    console.log('API Response Structure:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
    if (response.data && response.data.content) {
      return transformJotformResponse(response.data.content, formId);
    }
    
    return getDummyProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
    return getDummyProducts();
  }
};

// Helper function to transform Jotform API response to our ProductItem format
const transformJotformResponse = (data: any, formId: string): ProductItem[] => {
  console.log('Response content:', JSON.stringify(data).substring(0, 500) + '...');
  
  // Try different property paths that might contain products
  if (Array.isArray(data.products)) {
    console.log('Found products array');
    return data.products.map((product: any, index: number) => mapProductFromJotform(product, index, formId));
  }
  
  if (data.answers && typeof data.answers === 'object') {
    console.log('Found answers object');
    // Try to extract products from answers
    const products = Object.values(data.answers)
      .filter(answer => 
        answer && typeof answer === 'object' && 
        ('paymentProducts' in answer || 'products' in answer)
      );
    
    if (products.length > 0) {
      const firstProduct = products[0] as any;
      const productItems = firstProduct.paymentProducts || firstProduct.products || [];
      return Array.isArray(productItems) ? productItems.map((product: any, index: number) => mapProductFromJotform(product, index, formId)) : [];
    }
  }
  
  // If no products are found, create dummy products based on form ID
  console.log('No products found in response, using dummy data');
  return getDummyProducts(formId);
};

// Helper function to safely parse JSON
const safeJsonParse = (jsonString: string | null | undefined, defaultValue: any = null): any => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
};

const mapProductFromJotform = (product: any, index: number, formId?: string): ProductItem => {
  // Log each product mapping
  console.log(`Mapping product: ${JSON.stringify(product).substring(0, 200)}...`);
  
  // Handle different possible property names
  const name = product.name || product.productName || product.text || `Product ${index + 1}`;
  const price = parseFloat(product.price || product.amount || '0') || 0;
  const description = product.description || product.text || `High-quality product for all your needs. Premium selection for our valued customers.`;
  
  // Extract category from product name if not explicitly provided
  const extractedCategory = extractCategoryFromName(name);
  const category = product.category || product.productCategory || product.type || extractedCategory;
  
  // Parse images from JSON string
  let imageUrls: string[] = [];
  let primaryImageUrl = 'https://placehold.co/400x300';
  
  // Check if images is a JSON string "[\"url1\", \"url2\"]"
  if (typeof product.images === 'string') {
    try {
      imageUrls = safeJsonParse(product.images, []);
      console.log('Parsed image URLs:', imageUrls);
    } catch (e) {
      console.error('Error parsing image JSON:', e);
    }
  } else if (Array.isArray(product.images)) {
    imageUrls = product.images;
  }
  
  // Clean up image URLs (remove escaped characters)
  imageUrls = imageUrls.map(url => url.replace(/\\/g, ''));
  
  // Set primary image from the first available image or fallback
  if (imageUrls.length > 0) {
    primaryImageUrl = imageUrls[0];
  } else if (product.image) {
    primaryImageUrl = product.image;
  } else if (product.thumbnail) {
    primaryImageUrl = product.thumbnail;
  } else if (product.imageUrl) {
    primaryImageUrl = product.imageUrl;
  }
  
  return {
    id: product.pid || product.id || product.productId || `product-${index}`,
    name,
    price,
    description,
    image: primaryImageUrl,
    images: imageUrls,
    category,
    stock: parseInt(product.stock || product.quantity || '10') || 10,
    source: formId
  };
};

// Helper to extract category from product name
const extractCategoryFromName = (name: string): string => {
  // Extract the name before the first comma
  const categoryName = name.split(',')[0].trim();
  if (categoryName && categoryName.length > 1) {
    // Capitalize first letter
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  }
  
  // Default fallback
  return 'Other';
};

// Fallback products if API doesn't return data
const getDummyProducts = (formId?: string): ProductItem[] => {
  // We'll only provide a minimal set of products since real data is preferred
  return Array.from({ length: 8 }, (_, i) => {
    const id = `product-${i + 1}`;
    const name = `Product ${i + 1}`;
    return {
      id: id,
      name: name,
      price: 10 + i * 5,
      description: 'This product is currently unavailable from the API.',
      image: `https://placehold.co/400x300/4096ff/ffffff?text=${encodeURIComponent(name)}`,
      images: [`https://placehold.co/400x300/4096ff/ffffff?text=${encodeURIComponent(name)}`],
      category: 'Product', // Simple category based on product name
      stock: 10,
      source: formId
    };
  });
};

export default {
  fetchProducts,
  FORM_IDS
}; 