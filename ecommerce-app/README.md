# JotShop E-commerce Application

This is a Next.js e-commerce application integrated with Jotform for product management and order submissions.

## Jotform Integration

### Jotform API Key

The application uses a Jotform API key to authenticate with the Jotform API. The key is stored in the following files:
- `app/api/jotform.ts`
- `app/api/submit-order/route.ts`
- `app/api/test-submit/route.ts`
- `app/api/get-form-fields/route.ts`

### Form IDs

The application uses three Jotform forms identified by their IDs, defined in `app/api/jotform.ts`:
```typescript
export const FORM_IDS = {
  form1: '251074116166956',
  form2: '251073669442965',
  form3: '251073643151954'
};
```

### Order Submission Process

When a customer completes an order:

1. The order data is sent to the `/api/submit-order` endpoint.
2. The endpoint formats the data according to Jotform's requirements.
3. The formatted data is submitted to Jotform using the `axios` library.
4. Upon successful submission, Jotform returns a `submissionID` which is used as the order ID.
5. The order ID is returned to the client for confirmation.

### Verifying Successful Submissions

To verify that an order was successfully submitted to Jotform:

1. Check the API response from Jotform; it should have `responseCode: 200` and a `submissionID` in the `content` property.
2. The server logs contain detailed information about the submission process.
3. The order ID (Jotform's `submissionID`) is returned to the client and can be used to track the order.

### Troubleshooting Submissions

If orders are not being submitted correctly:

1. Check the server logs for detailed information about the submission process.
2. Verify that the form field mappings in `app/api/submit-order/route.ts` match the actual field IDs in your Jotform forms.
3. Make sure the API key is valid and has permissions to submit to the forms.
4. Use the `/form-details/test-submit` page to test submissions directly.

## Development Tools

The application includes several tools to help with development:

- **Form Details Page**: `/form-details` - Displays details about the Jotform forms, including field IDs and types.
- **Test Submit Page**: `/form-details/test-submit` - Allows testing form submissions directly.

These tools are only available in development mode (when `NODE_ENV` is not `'production'`).

## API Endpoints

- `/api/forms` - Get all forms or details of a specific form
- `/api/get-form-fields` - Get fields for a specific form
- `/api/submit-order` - Submit an order to Jotform
- `/api/test-submit` - Test submit data to a form

## Custom Hooks

- `useJotform` - Hook for interacting with Jotform forms (fetching forms, fields, and submitting data) 