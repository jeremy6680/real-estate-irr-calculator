// Project Model
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  initialInvestment: InitialInvestment;
  cashFlows: CashFlow[];
  saleProceeds: SaleProceeds;
  calculatedIRR?: number;
  calculatedNPV?: number;
}

// Initial Investment Model
export interface InitialInvestment {
  purchasePrice: number;
  closingCosts: number;
  renovationCosts: number;
  otherUpfrontExpenses: number;
  total: number; // calculated field
}

// Cash Flow Model
export interface CashFlow {
  period: number;
  periodType: 'monthly' | 'annual';
  rentalIncome: number;
  operatingExpenses: number;
  debtService: number;
  vacancyLoss: number;
  netCashFlow: number; // calculated field
}

// Sale Proceeds Model
export interface SaleProceeds {
  estimatedSalePrice: number;
  sellingCosts: number;
  netProceeds: number; // calculated field
  holdingPeriod: number;
  holdingPeriodType: 'months' | 'years';
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
}

// Error State
export interface ErrorState {
  type: 'validation' | 'calculation' | 'storage' | 'network';
  message: string;
  field?: string; // for field-specific errors
  severity: 'error' | 'warning' | 'info';
}