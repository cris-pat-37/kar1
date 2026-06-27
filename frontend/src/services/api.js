/**
 * Core fetch API wrapper for frontend requests.
 */
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('warehouse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `HTTP error! Status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('text/csv') || contentType.includes('text/html') || contentType.includes('application/octet-stream'))) {
    return response;
  }

  return response.json();
};

export default apiRequest;
