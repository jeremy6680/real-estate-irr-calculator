import { describe, it, expect } from 'vitest';
import {
  createInitialInvestment,
  createCashFlow,
  createSaleProceeds,
  createProject,
} from '../factory';

describe('Factory Utils', () => {
  describe('createInitialInvestment', () => {
    it('should create an initial investment with default values', () => {
      const investment = createInitialInvestment();
      
      expect(investment.purchasePrice).toBe(0);
      expect(investment.closingCosts).toBe(0);
      expect(investment.renovationCosts).toBe(0);
      expect(investment.otherUpfrontExpenses).toBe(0);
      expect(investment.total).toBe(0);
    });

    it('should create an initial investment with provided values', () => {
      const investment = createInitialInvestment(100000, 5000, 10000, 2000);
      
      expect(investment.purchasePrice).toBe(100000);
      expect(investment.closingCosts).toBe(5000);
      expect(investment.renovationCosts).toBe(10000);
      expect(investment.otherUpfrontExpenses).toBe(2000);
      expect(investment.total).toBe(117000);
    });

    it('should calculate the total correctly', () => {
      const investment = createInitialInvestment(100000, 5000, 10000, 2000);
      expect(investment.total).toBe(100000 + 5000 + 10000 + 2000);
    });
  });

  describe('createCashFlow', () => {
    it('should create a cash flow with default values', () => {
      const cashFlow = createCashFlow();
      
      expect(cashFlow.period).toBe(1);
      expect(cashFlow.periodType).toBe('annual');
      expect(cashFlow.rentalIncome).toBe(0);
      expect(cashFlow.operatingExpenses).toBe(0);
      expect(cashFlow.debtService).toBe(0);
      expect(cashFlow.vacancyLoss).toBe(0);
      expect(cashFlow.netCashFlow).toBe(0);
    });

    it('should create a cash flow with provided values', () => {
      const cashFlow = createCashFlow(2, 'monthly', 1000, 300, 400, 100);
      
      expect(cashFlow.period).toBe(2);
      expect(cashFlow.periodType).toBe('monthly');
      expect(cashFlow.rentalIncome).toBe(1000);
      expect(cashFlow.operatingExpenses).toBe(300);
      expect(cashFlow.debtService).toBe(400);
      expect(cashFlow.vacancyLoss).toBe(100);
      expect(cashFlow.netCashFlow).toBe(200);
    });

    it('should calculate the net cash flow correctly', () => {
      const cashFlow = createCashFlow(1, 'annual', 12000, 3000, 5000, 1000);
      expect(cashFlow.netCashFlow).toBe(12000 - 3000 - 5000 - 1000);
    });
  });

  describe('createSaleProceeds', () => {
    it('should create sale proceeds with default values', () => {
      const saleProceeds = createSaleProceeds();
      
      expect(saleProceeds.estimatedSalePrice).toBe(0);
      expect(saleProceeds.sellingCosts).toBe(0);
      expect(saleProceeds.netProceeds).toBe(0);
      expect(saleProceeds.holdingPeriod).toBe(1);
      expect(saleProceeds.holdingPeriodType).toBe('years');
    });

    it('should create sale proceeds with provided values', () => {
      const saleProceeds = createSaleProceeds(200000, 10000, 5, 'months');
      
      expect(saleProceeds.estimatedSalePrice).toBe(200000);
      expect(saleProceeds.sellingCosts).toBe(10000);
      expect(saleProceeds.netProceeds).toBe(190000);
      expect(saleProceeds.holdingPeriod).toBe(5);
      expect(saleProceeds.holdingPeriodType).toBe('months');
    });

    it('should calculate the net proceeds correctly', () => {
      const saleProceeds = createSaleProceeds(200000, 10000);
      expect(saleProceeds.netProceeds).toBe(200000 - 10000);
    });
  });

  describe('createProject', () => {
    it('should create a project with the provided name and description', () => {
      const project = createProject('Test Project', 'A test project');
      
      expect(project.id).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.description).toBe('A test project');
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
      expect(project.initialInvestment).toBeDefined();
      expect(project.cashFlows).toHaveLength(1);
      expect(project.saleProceeds).toBeDefined();
      expect(project.calculatedIRR).toBeUndefined();
      expect(project.calculatedNPV).toBeUndefined();
    });

    it('should create a project with default values for sub-objects', () => {
      const project = createProject('Test Project');
      
      expect(project.initialInvestment.purchasePrice).toBe(0);
      expect(project.initialInvestment.total).toBe(0);
      
      expect(project.cashFlows[0].period).toBe(1);
      expect(project.cashFlows[0].periodType).toBe('annual');
      expect(project.cashFlows[0].netCashFlow).toBe(0);
      
      expect(project.saleProceeds.estimatedSalePrice).toBe(0);
      expect(project.saleProceeds.netProceeds).toBe(0);
    });
  });
});