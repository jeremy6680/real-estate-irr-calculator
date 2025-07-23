import type {
  Project,
  InitialInvestment,
  CashFlow,
  SaleProceeds,
  ValidationResult,
  ValidationError,
} from '@/types';

/**
 * Validates a number field
 * @param value The value to validate
 * @param fieldName The name of the field
 * @param min Optional minimum value
 * @param max Optional maximum value
 * @returns ValidationError or null if valid
 */
export const validateNumber = (
  value: number | undefined | null,
  fieldName: string,
  min?: number,
  max?: number
): ValidationError | null => {
  if (value === undefined || value === null) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid number`,
    };
  }

  if (min !== undefined && value < min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${min}`,
    };
  }

  if (max !== undefined && value > max) {
    return {
      field: fieldName,
      message: `${fieldName} must be at most ${max}`,
    };
  }

  return null;
};

/**
 * Validates a string field
 * @param value The value to validate
 * @param fieldName The name of the field
 * @param required Whether the field is required
 * @param maxLength Optional maximum length
 * @returns ValidationError or null if valid
 */
export const validateString = (
  value: string | undefined | null,
  fieldName: string,
  required: boolean = true,
  maxLength?: number
): ValidationError | null => {
  if ((value === undefined || value === null || value === '') && required) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }

  if (value !== undefined && value !== null && typeof value !== 'string') {
    return {
      field: fieldName,
      message: `${fieldName} must be a string`,
    };
  }

  if (
    value !== undefined &&
    value !== null &&
    maxLength !== undefined &&
    value.length > maxLength
  ) {
    return {
      field: fieldName,
      message: `${fieldName} must be at most ${maxLength} characters`,
    };
  }

  return null;
};

/**
 * Validates an InitialInvestment object
 * @param investment The InitialInvestment object to validate
 * @returns ValidationResult
 */
export const validateInitialInvestment = (investment: InitialInvestment): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate purchase price
  const purchasePriceError = validateNumber(investment.purchasePrice, 'Purchase Price', 0);
  if (purchasePriceError) errors.push(purchasePriceError);

  // Validate closing costs
  const closingCostsError = validateNumber(investment.closingCosts, 'Closing Costs', 0);
  if (closingCostsError) errors.push(closingCostsError);

  // Validate renovation costs
  const renovationCostsError = validateNumber(investment.renovationCosts, 'Renovation Costs', 0);
  if (renovationCostsError) errors.push(renovationCostsError);

  // Validate other upfront expenses
  const otherExpensesError = validateNumber(
    investment.otherUpfrontExpenses,
    'Other Upfront Expenses',
    0
  );
  if (otherExpensesError) errors.push(otherExpensesError);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates a CashFlow object
 * @param cashFlow The CashFlow object to validate
 * @returns ValidationResult
 */
export const validateCashFlow = (cashFlow: CashFlow): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate period
  const periodError = validateNumber(cashFlow.period, 'Period', 1);
  if (periodError) errors.push(periodError);

  // Validate period type
  if (cashFlow.periodType !== 'monthly' && cashFlow.periodType !== 'annual') {
    errors.push({
      field: 'Period Type',
      message: 'Period Type must be either "monthly" or "annual"',
    });
  }

  // Validate rental income
  const rentalIncomeError = validateNumber(cashFlow.rentalIncome, 'Rental Income', 0);
  if (rentalIncomeError) errors.push(rentalIncomeError);

  // Validate operating expenses
  const operatingExpensesError = validateNumber(
    cashFlow.operatingExpenses,
    'Operating Expenses',
    0
  );
  if (operatingExpensesError) errors.push(operatingExpensesError);

  // Validate debt service
  const debtServiceError = validateNumber(cashFlow.debtService, 'Debt Service', 0);
  if (debtServiceError) errors.push(debtServiceError);

  // Validate vacancy loss
  const vacancyLossError = validateNumber(cashFlow.vacancyLoss, 'Vacancy Loss', 0);
  if (vacancyLossError) errors.push(vacancyLossError);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates a SaleProceeds object
 * @param saleProceeds The SaleProceeds object to validate
 * @returns ValidationResult
 */
export const validateSaleProceeds = (saleProceeds: SaleProceeds): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate estimated sale price
  const salePriceError = validateNumber(saleProceeds.estimatedSalePrice, 'Estimated Sale Price', 0);
  if (salePriceError) errors.push(salePriceError);

  // Validate selling costs
  const sellingCostsError = validateNumber(saleProceeds.sellingCosts, 'Selling Costs', 0);
  if (sellingCostsError) errors.push(sellingCostsError);

  // Validate holding period
  const holdingPeriodError = validateNumber(saleProceeds.holdingPeriod, 'Holding Period', 1);
  if (holdingPeriodError) errors.push(holdingPeriodError);

  // Validate holding period type
  if (saleProceeds.holdingPeriodType !== 'months' && saleProceeds.holdingPeriodType !== 'years') {
    errors.push({
      field: 'Holding Period Type',
      message: 'Holding Period Type must be either "months" or "years"',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates a Project object
 * @param project The Project object to validate
 * @returns ValidationResult
 */
export const validateProject = (project: Project): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate ID
  const idError = validateString(project.id, 'ID');
  if (idError) errors.push(idError);

  // Validate name
  const nameError = validateString(project.name, 'Name', true, 100);
  if (nameError) errors.push(nameError);

  // Validate description (optional)
  if (project.description !== undefined) {
    const descriptionError = validateString(project.description, 'Description', false, 1000);
    if (descriptionError) errors.push(descriptionError);
  }

  // Validate dates
  if (!project.createdAt || isNaN(new Date(project.createdAt).getTime())) {
    errors.push({
      field: 'Created At',
      message: 'Created At must be a valid date',
    });
  }

  if (!project.updatedAt || isNaN(new Date(project.updatedAt).getTime())) {
    errors.push({
      field: 'Updated At',
      message: 'Updated At must be a valid date',
    });
  }

  // Validate initial investment
  if (!project.initialInvestment) {
    errors.push({
      field: 'Initial Investment',
      message: 'Initial Investment is required',
    });
  } else {
    const initialInvestmentResult = validateInitialInvestment(project.initialInvestment);
    if (!initialInvestmentResult.isValid) {
      errors.push(...initialInvestmentResult.errors);
    }
  }

  // Validate cash flows
  if (!Array.isArray(project.cashFlows)) {
    errors.push({
      field: 'Cash Flows',
      message: 'Cash Flows must be an array',
    });
  } else if (project.cashFlows.length === 0) {
    errors.push({
      field: 'Cash Flows',
      message: 'At least one cash flow is required',
    });
  } else {
    project.cashFlows.forEach((cashFlow: CashFlow, index: number) => {
      const cashFlowResult = validateCashFlow(cashFlow);
      if (!cashFlowResult.isValid) {
        cashFlowResult.errors.forEach((error: ValidationError) => {
          errors.push({
            field: `Cash Flow ${index + 1} - ${error.field}`,
            message: error.message,
          });
        });
      }
    });
  }

  // Validate sale proceeds
  if (!project.saleProceeds) {
    errors.push({
      field: 'Sale Proceeds',
      message: 'Sale Proceeds is required',
    });
  } else {
    const saleProceedsResult = validateSaleProceeds(project.saleProceeds);
    if (!saleProceedsResult.isValid) {
      errors.push(...saleProceedsResult.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
