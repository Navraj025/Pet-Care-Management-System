/**
 * Centralized Currency Formatter for Indian Rupees (INR - ₹)
 * Uses Intl.NumberFormat for standard Indian numbering formatting (e.g. ₹500, ₹1,000, ₹1,50,000)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const numericAmount = Number(amount);
  
  // Custom format or standard Intl format
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: numericAmount % 1 === 0 ? 0 : 2
    }).format(numericAmount);
  } catch (e) {
    return `₹${numericAmount.toLocaleString('en-IN')}`;
  }
};
