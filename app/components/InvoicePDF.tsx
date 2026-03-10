import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

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
  clientSection: {
    marginBottom: 30,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeader: {
    backgroundColor: '#2563eb',
    color: 'white',
    fontWeight: 'bold',
  },
  tableCol1: { width: '10%', padding: 5 },
  tableCol2: { width: '50%', padding: 5 },
  tableCol3: { width: '15%', padding: 5, textAlign: 'right' },
  tableCol4: { width: '15%', padding: 5, textAlign: 'right' },
  tableCol5: { width: '10%', padding: 5, textAlign: 'right' },
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
          {businessDetails.logo_url && (
            <Image src={businessDetails.logo_url} style={styles.logo} />
          )}
          <View style={styles.businessDetails}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{businessDetails.business_name}</Text>
            <Text style={{ fontSize: 10 }}>{businessDetails.business_address}</Text>
            <Text style={{ fontSize: 10 }}>Tel: {businessDetails.business_phone}</Text>
            <Text style={{ fontSize: 10 }}>VAT: {businessDetails.business_vat}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>INVOICE</Text>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View>
            <Text>Invoice Number: {invoiceNumber}</Text>
            <Text>Date: {new Date().toLocaleDateString()}</Text>
          </View>
          <View>
            <Text>Client:</Text>
            <Text>{job.client_name}</Text>
            <Text>{job.location || 'No address provided'}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol1}>Qty</Text>
            <Text style={styles.tableCol2}>Description</Text>
            <Text style={styles.tableCol3}>Unit Price</Text>
            <Text style={styles.tableCol4}>VAT Rate</Text>
            <Text style={styles.tableCol5}>Total</Text>
          </View>

          {/* Table Row */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>{quantity || '1'}</Text>
            <Text style={styles.tableCol2}>{description || job.description}</Text>
            <Text style={styles.tableCol3}>€{subtotal.toFixed(2)}</Text>
            <Text style={styles.tableCol4}>{vatRate}%</Text>
            <Text style={styles.tableCol5}>€{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>€{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>VAT ({vatRate}%):</Text>
            <Text>€{vatAmount.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, { fontWeight: 'bold' }]}>
            <Text>Total:</Text>
            <Text>€{total.toFixed(2)}</Text>
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