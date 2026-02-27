import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font (optional - default is Helvetica)
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  summary: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: 8,
    marginTop: 10,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    padding: 8,
    fontSize: 9,
  },
  col1: { width: '15%' },
  col2: { width: '20%' },
  col3: { width: '25%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  col6: { width: '10%' },
  statusBadge: {
    padding: '2 6',
    borderRadius: 12,
    fontSize: 8,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

interface JobReportPDFProps {
  jobs: any[];
  filters: {
    statuses: string[];
    payments: string[];
    month: string | null;
    dateFrom: string | null;
    dateTo: string | null;
  };
}

const JobReportPDF: React.FC<JobReportPDFProps> = ({ jobs, filters }) => {
  // Calculate totals
  const totalJobs = jobs.length;
  const totalRevenue = jobs.reduce((sum, job) => sum + (job.total_cost || 0), 0);
  const totalLabour = jobs.reduce((sum, job) => sum + (job.labour_cost || 0), 0);
  const totalMaterials = jobs.reduce((sum, job) => sum + (job.materials_cost || 0), 0);
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const unpaidCount = jobs.filter(j => j.payment_status === 'unpaid').length;

  // Format filter description
  const getFilterDescription = () => {
    const parts = [];
    if (filters.month) {
      const [year, month] = filters.month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      parts.push(`${monthNames[parseInt(month) - 1]} ${year}`);
    } else if (filters.dateFrom && filters.dateTo) {
      parts.push(`${filters.dateFrom} to ${filters.dateTo}`);
    }
    if (filters.statuses.length > 0) {
      parts.push(`Status: ${filters.statuses.join(', ')}`);
    }
    if (filters.payments.length > 0) {
      parts.push(`Payment: ${filters.payments.join(', ')}`);
    }
    return parts.join(' • ');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Job Report</Text>
          <Text style={styles.subtitle}>Generated: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.subtitle}>Filters: {getFilterDescription()}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Jobs:</Text>
            <Text style={styles.summaryValue}>{totalJobs}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Revenue:</Text>
            <Text style={styles.summaryValue}>£{totalRevenue.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Labour:</Text>
            <Text style={styles.summaryValue}>£{totalLabour.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Materials:</Text>
            <Text style={styles.summaryValue}>£{totalMaterials.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completed/Unpaid:</Text>
            <Text style={styles.summaryValue}>{completedCount}/{unpaidCount}</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Date</Text>
          <Text style={styles.col2}>Client</Text>
          <Text style={styles.col3}>Description</Text>
          <Text style={styles.col4}>Status</Text>
          <Text style={styles.col5}>Payment</Text>
          <Text style={styles.col6}>Total</Text>
        </View>

        {/* Table Rows */}
        {jobs.map((job, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.col1}>{new Date(job.job_date).toLocaleDateString()}</Text>
            <Text style={styles.col2}>{job.client_name}</Text>
            <Text style={styles.col3}>{job.description.substring(0, 30)}...</Text>
            <Text style={styles.col4}>{job.status.replace('_', ' ')}</Text>
            <Text style={styles.col5}>{job.payment_status}</Text>
            <Text style={styles.col6}>£{(job.total_cost || 0).toFixed(2)}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Report generated by Job Book Assistant • Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default JobReportPDF;