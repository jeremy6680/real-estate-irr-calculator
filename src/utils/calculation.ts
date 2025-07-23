import { Project, CashFlow, SaleProceeds, InitialInvestment, ErrorState } from '../types';

/**
 * Error types for IRR calculation
 */
export enum IRRErrorType {
    NO_SOLUTION = 'NO_SOLUTION',
    MULTIPLE_SOLUTIONS = 'MULTIPLE_SOLUTIONS',
    CONVERGENCE_FAILURE = 'CONVERGENCE_FAILURE',
    INVALID_CASH_FLOWS = 'INVALID_CASH_FLOWS',
    INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
}

/**
 * IRR calculation result
 */
export interface IRRResult {
    irr: number | null;
    npv: number | null;
    error?: ErrorState;
}

/**
 * Calculates the Net Present Value (NPV) of a series of cash flows at a given discount rate
 * 
 * @param cashFlows Array of cash flow values (negative for outflows, positive for inflows)
 * @param rate Discount rate as a decimal (e.g., 0.1 for 10%)
 * @returns The NPV value
 */
export const calculateNPV = (cashFlows: number[], rate: number): number => {
    if (!cashFlows || cashFlows.length === 0) {
        throw new Error('Cash flows array cannot be empty');
    }

    return cashFlows.reduce((npv, cashFlow, index) => {
        return npv + cashFlow / Math.pow(1 + rate, index);
    }, 0);
};

/**
 * Calculates the first derivative of the NPV function with respect to the rate
 * Used in the Newton-Raphson method for finding IRR
 * 
 * @param cashFlows Array of cash flow values
 * @param rate Discount rate as a decimal
 * @returns The derivative value
 */
export const calculateNPVDerivative = (cashFlows: number[], rate: number): number => {
    if (!cashFlows || cashFlows.length === 0) {
        throw new Error('Cash flows array cannot be empty');
    }

    return cashFlows.reduce((derivative, cashFlow, index) => {
        if (index === 0) return derivative; // First cash flow is not affected by the rate
        return derivative - (index * cashFlow) / Math.pow(1 + rate, index + 1);
    }, 0);
};

/**
 * Calculates the Internal Rate of Return (IRR) using the Newton-Raphson method
 * 
 * @param cashFlows Array of cash flow values (first value should be negative, representing initial investment)
 * @param initialGuess Initial guess for IRR (default: 0.1 or 10%)
 * @param maxIterations Maximum number of iterations (default: 100)
 * @param precision Precision for convergence (default: 0.0000001)
 * @returns IRR as a decimal or null if calculation fails
 */
export const calculateIRR = (
    cashFlows: number[],
    initialGuess: number = 0.1,
    maxIterations: number = 100,
    precision: number = 0.0000001
): IRRResult => {
    // Validate input
    if (!cashFlows || cashFlows.length < 2) {
        return {
            irr: null,
            npv: null,
            error: {
                type: 'calculation',
                message: 'Insufficient data for IRR calculation. Need at least initial investment and one cash flow.',
                severity: 'error',
            }
        };
    }

    // Check if there's at least one positive and one negative cash flow
    // This is a necessary condition for IRR to exist
    const hasPositive = cashFlows.some(cf => cf > 0);
    const hasNegative = cashFlows.some(cf => cf < 0);

    if (!hasPositive || !hasNegative) {
        return {
            irr: null,
            npv: null,
            error: {
                type: 'calculation',
                message: 'IRR calculation requires both positive and negative cash flows.',
                severity: 'error',
            }
        };
    }

    // Try different initial guesses if needed
    const guesses = [initialGuess, 0.01, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5, 0.75, 1.0];

    for (const guess of guesses) {
        // Newton-Raphson method implementation
        let rate = guess;
        let iteration = 0;
        let npv = 0;

        try {
            do {
                npv = calculateNPV(cashFlows, rate);
                const derivative = calculateNPVDerivative(cashFlows, rate);

                // Avoid division by zero
                if (Math.abs(derivative) < precision) {
                    break; // Try next guess
                }

                // Calculate next approximation
                const nextRate = rate - npv / derivative;

                // Check for convergence
                if (Math.abs(nextRate - rate) < precision) {
                    // Successful convergence
                    return {
                        irr: nextRate,
                        npv: calculateNPV(cashFlows, nextRate),
                    };
                }

                // Check for negative or extremely large rates
                if (nextRate < -1 || nextRate > 100) {
                    break; // Try next guess
                }

                rate = nextRate;
                iteration++;
            } while (iteration < maxIterations);
        } catch (error) {
            // Try next guess
            continue;
        }
    }

    // If we reach here, we've tried all guesses without success
    return {
        irr: null,
        npv: null,
        error: {
            type: 'calculation',
            message: 'IRR calculation failed to converge with any initial guess.',
            severity: 'error',
        }
    };
};

