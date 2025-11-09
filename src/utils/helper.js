// Helper utility functions

// Format date to MySQL datetime
exports.formatDateTime = (date) => {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  };
  
  // Check if temperature is within safe range
  exports.isTempInRange = (temp, minTemp, maxTemp) => {
    return temp >= minTemp && temp <= maxTemp;
  };
  
  // Calculate temperature status
  exports.getTempStatus = (temp, minTemp, maxTemp) => {
    if (temp < minTemp || temp > maxTemp) return 'Critical';
    const buffer = (maxTemp - minTemp) * 0.2;
    if (temp < minTemp + buffer || temp > maxTemp - buffer) return 'Warning';
    return 'Normal';
  };
  
  // Format response
  exports.formatResponse = (success, message, data = null) => {
    const response = { success, message };
    if (data) response.data = data;
    return response;
  };
  
  // Calculate days until expiry
  exports.daysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Pagination helper
  exports.paginate = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return { limit: parseInt(limit), offset: parseInt(offset) };
  };
  