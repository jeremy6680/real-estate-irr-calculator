import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProjectDashboard } from '../ProjectDashboard';
import { useAppStore } from '../../../store';
import type { Project } from '../../../types';

// Mock the store
vi.mock('../../../store', () => ({
  useAppStore: vi.fn()
}));

// Mock the child components
vi.mock('../ProjectCard', () => ({
  ProjectCard: ({ project, onSelect, onDelete }: any) => (
    <div data-testid={`project-card-${project.id}`}>
      <span>{project.name}</span>
      <button onClick={onSelect} data-testid={`select-${project.id}`}>
        Select
      </button>
      <button onClick={onDelete} data-testid={`delete-${project.id}`}>
        Delete
      </button>
    </div>
  )
}));

vi.mock('../CreateProjectModal', () => ({
  CreateProjectModal: ({ isOpen, onSubmit, onClose }: any) => (
    isOpen ? (
      <div data-testid="create-modal">
        <button 
          onClick={() => onSubmit('Test Project', 'Test Description')}
          data-testid="submit-create"
        >
          Submit
        </button>
        <button onClick={onClose} data-testid="close-create">
          Close
        </button>
      </div>
    ) : null
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

describe('ProjectDashboard', () => {
  const mockStore = {
    projects: [],
    isLoading: false,
    error: null,
    initializeStore: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
    setCurrentProject: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders loading state', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      isLoading: true
    });

    render(<ProjectDashboard />);
    
    expect(screen.getByRole('status', { name: 'Loading projects' })).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      error: 'Failed to load projects'
    });

    render(<ProjectDashboard />);
    
    expect(screen.getByText('Error Loading Projects')).toBeInTheDocument();
    expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders empty state when no projects exist', () => {
    render(<ProjectDashboard />);
    
    expect(screen.getByText('Investment Projects')).toBeInTheDocument();
    expect(screen.getByText('No projects yet. Create your first project to get started.')).toBeInTheDocument();
    expect(screen.getByText('No projects yet')).toBeInTheDocument();
    expect(screen.getByText('Create Your First Project')).toBeInTheDocument();
  });

  it('renders projects when they exist', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      projects: [mockProject]
    });

    render(<ProjectDashboard />);
    
    expect(screen.getByText('Investment Projects')).toBeInTheDocument();
    expect(screen.getByText('1 project')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renders multiple projects with correct count', () => {
    const projects = [
      mockProject,
      { ...mockProject, id: '2', name: 'Project 2' }
    ];

    (useAppStore as any).mockReturnValue({
      ...mockStore,
      projects
    });

    render(<ProjectDashboard />);
    
    expect(screen.getByText('2 projects')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-2')).toBeInTheDocument();
  });

  it('shows view mode toggle when projects exist', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      projects: [mockProject]
    });

    render(<ProjectDashboard />);
    
    const gridButton = screen.getByRole('button', { name: 'Grid view' });
    const listButton = screen.getByRole('button', { name: 'List view' });
    
    expect(gridButton).toBeInTheDocument();
    expect(listButton).toBeInTheDocument();
  });

  it('toggles view mode', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      projects: [mockProject]
    });

    render(<ProjectDashboard />);
    
    const listButton = screen.getByRole('button', { name: 'List view' });
    fireEvent.click(listButton);
    
    // Check that the view mode changed (this would be reflected in the ProjectCard props)
    expect(listButton).toHaveClass('bg-blue-600');
  });

  it('opens create project modal', () => {
    render(<ProjectDashboard />);
    
    const newProjectButton = screen.getByText('New Project');
    fireEvent.click(newProjectButton);
    
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });

  it('creates a new project', async () => {
    const mockCreateProject = vi.fn().mockResolvedValue(mockProject);
    const mockOnSelectProject = vi.fn();

    (useAppStore as any).mockReturnValue({
      ...mockStore,
      createProject: mockCreateProject
    });

    render(<ProjectDashboard onSelectProject={mockOnSelectProject} />);
    
    // Open modal
    const newProjectButton = screen.getByText('New Project');
    fireEvent.click(newProjectButton);
    
    // Submit form
    const submitButton = screen.getByTestId('submit-create');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith('Test Project', 'Test Description');
      expect(mockOnSelectProject).toHaveBeenCalledWith('1');
    });
  });

  it('selects a project', () => {
    const mockOnSelectProject = vi.fn();
    
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      projects: [mockProject]
    });

    render(<ProjectDashboard onSelectProject={mockOnSelectProject} />);
    
    const selectButton = screen.getByTestId('select-1');
    fireEvent.click(selectButton);
    
    expect(mockStore.setCurrentProject).toHaveBeenCalledWith('1');
    expect(mockOnSelectProject).toHaveBeenCalledWith('1');
  });

  it('deletes a project with confirmation', async () => {
    // Mock window.confirm
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      projects: [mockProject]
    });

    render(<ProjectDashboard />);
    
    const deleteButton = screen.getByTestId('delete-1');
    fireEvent.click(deleteButton);
    
    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this project? This action cannot be undone.'
    );
    
    await waitFor(() => {
      expect(mockStore.deleteProject).toHaveBeenCalledWith('1');
    });

    mockConfirm.mockRestore();
  });

  it('cancels project deletion', async () => {
    // Mock window.confirm to return false
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      projects: [mockProject]
    });

    render(<ProjectDashboard />);
    
    const deleteButton = screen.getByTestId('delete-1');
    fireEvent.click(deleteButton);
    
    expect(mockConfirm).toHaveBeenCalled();
    expect(mockStore.deleteProject).not.toHaveBeenCalled();

    mockConfirm.mockRestore();
  });

  it('initializes store on mount', () => {
    render(<ProjectDashboard />);
    
    expect(mockStore.initializeStore).toHaveBeenCalled();
  });

  it('retries loading on error', () => {
    (useAppStore as any).mockReturnValue({
      ...mockStore,
      error: 'Failed to load projects'
    });

    render(<ProjectDashboard />);
    
    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);
    
    expect(mockStore.initializeStore).toHaveBeenCalledTimes(2); // Once on mount, once on retry
  });
});