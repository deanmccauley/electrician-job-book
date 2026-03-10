// This is a client-safe version that doesn't use next/headers
// It just defines the function signature, but the actual implementation
// will be passed from the server component

export interface InvoiceGenerator {
  getNextInvoiceNumber: () => Promise<string>;
}

