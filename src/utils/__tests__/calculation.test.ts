import { describe, it, expect } from 'vitest';
import {
    calculateNPV,
    calculateIRR,
    mightHaveMultipleIRRSolutions,
    projectToCashFlowArray,
    calculateProjectIRR
} from '../calculation';
import { createInitialInvestment, createCashFlow, createSaleProceeds, createProject } from '../factory';
import { Project } from '../../types';

describe('NPV Calculation', () => {
    it('should calculate NPV correctly for a simple cash flow series', () => {
        const cashFlows = [-1000, 300, 400, 500];
        const rate = 0.1; // 10%

        // Manual calculation: -1000 + 300/(1.1) + 400/(1.1)^2 + 500/(1.1)^3
        const expectedNPV = -1000 + 300 / 1.1 + 400 / 1.1 / 1.1 + 500 / 1.1 / 1.1 / 1.1;

        expect(calculateNPV(cashFlows, rate)).toBeCloseTo(expectedNPV, 2);
    });

    it('should throw an error for empty cash flows', () => {
        expect(() => calculateNPV([], 0.1)).toThrow();
    });

    it('should handle zero rate correctly', () => {
        const cashFlows = [-1000, 300, 400, 500];
        const rate = 0;

        // With zero rate, NPV is just the sum of cash flows
        const expectedNPV = -1000 + 300 + 400 + 500;

        expect(calculateNPV(cashFlows, rate)).toBeCloseTo(expectedNPV, 2);
    });

    it('should handle negative rates (though unusual in finance)', () => {
        const cashFlows = [-1000, 300, 400, 500];
        const rate = -0.05; // -5%

        // Manual calculation with negative rate
        const expectedNPV = -1000 + 300 / 0.95 + 400 / 0.95 / 0.95 + 500 / 0.95 / 0.95 / 0.95;

        expect(calculateNPV(cashFlows, rate)).toBeCloseTo(expectedNPV, 2);
    });
});

describe('IRR Calculation', () => {
    it('should calculate IRR correctly for a simple investment', () => {
        const cashFlows = [-1000, 300, 400, 500];
        const result = calculateIRR(cashFlows);

        // The IRR should be around 8-9% for this cash flow series
        expect(result.irr).toBeGreaterThan(0.08);
        expect(result.irr).toBeLessThan(0.09);
        expect(result.npv).toBeCloseTo(0, 2); // NPV should be close to zero at the IRR
    });

    it('should return null for insufficient data', () => {
        const result = calculateIRR([-1000]);
        expect(result.irr).toBeNull();
        expect(result.error).toBeDefined();
    });

    it('should return null when all cash flows are positive', () => {
        const result = calculateIRR([1000, 300, 400]);
        expect(result.irr).toBeNull();
        expect(result.error).toBeDefined();
    });

    it('should return null when all cash flows are negative', () => {
        const result = calculateIRR([-1000, -300, -400]);
        expect(result.irr).toBeNull();
        expect(result.error).toBeDefined();
    });

    it('should handle a typical real estate investment scenario', () => {
        // Initial investment, followed by annual cash flows, and a large sale proceed at the end
        const cashFlows = [-500000, 30000, 32000, 34000, 36000, 38000, 600000];
        const result = calculateIRR(cashFlows);

        // The IRR should be around 8-9% for this scenario
        expect(result.irr).toBeGreaterThan(0.08);
        expect(result.irr).toBeLessThan(0.09);
    });

    it('should handle edge case with very high return', () => {
        // Small investment with large immediate return
        const cashFlows = [-1000, 10000];
        const result = calculateIRR(cashFlows);

        expect(result.irr).toBeGreaterThan(8.9); // IRR should be 900%
    });
});

describe('Multiple IRR Solutions Detection', () => {
    it('should detect potential multiple IRR solutions', () => {
        // Cash flow pattern with multiple sign changes (typical for multiple IRR solutions)
        const cashFlows = [-1000, 3000, -4000, 2000];

        expect(mightHaveMultipleIRRSolutions(cashFlows)).toBe(true);
    });

    it('should not flag typical investment patterns as having multiple solutions', () => {
        // Typical investment: initial outflow, followed by inflows
        const cashFlows = [-1000, 300, 400, 500];

        expect(mightHaveMultipleIRRSolutions(cashFlows)).toBe(false);
    });

    it('should handle short cash flow series', () => {
        const cashFlows = [-1000, 1100];
        expect(mightHaveMultipleIRRSolutions(cashFlows)).toBe(false);
    });
});

