import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProjectCard } from '../ProjectCard';
import type { Project } from '../../../types';

// Mock the EditProjectModal
vi.mock('../EditProjectModal', () => ({
  EditProjectModal: ({ isOpen, project }: any) => (
    isOpen ? <div data-testid="edit-modal">Edit {project.name}</div> : null
  )
}));

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  description: 'Test Description',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02'),
  initialInvestment: {
    purchasePrice: 100000,
    closingCosts: 5000,
    renovationCosts: 10000,
    otherUpfrontExpenses: 2000,
    total: 117000
  },
  cashFlows: [{
    period: 1,
    periodType: 'annual',
    rentalIncome: 12000,
    operatingExpenses: 3000,
    debtService: 6000,
    vacancyLoss: 600,
    netCashFlow: 2400
  }],
  saleProceeds: {
    estimatedSalePrice: 120000,
    sellingCosts: 7200,
    netProceeds: 112800,
    holdingPeriod: 5,
    holdingPeriodType: 'years'
  },
  calculatedIRR: 0.15,
  calculatedNPV: 5000
};

const emptyProject: Project = {
  ...mockProject,
  id: '2',
  name: 'Empty Project',
  description: undefined,
  initialInvestment: {
    purchasePrice: 0,
    closingCosts: 0,
    renovationCosts: 0,
    otherUpfrontExpenses: 0,
    total: 0
  },
  cashFlows: [{
    period: 1,
    periodType: 'annual',
    rentalIncome: 0,
    operatingExpenses: 0,
    debtService: 0,
    vacancyLoss: 0,
    netCashFlow: 0
  }],
  saleProceeds: {
    estimatedSalePrice: 0,
    sellingCosts: 0,
    netProceeds: 0,
    holdingPeriod: 1,
    holdingPeriodType: 'years'
  },
  calculatedIRR: undefined,
  calculatedNPV: undefined
};

describe('ProjectCard', () => {
  const mockProps = {
    project: mockProject,
    viewMode: 'grid' as const,
    onSelect: vi.fn(),
    onDelete: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Grid View', () => {
    it('renders project information in grid view', () => {
      render(<ProjectCard {...mockProps} />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('15.00%')).toBeInTheDocument();
      expect(screen.getByText('Has Data')).toBeInTheDocument();
    });

    it('renders empty project correctly in grid view', () => {
      render(<ProjectCard {...mockProps} project={emptyProject} />);
      
      expect(screen.getByText('Empty Project')).toBeInTheDocument();
      expect(screen.getByText('Not calculated')).toBeInTheDocument();
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('shows actions on hover in grid view', () => {
      render(<ProjectCard {...mockProps} />);
      
      const card = screen.getByText('Test Project').closest('.group');
      expect(card).toBeInTheDocument();
      
      // Actions should be present but potentially hidden
      expect(screen.getByText('Open Project')).toBeInTheDocument();
    });

    it('calls onSelect when Open Project is clicked', () => {
      render(<ProjectCard {...mockProps} />);
      
      const openButton = screen.getByText('Open Project');
      fireEvent.click(openButton);
      
      expect(mockProps.onSelect).toHaveBeenCalled();
    });

    it('opens edit modal when edit button is clicked', () => {
      render(<ProjectCard {...mockProps} />);
      
      const editButton = screen.getByRole('button', { name: 'Edit project' });
      fireEvent.click(editButton);
      
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
      expect(screen.getByText('Edit Test Project')).toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', () => {
      render(<ProjectCard {...mockProps} />);
      
      const deleteButton = screen.getByRole('button', { name: 'Delete project' });
      fireEvent.click(deleteButton);
      
      expect(mockProps.onDelete).toHaveBeenCalled();
    });
  });

  describe('List View', () => {
    const listProps = { ...mockProps, viewMode: 'list' as const };

    it('renders project information in list view', () => {
      render(<ProjectCard {...listProps} />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('15.00%')).toBeInTheDocument();
      expect(screen.getByText('Has Data')).toBeInTheDocument();
    });

    it('shows formatted dates in list view', () => {
      render(<ProjectCard {...listProps} />);
      
      expect(screen.getByText(/Jan 2, 2023/)).toBeInTheDocument(); // Updated date
    });

    it('has Edit and Open buttons in list view', () => {
      render(<ProjectCard {...listProps} />);
      
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('calls onSelect when Open is clicked in list view', () => {
      render(<ProjectCard {...listProps} />);
      
      const openButton = screen.getByText('Open');
      fireEvent.click(openButton);
      
      expect(mockProps.onSelect).toHaveBeenCalled();
    });
  });

  describe('IRR Display', () => {
    it('displays positive IRR in green', () => {
      const highIRRProject = { ...mockProject, calculatedIRR: 0.20 };
      render(<ProjectCard {...mockProps} project={highIRRProject} />);
      
      const irrElement = screen.getByText('20.00%');
      expect(irrElement).toHaveClass('text-green-600');
    });

    it('displays moderate IRR in blue', () => {
      const moderateIRRProject = { ...mockProject, calculatedIRR: 0.10 };
      render(<ProjectCard {...mockProps} project={moderateIRRProject} />);
      
      const irrElement = screen.getByText('10.00%');
      expect(irrElement).toHaveClass('text-blue-600');
    });

    it('displays low IRR in yellow', () => {
      const lowIRRProject = { ...mockProject, calculatedIRR: 0.05 };
      render(<ProjectCard {...mockProps} project={lowIRRProject} />);
      
      const irrElement = screen.getByText('5.00%');
      expect(irrElement).toHaveClass('text-yellow-600');
    });

    it('displays negative IRR in red', () => {
      const negativeIRRProject = { ...mockProject, calculatedIRR: -0.05 };
      render(<ProjectCard {...mockProps} project={negativeIRRProject} />);
      
      const irrElement = screen.getByText('-5.00%');
      expect(irrElement).toHaveClass('text-red-600');
    });

    it('displays "Not calculated" for undefined IRR', () => {
      render(<ProjectCard {...mockProps} project={emptyProject} />);
      
      const irrElement = screen.getByText('Not calculated');
      expect(irrElement).toHaveClass('text-gray-500');
    });
  });

  describe('Project Status', () => {
    it('shows "Has Data" status for projects with data', () => {
      render(<ProjectCard {...mockProps} />);
      
      const statusBadge = screen.getByText('Has Data');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('shows "Empty" status for projects without data', () => {
      render(<ProjectCard {...mockProps} project={emptyProject} />);
      
      const statusBadge = screen.getByText('Empty');
      expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly', () => {
      render(<ProjectCard {...mockProps} />);
      
      expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument(); // Created date
      expect(screen.getByText(/Jan 2, 2023/)).toBeInTheDocument(); // Updated date
    });
  });

  describe('Description Handling', () => {
    it('renders description when present', () => {
      render(<ProjectCard {...mockProps} />);
      
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('does not render description when not present', () => {
      render(<ProjectCard {...mockProps} project={emptyProject} />);
      
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });
  });
});