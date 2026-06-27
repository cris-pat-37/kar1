import apiRequest from './api';

const reportService = {
  getSummary: () => apiRequest('/api/reports/summary'),
  getChartsData: () => apiRequest('/api/reports/charts'),
  
  downloadCSV: async (type) => {
    try {
      const response = await apiRequest(`/api/reports/csv/${type}`);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `warehouse_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error downloading CSV report:', err);
      throw err;
    }
  },

  openPDF: async (type) => {
    try {
      const response = await apiRequest(`/api/reports/pdf/${type}`);
      const htmlText = await response.text();
      const blob = new Blob([htmlText], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Error opening PDF report:', err);
      throw err;
    }
  }
};

export default reportService;
