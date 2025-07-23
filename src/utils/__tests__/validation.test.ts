import { describe, it, expect } from 'vitest';
import {
  validateNumber,
  validateString,
  validateInitialInvestment,
  validateCashFlow,
  validateSaleProceeds,
  validateProject,
} from '../validation';
import { createInitialInvestment, createCashFlow, createSaleProceeds, createProject } from '../factory';

describe('Validation Utils', () => {
  describe('validateNumber', () => {
    it('should validate required numbers', () => {
      expect(validateNumber(null, 'Test')).not.toBeNull();
      expect(validateNumber(undefined, 'Test')).not.toBeNull();
      expect(validateNumber(10, 'Test')).toBeNull();
    });

    it('should validate number type', () => {
      expect(validateNumber('not a number', 'Test')).not.toBeNull();
      expect(validateNumber(NaN, 'Test')).not.toBeNull();
      expect(validateNumber(10, 'Test')).toBeNull();
    });

    it('should validate minimum value', () => {
      expect(validateNumber(5, 'Test', 10)).not.toBeNull();
      expect(validateNumber(10, 'Test', 10)).toBeNull();
      expect(validateNumber(15, 'Test', 10)).toBeNull();
    });

    it('should validate maximum value', () => {
      expect(validateNumber(15, 'Test', undefined, 10)).not.toBeNull();
      expect(validateNumber(10, 'Test', undefined, 10)).toBeNull();
      expect(validateNumber(5, 'Test', undefined, 10)).toBeNull();
    });
  });

  describe('validateString', () => {
    it('should validate required strings', () => {
      expect(validateString(null, 'Test')).not.toBeNull();
      expect(validateString(undefined, 'Test')).not.toBeNull();
      expect(validateString('', 'Test')).not.toBeNull();
      expect(validateString('test', 'Test')).toBeNull();
    });

    it('should validate optional strings', () => {
      expect(validateString(null, 'Test', false)).toBeNull();
      expect(validateString(undefined, 'Test', false)).toBeNull();
      expect(validateString('', 'Test', false)).toBeNull();
      expect(validateString('test', 'Test', false)).toBeNull();
    });

    it('should validate string type', () => {
      expect(validateString(123, 'Test')).not.toBeNull();
      expect(validateString({}, 'Test')).not.toBeNull();
      expect(validateString('test', 'Test')).toBeNull();
    });

    it('should validate maximum length', () => {
      expect(validateString('test', 'Test', true, 3)).not.toBeNull();
      expect(validateString('test', 'Test', true, 4)).toBeNull();
      expect(validateString('test', 'Test', true, 5)).toBeNull();
    });
  });

  describe('validateInitialInvestment', () => {
    it('should validate a valid initial investment', () => {
      const investment = createInitialInvestment(100000, 5000, 10000, 2000);
      const result = validateInitialInvestment(investment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate an invalid initial investment', () => {
      const investment = createInitialInvestment(-100000, 5000, 10000, 2000);
      const result = validateInitialInvestment(investment);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCashFlow', () => {
    it('should validate a valid cash flow', () => {
      const cashFlow = createCashFlow(1, 'annual', 12000, 3000, 5000, 1000);
      const result = validateCashFlow(cashFlow);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate an invalid cash flow', () => {
      const cashFlow = createCashFlow(0, 'annual', 12000, 3000, 5000, 1000);
      const result = validateCashFlow(cashFlow);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate period type', () => {
      const cashFlow = {
        ...createCashFlow(1, 'annual', 12000, 3000, 5000, 1000),
        periodType: 'invalid' as any,
      };
      const result = validateCashFlow(cashFlow);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateSaleProceeds', () => {
    it('should validate valid sale proceeds', () => {
      const saleProceeds = createSaleProceeds(200000, 10000, 5, 'years');
      const result = validateSaleProceeds(saleProceeds);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate invalid sale proceeds', () => {
      const saleProceeds = createSaleProceeds(-200000, 10000, 5, 'years');
      const result = validateSaleProceeds(saleProceeds);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate holding period type', () => {
      const saleProceeds = {
        ...createSaleProceeds(200000, 10000, 5, 'years'),
        holdingPeriodType: 'invalid' as any,
      };
      const result = validateSaleProceeds(saleProceeds);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateProject', () => {
    it('should validate a valid project', () => {
      const project = createProject('Test Project', 'A test project');
      project.initialInvestment = createInitialInvestment(100000, 5000, 10000, 2000);
      project.cashFlows = [createCashFlow(1, 'annual', 12000, 3000, 5000, 1000)];
      project.saleProceeds = createSaleProceeds(200000, 10000, 5, 'years');
      
      const result = validateProject(project);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a project with invalid initial investment', () => {
      const project = createProject('Test Project', 'A test project');
      project.initialInvestment = createInitialInvestment(-100000, 5000, 10000, 2000);
      project.cashFlows = [createCashFlow(1, 'annual', 12000, 3000, 5000, 1000)];
      project.saleProceeds = createSaleProceeds(200000, 10000, 5, 'years');
      
      const result = validateProject(project);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate a project with invalid cash flows', () => {
      const project = createProject('Test Project', 'A test project');
      project.initialInvestment = createInitialInvestment(100000, 5000, 10000, 2000);
      project.cashFlows = []; // Empty cash flows array
      project.saleProceeds = createSaleProceeds(200000, 10000, 5, 'years');
      
      const result = validateProject(project);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate a project with invalid sale proceeds', () => {
      const project = createProject('Test Project', 'A test project');
      project.initialInvestment = createInitialInvestment(100000, 5000, 10000, 2000);
      project.cashFlows = [createCashFlow(1, 'annual', 12000, 3000, 5000, 1000)];
      project.saleProceeds = createSaleProceeds(-200000, 10000, 5, 'years');
      
      const result = validateProject(project);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});