describe('Project to Cash Flow Array Conversion', () => {
    it('should convert project data to cash flow array correctly', () => {
        const initialInvestment = createInitialInvestment(100000, 5000, 10000, 2000);
        const cashFlows = [
            createCashFlow(1, 'annual', 12000, 3000, 5000, 1000),
            createCashFlow(2, 'annual', 12500, 3100, 5000, 900)
        ];
        const saleProceeds = createSaleProceeds(130000, 7000, 2, 'years');

        const result = projectToCashFlowArray(initialInvestment, cashFlows, saleProceeds);

        // Expected: [-initialInvestment.total, cashFlow1.netCashFlow, cashFlow2.netCashFlow + saleProceeds.netProceeds]
        expect(result[0]).toBe(-117000); // -initialInvestment.total
        expect(result[1]).toBe(3000); // cashFlow1.netCashFlow
        expect(result[2]).toBe(3500 + 123000); // cashFlow2.netCashFlow + saleProceeds.netProceeds
    });

    it('should handle monthly cash flows correctly', () => {
        const initialInvestment = createInitialInvestment(100000, 5000, 0, 0);
        const cashFlows = [
            createCashFlow(1, 'monthly', 1000, 300, 400, 50),
            createCashFlow(2, 'monthly', 1000, 300, 400, 50),
            createCashFlow(3, 'monthly', 1000, 300, 400, 50)
        ];
        const saleProceeds = createSaleProceeds(110000, 6000, 3, 'months');

        const result = projectToCashFlowArray(initialInvestment, cashFlows, saleProceeds);

        expect(result[0]).toBe(-105000); // -initialInvestment.total
        expect(result[1]).toBe(250); // cashFlow1.netCashFlow
        expect(result[2]).toBe(250); // cashFlow2.netCashFlow
        expect(result[3]).toBe(250 + 104000); // cashFlow3.netCashFlow + saleProceeds.netProceeds
    });

    it('should throw an error for missing project data', () => {
        const initialInvestment = createInitialInvestment(100000, 5000, 0, 0);
        const cashFlows = [createCashFlow(1, 'annual', 10000, 3000, 4000, 500)];

        // @ts-ignore - Intentionally passing undefined for test
        expect(() => projectToCashFlowArray(initialInvestment, cashFlows, undefined)).toThrow();
    });
});

describe('Project IRR Calculation', () => {
    it('should calculate IRR for a complete project', () => {
        // Create a project with realistic values
        const project = createProject('Test Project');

        // Set initial investment
        project.initialInvestment = createInitialInvestment(200000, 10000, 20000, 5000);

        // Set cash flows for 5 years
        project.cashFlows = [
            createCashFlow(1, 'annual', 25000, 8000, 12000, 1000),
            createCashFlow(2, 'annual', 26000, 8200, 12000, 900),
            createCashFlow(3, 'annual', 27000, 8400, 12000, 800),
            createCashFlow(4, 'annual', 28000, 8600, 12000, 700),
            createCashFlow(5, 'annual', 29000, 8800, 12000, 600)
        ];

        // Set sale proceeds after 5 years
        project.saleProceeds = createSaleProceeds(250000, 15000, 5, 'years');

        const result = calculateProjectIRR(project);

        // Expect a positive IRR for this profitable investment
        expect(result.irr).toBeGreaterThan(0);
        expect(result.npv).toBeCloseTo(0, 2); // NPV should be close to zero at the IRR
    });

    it('should handle a project with multiple potential IRR solutions', () => {
        const project = createProject('Multiple IRR Test');

        // Create a scenario with multiple sign changes in cash flow
        project.initialInvestment = createInitialInvestment(100000, 0, 0, 0);

        project.cashFlows = [
            createCashFlow(1, 'annual', 250000, 0, 0, 0), // Large positive in year 1
            createCashFlow(2, 'annual', 0, 300000, 0, 0)  // Large negative in year 2 (high expense)
        ];

        project.saleProceeds = createSaleProceeds(200000, 10000, 2, 'years');

        const result = calculateProjectIRR(project);

        // We should still get a result, but with a warning
        expect(result.irr).not.toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error?.severity).toBe('warning');
    });
});