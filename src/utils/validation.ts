import type { Project, InitialInvestment, CashFlow, SaleProceeds, ValidationResult, ValidationError } from '../types';

/**
 * Validates a number value
 * @param value The value to validate
 * @param fieldName The name of the field being validated
 * @param min Optional minimum value
 * @param max Optional maximum value
 * @returns ValidationError if invalid, null if valid
 */
export const validateNumber = (
  value: any,
  fieldName: string,
  min?: number,
  max?: number
): ValidationError | null => {
  // Check if value is null or undefined
  if (value === null || value === undefined) {
    return {
      field: fieldName,
      message: `${fieldName} is required`
    };
  }

  // Check if value is a number
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid number`
    };
  }

  // Check minimum value
  if (min !== undefined && value < min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${min}`
    };
  }

  // Check maximum value
  if (max !== undefined && value > max) {
    return {
      field: fieldName,
      message: `${fieldName} must be at most ${max}`
    };
  }

  return null;
};

/**
 * Validates a string value
 * @param value The value to validate
 * @param fieldName The name of the field being validated
 * @param required Whether the field is required
 * @param maxLength Optional maximum length
 * @returns ValidationError if invalid, null if valid
 */
export const validateString = (
  value: any,
  fieldName: string,
  required: boolean = true,
  maxLength?: number
): ValidationError | null => {
  // Check if value is null, undefined, or empty string for required fields
  if (required && (value === null || value === undefined || value === '')) {
    return {
      field: fieldName,
      message: `${fieldName} is required`
    };
  }

  // If not required and value is null/undefined/empty, it's valid
  if (!required && (value === null || value === undefined || value === '')) {
    return null;
  }

  // Check if value is a string
  if (typeof value !== 'string') {
    return {
      field: fieldName,
      message: `${fieldName} must be a string`
    };
  }

  // Check maximum length
  if (maxLength !== undefined && value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at most ${maxLength} characters`
    };
  }

  return null;
};

/**
 * Validates an InitialInvestment object
 * @param investment The InitialInvestment object to validate
 * @returns ValidationResult with any errors found
 */
export const validateInitialInvestment = (investment: InitialInvestment): ValidationResult => {
  const errors: ValidationError[] = [];

  // Purchase price must be greater than zero
  if (investment.purchasePrice <= 0) {
    errors.push({
      field: 'purchasePrice',
      message: 'Purchase price must be greater than zero'
    });
  }

  // Closing costs must be non-negative
  if (investment.closingCosts < 0) {
    errors.push({
      field: 'closingCosts',
      message: 'Closing costs cannot be negative'
    });
  }

  // Renovation costs must be non-negative
  if (investment.renovationCosts < 0) {
    errors.push({
      field: 'renovationCosts',
      message: 'Renovation costs cannot be negative'
    });
  }

  // Other upfront expenses must be non-negative
  if (investment.otherUpfrontExpenses < 0) {
    errors.push({
      field: 'otherUpfrontExpenses',
      message: 'Other upfront expenses cannot be negative'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates a CashFlow object
 * @param cashFlow The CashFlow object to validate
 * @returns ValidationResult with any errors found
 */
export const validateCashFlow = (cashFlow: CashFlow): ValidationResult => {
  const errors: ValidationError[] = [];

  // Period must be positive
  if (cashFlow.period <= 0) {
    errors.push({
      field: 'period',
      message: 'Period must be greater than zero'
    });
  }

  // Rental income must be non-negative
  if (cashFlow.rentalIncome < 0) {
    errors.push({
      field: 'rentalIncome',
      message: 'Rental income cannot be negative'
    });
  }

  // Operating expenses must be non-negative
  if (cashFlow.operatingExpenses < 0) {
    errors.push({
      field: 'operatingExpenses',
      message: 'Operating expenses cannot be negative'
    });
  }

  // Debt service must be non-negative
  if (cashFlow.debtService < 0) {
    errors.push({
      field: 'debtService',
      message: 'Debt service cannot be negative'
    });
  }

  // Vacancy loss must be non-negative
  if (cashFlow.vacancyLoss < 0) {
    errors.push({
      field: 'vacancyLoss',
      message: 'Vacancy loss cannot be negative'
    });
  }

  // Period type must be valid
  if (cashFlow.periodType !== 'monthly' && cashFlow.periodType !== 'annual') {
    errors.push({
      field: 'periodType',
      message: 'Period type must be either "monthly" or "annual"'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates a SaleProceeds object
 * @param saleProceeds The SaleProceeds object to validate
 * @returns ValidationResult with any errors found
 */
export const validateSaleProceeds = (saleProceeds: SaleProceeds): ValidationResult => {
  const errors: ValidationError[] = [];

  // Estimated sale price must be greater than zero
  if (saleProceeds.estimatedSalePrice <= 0) {
    errors.push({
      field: 'estimatedSalePrice',
      message: 'Estimated sale price must be greater than zero'
    });
  }

  // Selling costs must be non-negative
  if (saleProceeds.sellingCosts < 0) {
    errors.push({
      field: 'sellingCosts',
      message: 'Selling costs cannot be negative'
    });
  }

  // Holding period must be positive
  if (saleProceeds.holdingPeriod <= 0) {
    errors.push({
      field: 'holdingPeriod',
      message: 'Holding period must be greater than zero'
    });
  }

  // Holding period type must be valid
  if (saleProceeds.holdingPeriodType !== 'months' && saleProceeds.holdingPeriodType !== 'years') {
    errors.push({
      field: 'holdingPeriodType',
      message: 'Holding period type must be either "months" or "years"'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates a Project object
 * @param project The Project object to validate
 * @returns ValidationResult with any errors found
 */
export const validateProject = (project: Project): ValidationResult => {
  const errors: ValidationError[] = [];

  // Project name is required
  if (!project.name || project.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Project name is required'
    });
  }

  // Validate initial investment
  const initialInvestmentValidation = validateInitialInvestment(project.initialInvestment);
  if (!initialInvestmentValidation.isValid) {
    errors.push(...initialInvestmentValidation.errors);
  }

  // Validate cash flows
  if (project.cashFlows.length === 0) {
    errors.push({
      field: 'cashFlows',
      message: 'At least one cash flow period is required'
    });
  } else {
    project.cashFlows.forEach((cashFlow, index) => {
      const cashFlowValidation = validateCashFlow(cashFlow);
      if (!cashFlowValidation.isValid) {
        cashFlowValidation.errors.forEach(error => {
          errors.push({
            field: `cashFlows[${index}].${error.field}`,
            message: `Cash flow period ${index + 1}: ${error.message}`
          });
        });
      }
    });
  }

  // Validate sale proceeds
  const saleProceedsValidation = validateSaleProceeds(project.saleProceeds);
  if (!saleProceedsValidation.isValid) {
    errors.push(...saleProceedsValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};