/**
 * Checks if a project might have multiple IRR solutions
 * This is a heuristic check based on the pattern of cash flow sign changes
 * 
 * @param cashFlows Array of cash flow values
 * @returns True if multiple solutions are possible
 */
export const mightHaveMultipleIRRSolutions = (cashFlows: number[]): boolean => {
    if (!cashFlows || cashFlows.length < 3) return false;

    // Count sign changes in the cash flow series
    let signChanges = 0;
    let previousSign = Math.sign(cashFlows[0]);

    for (let i = 1; i < cashFlows.length; i++) {
        const currentSign = Math.sign(cashFlows[i]);
        if (currentSign !== 0 && previousSign !== 0 && currentSign !== previousSign) {
            signChanges++;
        }
        if (currentSign !== 0) {
            previousSign = currentSign;
        }
    }

    // Descartes' rule of signs: there can be as many positive real roots as there are sign changes,
    // or fewer by an even number. Multiple IRR solutions are possible with more than one sign change.
    return signChanges > 1;
};

/**
 * Converts project data into a cash flow array suitable for IRR calculation
 * 
 * @param initialInvestment Initial investment data
 * @param cashFlows Array of periodic cash flows
 * @param saleProceeds Sale proceeds data
 * @returns Array of cash flow values for IRR calculation
 */
export const projectToCashFlowArray = (
    initialInvestment: InitialInvestment,
    cashFlows: CashFlow[],
    saleProceeds: SaleProceeds
): number[] => {
    if (!initialInvestment || !cashFlows || !saleProceeds) {
        throw new Error('Missing required project data');
    }

    // Initial investment (negative cash flow)
    const result: number[] = [-initialInvestment.total];

    // Standardize all cash flows to the same period type (convert monthly to annual if mixed)
    const isMonthly = cashFlows.some(cf => cf.periodType === 'monthly');
    const standardizedCashFlows = [...cashFlows].sort((a, b) => a.period - b.period);

    // Group cash flows by period
    const groupedCashFlows = new Map<number, number>();

    standardizedCashFlows.forEach(cf => {
        let period = cf.period;
        // Convert to standardized period if needed
        if (isMonthly && cf.periodType === 'annual') {
            // Convert annual to monthly (spread over 12 months)
            for (let i = 0; i < 12; i++) {
                const monthPeriod = (cf.period - 1) * 12 + i + 1;
                groupedCashFlows.set(monthPeriod, (groupedCashFlows.get(monthPeriod) || 0) + cf.netCashFlow / 12);
            }
        } else if (!isMonthly && cf.periodType === 'monthly') {
            // Convert monthly to annual (aggregate by year)
            period = Math.ceil(cf.period / 12);
            groupedCashFlows.set(period, (groupedCashFlows.get(period) || 0) + cf.netCashFlow);
        } else {
            // Same period type, just add
            groupedCashFlows.set(period, (groupedCashFlows.get(period) || 0) + cf.netCashFlow);
        }
    });

    // Convert the map to an array, filling in any gaps with zero
    const maxPeriod = Math.max(...groupedCashFlows.keys());
    for (let i = 1; i <= maxPeriod; i++) {
        result.push(groupedCashFlows.get(i) || 0);
    }

    // Add sale proceeds to the final period
    let holdingPeriod = saleProceeds.holdingPeriod;
    if (saleProceeds.holdingPeriodType === 'months' && !isMonthly) {
        // Convert months to years for annual cash flows
        holdingPeriod = Math.ceil(holdingPeriod / 12);
    } else if (saleProceeds.holdingPeriodType === 'years' && isMonthly) {
        // Convert years to months for monthly cash flows
        holdingPeriod = holdingPeriod * 12;
    }

    // Ensure the array is long enough
    while (result.length <= holdingPeriod) {
        result.push(0);
    }

    // Add sale proceeds to the final period
    result[holdingPeriod] += saleProceeds.netProceeds;

    return result;
};

/**
 * Calculates IRR and NPV for a real estate investment project
 * 
 * @param project The project data
 * @returns IRR calculation result
 */
export const calculateProjectIRR = (project: Project): IRRResult => {
    try {
        // Convert project data to cash flow array
        const cashFlows = projectToCashFlowArray(
            project.initialInvestment,
            project.cashFlows,
            project.saleProceeds
        );

        // Check for potential multiple solutions
        if (mightHaveMultipleIRRSolutions(cashFlows)) {
            // We'll still attempt to calculate, but warn about potential multiple solutions
            const result = calculateIRR(cashFlows);
            if (result.irr !== null) {
                return {
                    ...result,
                    error: {
                        type: 'calculation',
                        message: 'Multiple IRR solutions may exist. The calculated value may not be the only solution.',
                        severity: 'warning',
                    }
                };
            }
            return result;
        }

        // Standard calculation
        return calculateIRR(cashFlows);
    } catch (error) {
        return {
            irr: null,
            npv: null,
            error: {
                type: 'calculation',
                message: `IRR calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: 'error',
            }
        };
    }
};