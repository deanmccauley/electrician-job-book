'use client';

import { useState } from 'react';
import { createClient } from '@/app/utils/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { X, Download, Loader2 } from 'lucide-react';

interface InvoiceModalProps {
  job: any;
  businessDetails: any;
  invoiceNumber: string; // Receive from server component
  onClose: () => void;
}

export default function InvoiceModal({ job, businessDetails, invoiceNumber, onClose }: InvoiceModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState(job.description);
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Generate Invoice</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Details */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 1, 2, 5 hours"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>€{((job.labour_cost || 0) + (job.materials_cost || 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT ({job.vat_rate || 13.5}%):</span>
              <span>€{((job.labour_cost || 0) + (job.materials_cost || 0)) * (job.vat_rate || 13.5) / 100}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>€{((job.labour_cost || 0) + (job.materials_cost || 0)) * (1 + (job.vat_rate || 13.5) / 100)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <PDFDownloadLink
            document={
              <InvoicePDF
                job={job}
                businessDetails={businessDetails}
                invoiceNumber={invoiceNumber}
                quantity={quantity}
                description={description}
              />
            }
            fileName={`invoice-${invoiceNumber}.pdf`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {({ loading }) => (
              <>
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Generating...' : 'Download PDF'}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
}