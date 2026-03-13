import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 20,
  },
  logo: {
    width: 100,
    height: 'auto',
  },
  businessDetails: {
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 20,
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: '#f3f4f6',
    padding: 10,
  },
  invoiceLeft: {
    width: '50%',
  },
  invoiceRight: {
    width: '50%',
    textAlign: 'right',
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientAddress: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 2,
  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#2563eb',
  },
  tableHeaderText: {
    color: 'white',
    fontSize: 10,
    padding: 5,
    fontWeight: 'bold',
  },
  tableCol1: { width: '10%', padding: 5, textAlign: 'center' },
  tableCol2: { width: '40%', padding: 5, textAlign: 'left' },
  tableCol3: { width: '15%', padding: 5, textAlign: 'right' },
  tableCol4: { width: '15%', padding: 5, textAlign: 'right' },
  tableCol5: { width: '20%', padding: 5, textAlign: 'right' },
  tableCell: {
    fontSize: 10,
  },
  totals: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'space-between',
    padding: 5,
  },
  totalText: {
    fontSize: 10,
  },
  totalAmount: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

interface InvoicePDFProps {
  job: any;
  businessDetails: any;
  invoiceNumber: string;
  quantity: string;
  description: string;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ 
  job, 
  businessDetails, 
  invoiceNumber,
  quantity,
  description
}) => {
  const subtotal = (job.labour_cost || 0) + (job.materials_cost || 0);
  const vatRate = job.vat_rate || 13.5;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          {businessDetails.business_logo_url && 
           businessDetails.business_logo_url.startsWith('data:image') && (
            <Image 
              src={businessDetails.business_logo_url}
              style={styles.logo} 
            />
          )}
          <View style={styles.businessDetails}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{businessDetails.business_name}</Text>
            <Text style={{ fontSize: 10 }}>{businessDetails.business_address}</Text>
            <Text style={{ fontSize: 10 }}>Tel: {businessDetails.business_phone}</Text>
            <Text style={{ fontSize: 10 }}>VAT No.: {businessDetails.business_vat}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>INVOICE</Text>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceLeft}>
            <Text style={{ fontSize: 10, marginBottom: 2 }}>Invoice No.: {invoiceNumber}</Text>
            <Text style={{ fontSize: 10 }}>Date: {new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.invoiceRight}>
            <Text style={styles.clientName}>{job.client_name}</Text>
            <Text style={styles.clientAddress}>{job.location || 'No address provided'}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCol1, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.tableCol2, styles.tableHeaderText]}>Description</Text>
            <Text style={[styles.tableCol3, styles.tableHeaderText]}>Unit Price</Text>
            <Text style={[styles.tableCol4, styles.tableHeaderText]}>VAT Rate</Text>
            <Text style={[styles.tableCol5, styles.tableHeaderText]}>Total</Text>
          </View>

          {/* Table Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol1, styles.tableCell]}>{quantity || '1'}</Text>
            <Text style={[styles.tableCol2, styles.tableCell]}>{description || job.description}</Text>
            <Text style={[styles.tableCol3, styles.tableCell]}>€{subtotal.toFixed(2)}</Text>
            <Text style={[styles.tableCol4, styles.tableCell]}>{vatRate}%</Text>
            <Text style={[styles.tableCol5, styles.tableCell]}>€{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Subtotal:</Text>
            <Text style={styles.totalAmount}>€{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>VAT ({vatRate}%):</Text>
            <Text style={styles.totalAmount}>€{vatAmount.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, { fontWeight: 'bold' }]}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>€{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Legal Footer */}
        <View style={styles.footer}>
          <Text>{businessDetails.invoice_legal_text || 'All goods supplied, remain the property of Frank Rooney Electrical until paid in Full'}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;