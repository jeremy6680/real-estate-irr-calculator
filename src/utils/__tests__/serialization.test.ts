import { describe, it, expect } from 'vitest';
import {
  serializeDate,
  deserializeDate,
  serializeInitialInvestment,
  deserializeInitialInvestment,
  serializeCashFlow,
  deserializeCashFlow,
  serializeSaleProceeds,
  deserializeSaleProceeds,
  serializeProject,
  deserializeProject,
} from '../serialization';
import { createInitialInvestment, createCashFlow, createSaleProceeds, createProject } from '../factory';

describe('Serialization Utils', () => {
  describe('Date serialization', () => {
    it('should serialize and deserialize dates correctly', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const serialized = serializeDate(date);
      const deserialized = deserializeDate(serialized);
      
      expect(serialized).toBe('2023-01-01T12:00:00.000Z');
      expect(deserialized.getTime()).toBe(date.getTime());
    });
  });

  describe('InitialInvestment serialization', () => {
    it('should serialize initial investment correctly', () => {
      const investment = createInitialInvestment(100000, 5000, 10000, 2000);
      const serialized = serializeInitialInvestment(investment);
      
      expect(serialized.purchasePrice).toBe(100000);
      expect(serialized.closingCosts).toBe(5000);
      expect(serialized.renovationCosts).toBe(10000);
      expect(serialized.otherUpfrontExpenses).toBe(2000);
      expect(serialized.total).toBe(117000);
    });

    it('should deserialize initial investment correctly', () => {
      const data = {
        purchasePrice: 100000,
        closingCosts: 5000,
        renovationCosts: 10000,
        otherUpfrontExpenses: 2000,
        total: 117000,
      };
      
      const deserialized = deserializeInitialInvestment(data);
      
      expect(deserialized.purchasePrice).toBe(100000);
      expect(deserialized.closingCosts).toBe(5000);
      expect(deserialized.renovationCosts).toBe(10000);
      expect(deserialized.otherUpfrontExpenses).toBe(2000);
      expect(deserialized.total).toBe(117000);
    });

    it('should handle invalid data during deserialization', () => {
      const data = {
        purchasePrice: 'invalid',
        closingCosts: null,
        renovationCosts: undefined,
        otherUpfrontExpenses: NaN,
      };
      
      const deserialized = deserializeInitialInvestment(data as any);
      
      expect(deserialized.purchasePrice).toBe(0);
      expect(deserialized.closingCosts).toBe(0);
      expect(deserialized.renovationCosts).toBe(0);
      expect(deserialized.otherUpfrontExpenses).toBe(0);
      expect(deserialized.total).toBe(0);
    });
  });

  describe('CashFlow serialization', () => {
    it('should serialize cash flow correctly', () => {
      const cashFlow = createCashFlow(1, 'annual', 12000, 3000, 5000, 1000);
      const serialized = serializeCashFlow(cashFlow);
      
      expect(serialized.period).toBe(1);
      expect(serialized.periodType).toBe('annual');
      expect(serialized.rentalIncome).toBe(12000);
      expect(serialized.operatingExpenses).toBe(3000);
      expect(serialized.debtService).toBe(5000);
      expect(serialized.vacancyLoss).toBe(1000);
      expect(serialized.netCashFlow).toBe(3000);
    });

    it('should deserialize cash flow correctly', () => {
      const data = {
        period: 1,
        periodType: 'annual',
        rentalIncome: 12000,
        operatingExpenses: 3000,
        debtService: 5000,
        vacancyLoss: 1000,
        netCashFlow: 3000,
      };
      
      const deserialized = deserializeCashFlow(data);
      
      expect(deserialized.period).toBe(1);
      expect(deserialized.periodType).toBe('annual');
      expect(deserialized.rentalIncome).toBe(12000);
      expect(deserialized.operatingExpenses).toBe(3000);
      expect(deserialized.debtService).toBe(5000);
      expect(deserialized.vacancyLoss).toBe(1000);
      expect(deserialized.netCashFlow).toBe(3000);
    });

    it('should handle invalid data during deserialization', () => {
      const data = {
        period: 'invalid',
        periodType: 'invalid',
        rentalIncome: null,
        operatingExpenses: undefined,
        debtService: NaN,
        vacancyLoss: 'not a number',
      };
      
      const deserialized = deserializeCashFlow(data as any);
      
      expect(deserialized.period).toBe(1);
      expect(deserialized.periodType).toBe('annual');
      expect(deserialized.rentalIncome).toBe(0);
      expect(deserialized.operatingExpenses).toBe(0);
      expect(deserialized.debtService).toBe(0);
      expect(deserialized.vacancyLoss).toBe(0);
      expect(deserialized.netCashFlow).toBe(0);
    });
  });

  describe('SaleProceeds serialization', () => {
    it('should serialize sale proceeds correctly', () => {
      const saleProceeds = createSaleProceeds(200000, 10000, 5, 'years');
      const serialized = serializeSaleProceeds(saleProceeds);
      
      expect(serialized.estimatedSalePrice).toBe(200000);
      expect(serialized.sellingCosts).toBe(10000);
      expect(serialized.netProceeds).toBe(190000);
      expect(serialized.holdingPeriod).toBe(5);
      expect(serialized.holdingPeriodType).toBe('years');
    });

    it('should deserialize sale proceeds correctly', () => {
      const data = {
        estimatedSalePrice: 200000,
        sellingCosts: 10000,
        netProceeds: 190000,
        holdingPeriod: 5,
        holdingPeriodType: 'years',
      };
      
      const deserialized = deserializeSaleProceeds(data);
      
      expect(deserialized.estimatedSalePrice).toBe(200000);
      expect(deserialized.sellingCosts).toBe(10000);
      expect(deserialized.netProceeds).toBe(190000);
      expect(deserialized.holdingPeriod).toBe(5);
      expect(deserialized.holdingPeriodType).toBe('years');
    });

    it('should handle invalid data during deserialization', () => {
      const data = {
        estimatedSalePrice: 'invalid',
        sellingCosts: null,
        netProceeds: undefined,
        holdingPeriod: NaN,
        holdingPeriodType: 'invalid',
      };
      
      const deserialized = deserializeSaleProceeds(data as any);
      
      expect(deserialized.estimatedSalePrice).toBe(0);
      expect(deserialized.sellingCosts).toBe(0);
      expect(deserialized.netProceeds).toBe(0);
      expect(deserialized.holdingPeriod).toBe(1);
      expect(deserialized.holdingPeriodType).toBe('years');
    });
  });

  describe('Project serialization', () => {
    it('should serialize and deserialize a project correctly', () => {
      const project = createProject('Test Project', 'A test project');
      project.initialInvestment = createInitialInvestment(100000, 5000, 10000, 2000);
      project.cashFlows = [createCashFlow(1, 'annual', 12000, 3000, 5000, 1000)];
      project.saleProceeds = createSaleProceeds(200000, 10000, 5, 'years');
      project.calculatedIRR = 0.08;
      project.calculatedNPV = 15000;
      
      const serialized = serializeProject(project);
      const deserialized = deserializeProject(serialized);
      
      expect(deserialized.id).toBe(project.id);
      expect(deserialized.name).toBe(project.name);
      expect(deserialized.description).toBe(project.description);
      expect(deserialized.createdAt.getTime()).toBe(project.createdAt.getTime());
      expect(deserialized.updatedAt.getTime()).toBe(project.updatedAt.getTime());
      
      expect(deserialized.initialInvestment.purchasePrice).toBe(project.initialInvestment.purchasePrice);
      expect(deserialized.initialInvestment.total).toBe(project.initialInvestment.total);
      
      expect(deserialized.cashFlows.length).toBe(project.cashFlows.length);
      expect(deserialized.cashFlows[0].rentalIncome).toBe(project.cashFlows[0].rentalIncome);
      expect(deserialized.cashFlows[0].netCashFlow).toBe(project.cashFlows[0].netCashFlow);
      
      expect(deserialized.saleProceeds.estimatedSalePrice).toBe(project.saleProceeds.estimatedSalePrice);
      expect(deserialized.saleProceeds.netProceeds).toBe(project.saleProceeds.netProceeds);
      
      expect(deserialized.calculatedIRR).toBe(project.calculatedIRR);
      expect(deserialized.calculatedNPV).toBe(project.calculatedNPV);
    });
  });
});