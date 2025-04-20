# Jotform Frontend Hackathon Project - JotShop E-commerce

## User Information
- **Name**: Eren Berk Eraslan

## Project Description
JotShop is a modern e-commerce application built for the Jotform Frontend Hackathon. The application fetches product data from Jotform's API and displays it in a user-friendly interface with a shopping cart, filter functionality, and multiple product views.

### Features
- Product catalog display with filtering options
- Shopping cart functionality with add/remove items
- Search functionality for products
- Multiple data sources via Jotform APIs
- Responsive design for mobile and desktop
- Modern UI/UX with animations and transitions
- Complete checkout flow with form validation
- Order submission to Jotform

## Technologies Used
- Next.js with TypeScript
- React Hooks for state management
- Axios for API requests
- Tailwind CSS for styling
- React Icons for icon components
- Jotform API integration

## Comprehensive Setup Guide

### Prerequisites
- Node.js 18.0.0 or later
- npm or yarn
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/JotformFrontendHackathon-20.04.2025.git
cd JotformFrontendHackathon-20.04.2025
```

### Step 2: Navigate to Project Directory
```bash
cd ecommerce-app
```

### Step 3: Install Dependencies
Using npm:
```bash
npm install
```
Or using yarn:
```bash
yarn install
```

### Step 4: Run Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

### Step 5: Accessing the Application
- Open your browser and navigate to http://localhost:3000
- Browse products, add them to cart, and test the checkout flow
- You can view products from different sources using the navigation

### Building for Production
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Environment Configuration
The application uses the following environment variables:
- No additional environment variables needed as API keys are hardcoded for demo purposes

## Troubleshooting Common Issues

### Products Not Displaying
- Check your internet connection
- Verify that the Jotform API is accessible
- Confirm you're using a compatible browser (Chrome, Firefox, Safari, Edge)

### Order Submission Errors
- Make sure all form fields are filled correctly
- Ensure items in cart are from the same source

## Known Issues and Fixes

### Product List Submission Issue
I correcftly submit name and address but during development, I encountered a significant challenge with the product list submission to Jotform. The issue stemmed from an incorrect field mapping in the API request, causing product data to be sent to the wrong field ID.

**Problem Details:**
- Products were being submitted to field ID '37' instead of '21' (the "forWholesale" field)
- The JSON structure of the product data didn't match what Jotform expected
- This issue caused approximately 4 hours of troubleshooting time

**Solution:**
- Updated the field mapping to use the correct field ID '21'
- Modified the product data structure to match exactly what Jotform expects
- Added proper formatting with paymentType and text values
- Implemented detailed logging to track request/response issues

This fix ensures that product data now appears correctly in the Jotform submission, allowing for complete order processing.

## API Integration
The application uses Jotform's API to fetch and submit product data:
- API Key: 5b3b3313668f2192e75dce86fd79fd8a
- Fetch Products Endpoint: https://api.jotform.com/form/:formID/payment-info?apiKey={apiKey}
- Submit Orders Endpoint: https://api.jotform.com/form/:formID/submissions
- Form IDs: 
  - 251074116166956
  - 251073669442965
  - 251073643151954

## Code Structure
- `/app` - Next.js app router structure
- `/app/components` - Reusable UI components
- `/app/context` - React context for state management
- `/app/api` - API routes for server-side operations
- `/public` - Static assets and images

## Contributing
To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with your changes

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
