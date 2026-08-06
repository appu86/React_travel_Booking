// Format price to Indian Rupees (INR)
export const formatINR = (amount) => {
  if (!amount || isNaN(amount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Convert USD to INR (approximate rate: 1 USD = 83 INR)
export const convertUSDtoINR = (usdAmount) => {
  const exchangeRate = 83;
  return Math.round(usdAmount * exchangeRate);
};

// Format large numbers with abbreviations (e.g., 1K, 1M)
export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
};

export default formatINR;
