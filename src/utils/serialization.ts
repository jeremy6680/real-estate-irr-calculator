import type { Project, InitialInvestment, CashFlow, SaleProceeds } from '../types';
import { calculateTotalInitialInvestment, calculateNetCashFlow, calculateNetSaleProceeds } from './index';

/**
 * Serializes a Date object to ISO string for storage
 * @param date The Date object to serialize
 * @returns ISO string representation of the date
 */
export const serializeDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Deserializes an ISO string to a Date object
 * @param dateString The ISO string to deserialize
 * @returns Date object
 */
export const deserializeDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Serializes an InitialInvestment object for storage
 * @param investment The InitialInvestment object to serialize
 * @returns Plain object representation for storage
 */
export const serializeInitialInvestment = (investment: InitialInvestment): Record<string, any> => {
  return {
    purchasePrice: investment.purchasePrice,
    closingCosts: investment.closingCosts,
    renovationCosts: investment.renovationCosts,
    otherUpfrontExpenses: investment.otherUpfrontExpenses,
    total: calculateTotalInitialInvestment(
      investment.purchasePrice,
      investment.closingCosts,
      investment.renovationCosts,
      investment.otherUpfrontExpenses
    ),
  };
};

/**
 * Deserializes a plain object to an InitialInvestment object
 * @param data The plain object to deserialize
 * @returns InitialInvestment object
 */
export const deserializeInitialInvestment = (data: Record<string, any>): InitialInvestment => {
  const investment: InitialInvestment = {
    purchasePrice: Number(data.purchasePrice) || 0,
    closingCosts: Number(data.closingCosts) || 0,
    renovationCosts: Number(data.renovationCosts) || 0,
    otherUpfrontExpenses: Number(data.otherUpfrontExpenses) || 0,
    total: Number(data.total) || 0,
  };

  // Recalculate total to ensure consistency
  investment.total = calculateTotalInitialInvestment(
    investment.purchasePrice,
    investment.closingCosts,
    investment.renovationCosts,
    investment.otherUpfrontExpenses
  );

  return investment;
};

/**
 * Serializes a CashFlow object for storage
 * @param cashFlow The CashFlow object to serialize
 * @returns Plain object representation for storage
 */
export const serializeCashFlow = (cashFlow: CashFlow): Record<string, any> => {
  return {
    period: cashFlow.period,
    periodType: cashFlow.periodType,
    rentalIncome: cashFlow.rentalIncome,
    operatingExpenses: cashFlow.operatingExpenses,
    debtService: cashFlow.debtService,
    vacancyLoss: cashFlow.vacancyLoss,
    netCashFlow: calculateNetCashFlow(
      cashFlow.rentalIncome,
      cashFlow.operatingExpenses,
      cashFlow.debtService,
      cashFlow.vacancyLoss
    ),
  };
};

/**
 * Deserializes a plain object to a CashFlow object
 * @param data The plain object to deserialize
 * @returns CashFlow object
 */
export const deserializeCashFlow = (data: Record<string, any>): CashFlow => {
  const cashFlow: CashFlow = {
    period: Number(data.period) || 1,
    periodType: data.periodType === 'monthly' ? 'monthly' : 'annual',
    rentalIncome: Number(data.rentalIncome) || 0,
    operatingExpenses: Number(data.operatingExpenses) || 0,
    debtService: Number(data.debtService) || 0,
    vacancyLoss: Number(data.vacancyLoss) || 0,
    netCashFlow: Number(data.netCashFlow) || 0,
  };

  // Recalculate net cash flow to ensure consistency
  cashFlow.netCashFlow = calculateNetCashFlow(
    cashFlow.rentalIncome,
    cashFlow.operatingExpenses,
    cashFlow.debtService,
    cashFlow.vacancyLoss
  );

  return cashFlow;
};

/**
 * Serializes a SaleProceeds object for storage
 * @param saleProceeds The SaleProceeds object to serialize
 * @returns Plain object representation for storage
 */
export const serializeSaleProceeds = (saleProceeds: SaleProceeds): Record<string, any> => {
  return {
    estimatedSalePrice: saleProceeds.estimatedSalePrice,
    sellingCosts: saleProceeds.sellingCosts,
    netProceeds: calculateNetSaleProceeds(saleProceeds.estimatedSalePrice, saleProceeds.sellingCosts),
    holdingPeriod: saleProceeds.holdingPeriod,
    holdingPeriodType: saleProceeds.holdingPeriodType,
  };
};

/**
 * Deserializes a plain object to a SaleProceeds object
 * @param data The plain object to deserialize
 * @returns SaleProceeds object
 */
export const deserializeSaleProceeds = (data: Record<string, any>): SaleProceeds => {
  const saleProceeds: SaleProceeds = {
    estimatedSalePrice: Number(data.estimatedSalePrice) || 0,
    sellingCosts: Number(data.sellingCosts) || 0,
    netProceeds: Number(data.netProceeds) || 0,
    holdingPeriod: Number(data.holdingPeriod) || 1,
    holdingPeriodType: data.holdingPeriodType === 'months' ? 'months' : 'years',
  };

  // Recalculate net proceeds to ensure consistency
  saleProceeds.netProceeds = calculateNetSaleProceeds(
    saleProceeds.estimatedSalePrice,
    saleProceeds.sellingCosts
  );

  return saleProceeds;
};

/**
 * Serializes a Project object for storage
 * @param project The Project object to serialize
 * @returns Plain object representation for storage
 */
export const serializeProject = (project: Project): Record<string, any> => {
  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    createdAt: serializeDate(project.createdAt),
    updatedAt: serializeDate(project.updatedAt),
    initialInvestment: serializeInitialInvestment(project.initialInvestment),
    cashFlows: project.cashFlows.map(serializeCashFlow),
    saleProceeds: serializeSaleProceeds(project.saleProceeds),
    calculatedIRR: project.calculatedIRR,
    calculatedNPV: project.calculatedNPV,
  };
};

/**
 * Deserializes a plain object to a Project object
 * @param data The plain object to deserialize
 * @returns Project object
 */
export const deserializeProject = (data: Record<string, any>): Project => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    createdAt: deserializeDate(data.createdAt),
    updatedAt: deserializeDate(data.updatedAt),
    initialInvestment: deserializeInitialInvestment(data.initialInvestment),
    cashFlows: Array.isArray(data.cashFlows) ? data.cashFlows.map(deserializeCashFlow) : [],
    saleProceeds: deserializeSaleProceeds(data.saleProceeds),
    calculatedIRR: data.calculatedIRR !== undefined ? Number(data.calculatedIRR) : undefined,
    calculatedNPV: data.calculatedNPV !== undefined ? Number(data.calculatedNPV) : undefined,
  };
};