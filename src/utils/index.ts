/**
 * Generates a unique ID for projects
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Formats a number as currency based on locale
 */
export const formatCurrency = (
  value: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a number as percentage based on locale
 */
export const formatPercentage = (value: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Calculates the total initial investment
 */
export const calculateTotalInitialInvestment = (
  purchasePrice: number,
  closingCosts: number,
  renovationCosts: number,
  otherUpfrontExpenses: number
): number => {
  return purchasePrice + closingCosts + renovationCosts + otherUpfrontExpenses;
};

/**
 * Calculates the net cash flow
 */
export const calculateNetCashFlow = (
  rentalIncome: number,
  operatingExpenses: number,
  debtService: number,
  vacancyLoss: number
): number => {
  return rentalIncome - operatingExpenses - debtService - vacancyLoss;
};

/**
 * Calculates the net sale proceeds
 */
export const calculateNetSaleProceeds = (
  estimatedSalePrice: number,
  sellingCosts: number
): number => {
  return estimatedSalePrice - sellingCosts;
};