import { Project, InitialInvestment, CashFlow, SaleProceeds } from '../types';
import { generateId } from './index';
import { calculateTotalInitialInvestment, calculateNetCashFlow, calculateNetSaleProceeds } from './index';

/**
 * Creates a new InitialInvestment object with default values
 * @returns A new InitialInvestment object
 */
export const createInitialInvestment = (
  purchasePrice: number = 0,
  closingCosts: number = 0,
  renovationCosts: number = 0,
  otherUpfrontExpenses: number = 0
): InitialInvestment => {
  return {
    purchasePrice,
    closingCosts,
    renovationCosts,
    otherUpfrontExpenses,
    total: calculateTotalInitialInvestment(
      purchasePrice,
      closingCosts,
      renovationCosts,
      otherUpfrontExpenses
    ),
  };
};

/**
 * Creates a new CashFlow object with default values
 * @param period The period number
 * @param periodType The period type (monthly or annual)
 * @returns A new CashFlow object
 */
export const createCashFlow = (
  period: number = 1,
  periodType: 'monthly' | 'annual' = 'annual',
  rentalIncome: number = 0,
  operatingExpenses: number = 0,
  debtService: number = 0,
  vacancyLoss: number = 0
): CashFlow => {
  return {
    period,
    periodType,
    rentalIncome,
    operatingExpenses,
    debtService,
    vacancyLoss,
    netCashFlow: calculateNetCashFlow(rentalIncome, operatingExpenses, debtService, vacancyLoss),
  };
};

/**
 * Creates a new SaleProceeds object with default values
 * @returns A new SaleProceeds object
 */
export const createSaleProceeds = (
  estimatedSalePrice: number = 0,
  sellingCosts: number = 0,
  holdingPeriod: number = 1,
  holdingPeriodType: 'months' | 'years' = 'years'
): SaleProceeds => {
  return {
    estimatedSalePrice,
    sellingCosts,
    netProceeds: calculateNetSaleProceeds(estimatedSalePrice, sellingCosts),
    holdingPeriod,
    holdingPeriodType,
  };
};

/**
 * Creates a new Project object with default values
 * @param name The project name
 * @param description Optional project description
 * @returns A new Project object
 */
export const createProject = (name: string, description?: string): Project => {
  const now = new Date();
  
  return {
    id: generateId(),
    name,
    description,
    createdAt: now,
    updatedAt: now,
    initialInvestment: createInitialInvestment(),
    cashFlows: [createCashFlow()],
    saleProceeds: createSaleProceeds(),
    calculatedIRR: undefined,
    calculatedNPV: undefined,
  };
};