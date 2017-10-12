import { format } from 'accounting-js';

export const formatAsCurrency = format;

export const currencyToFloat = value => (value ? parseFloat(value.replace(/[^0-9-.]/g, '')) : 0);

export const calculateAndFormatTotal = (quantity, amount, options) => {
  // We assume that amount will be a formatted currency string like $10,999.52.
  const total = (quantity * amount).toFixed(2);
  return format(total, options);
};

export const centsToDollars = cents => (cents / 100).toFixed(2);
