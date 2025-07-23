import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAppStore } from '../index';
import { ProjectStorage } from '../../utils/storage';
import { createProject } from '../../utils/factory';
import { Project } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

// Replace the global localStorage with our mock
Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

// Mock the ProjectStorage class
vi.mock('../../utils/storage', () => {
    const mockProjects: Project[] = [];

    return {
        ProjectStorage: {
            loadAllProjects: vi.fn(() => [...mockProjects]),
            saveProject: vi.fn((project: Project) => {
                const index = mockProjects.findIndex(p => p.id === project.id);
                if (index >= 0) {
                    mockProjects[index] = project;
                } else {
                    mockProjects.push(project);
                }
            }),
            deleteProject: vi.fn((projectId: string) => {
                const index = mockProjects.findIndex(p => p.id === projectId);
                if (index >= 0) {
                    mockProjects.splice(index, 1);
                }
            }),
            loadProject: vi.fn((projectId: string) => {
                return mockProjects.find(p => p.id === projectId) || null;
            }),
            _mockProjects: mockProjects,
            _clearMockProjects: () => {
                mockProjects.length = 0;
            }
        }
    };
});

describe('AppStore', () => {
    beforeEach(() => {
        // Reset the store
        useAppStore.setState({
            projects: [],
            currentProject: null,
            isLoading: false,
            error: null,
            language: 'en',
        });

        // Clear mock projects
        (ProjectStorage as any)._clearMockProjects();

        // Clear mock function calls
        vi.clearAllMocks();
    });

    describe('initializeStore', () => {
        it('should load projects from storage', async () => {
            // Arrange
            const mockProject = createProject('Test Project');
            (ProjectStorage as any)._mockProjects.push(mockProject);

            // Act
            await useAppStore.getState().initializeStore();

            // Assert
            expect(ProjectStorage.loadAllProjects).toHaveBeenCalled();
            expect(useAppStore.getState().projects.length).toBe(1);
            expect(useAppStore.getState().projects[0].id).toBe(mockProject.id);
        });

        it('should handle errors when loading projects', async () => {
            // Arrange
            vi.spyOn(ProjectStorage, 'loadAllProjects').mockImplementationOnce(() => {
                throw new Error('Test error');
            });

            // Act
            await useAppStore.getState().initializeStore();

            // Assert
            expect(useAppStore.getState().error).toBe('Test error');
            expect(useAppStore.getState().isLoading).toBe(false);
        });

        it('should load saved language preference', async () => {
            // Arrange
            const getItemSpy = vi.spyOn(global.localStorage, 'getItem').mockReturnValue('fr');

            // Act
            await useAppStore.getState().initializeStore();

            // Assert
            expect(getItemSpy).toHaveBeenCalledWith('irr-calculator-language');
            expect(useAppStore.getState().language).toBe('fr');

            // Cleanup
            getItemSpy.mockRestore();
        });

        it('should fallback to browser language when no saved preference', async () => {
            // Arrange
            const getItemSpy = vi.spyOn(global.localStorage, 'getItem').mockReturnValue(null);
            Object.defineProperty(navigator, 'language', {
                value: 'fr-FR',
                configurable: true
            });

            // Act
            await useAppStore.getState().initializeStore();

            // Assert
            expect(useAppStore.getState().language).toBe('fr');

            // Cleanup
            getItemSpy.mockRestore();
        });
    });

    describe('createProject', () => {
        it('should create a new project and save it to storage', async () => {
            // Act
            const project = await useAppStore.getState().createProject('New Project', 'Description');

            // Assert
            expect(ProjectStorage.saveProject).toHaveBeenCalledWith(project);
            expect(useAppStore.getState().projects.length).toBe(1);
            expect(useAppStore.getState().projects[0].name).toBe('New Project');
            expect(useAppStore.getState().projects[0].description).toBe('Description');
            expect(useAppStore.getState().currentProject).toBe(project);
        });

        it('should handle errors when creating a project', async () => {
            // Arrange
            vi.spyOn(ProjectStorage, 'saveProject').mockImplementationOnce(() => {
                throw new Error('Test error');
            });

            // Act & Assert
            await expect(useAppStore.getState().createProject('New Project')).rejects.toThrow();
            expect(useAppStore.getState().error).toBe('Test error');
            expect(useAppStore.getState().isLoading).toBe(false);
        });
    });

    describe('updateProject', () => {
        it('should update an existing project and save it to storage', async () => {
            // Arrange
            const project = await useAppStore.getState().createProject('Original Project');
            const updatedProject = { ...project, name: 'Updated Project' };

            // Act
            await useAppStore.getState().updateProject(updatedProject);

            // Assert
            expect(ProjectStorage.saveProject).toHaveBeenCalledWith(expect.objectContaining({
                id: project.id,
                name: 'Updated Project'
            }));
            expect(useAppStore.getState().projects[0].name).toBe('Updated Project');
        });

        it('should update the current project if it matches the updated project', async () => {
            // Arrange
            const project = await useAppStore.getState().createProject('Original Project');
            const updatedProject = { ...project, name: 'Updated Project' };

            // Act
            await useAppStore.getState().updateProject(updatedProject);

            // Assert
            expect(useAppStore.getState().currentProject?.name).toBe('Updated Project');
        });

        it('should handle errors when updating a project', async () => {
            // Arrange
            const project = await useAppStore.getState().createProject('Original Project');
            vi.spyOn(ProjectStorage, 'saveProject').mockImplementationOnce(() => {
                throw new Error('Test error');
            });

            // Act & Assert
            await expect(useAppStore.getState().updateProject(project)).rejects.toThrow();
            expect(useAppStore.getState().error).toBe('Test error');
            expect(useAppStore.getState().isLoading).toBe(false);
        });
    });

    describe('deleteProject', () => {
        it('should delete a project from storage and state', async () => {
            // Arrange
            const project = await useAppStore.getState().createProject('Project to Delete');

            // Act
            await useAppStore.getState().deleteProject(project.id);

            // Assert
            expect(ProjectStorage.deleteProject).toHaveBeenCalledWith(project.id);
            expect(useAppStore.getState().projects.length).toBe(0);
        });

        it('should clear the current project if it matches the deleted project', async () => {
            // Arrange
            const project = await useAppStore.getState().createProject('Project to Delete');

            // Act
            await useAppStore.getState().deleteProject(project.id);

            // Assert
            expect(useAppStore.getState().currentProject).toBeNull();
        });

        it('should not clear the current project if it does not match the deleted project', async () => {
            // Arrange
            const project1 = await useAppStore.getState().createProject('Project 1');
            const project2 = await useAppStore.getState().createProject('Project 2');
            useAppStore.getState().setCurrentProject(project1.id);

            // Act
            await useAppStore.getState().deleteProject(project2.id);

            // Assert
            expect(useAppStore.getState().currentProject).not.toBeNull();
            expect(useAppStore.getState().currentProject?.id).toBe(project1.id);
        });

        it('should handle errors when deleting a project', async () => {
            // Arrange
            const project = await useAppStore.getState().createProject('Project to Delete');
            vi.spyOn(ProjectStorage, 'deleteProject').mockImplementationOnce(() => {
                throw new Error('Test error');
            });

            // Act & Assert
            await expect(useAppStore.getState().deleteProject(project.id)).rejects.toThrow();
            expect(useAppStore.getState().error).toBe('Test error');
            expect(useAppStore.getState().isLoading).toBe(false);
        });
    });

    describe('setCurrentProject', () => {
        it('should set the current project by ID', async () => {
            // Arrange
            const project = await useAppStore.getState().createProject('Test Project');
            useAppStore.getState().clearCurrentProject();

            // Act
            useAppStore.getState().setCurrentProject(project.id);

            // Assert
            expect(useAppStore.getState().currentProject?.id).toBe(project.id);
        });

        it('should set an error if project ID does not exist', () => {
            // Act
            useAppStore.getState().setCurrentProject('non-existent-id');

            // Assert
            expect(useAppStore.getState().error).toBe('Project with ID non-existent-id not found');
            expect(useAppStore.getState().currentProject).toBeNull();
        });
    });

    describe('clearCurrentProject', () => {
        it('should clear the current project', async () => {
            // Arrange
            const project = await useAppStore.getState().createProject('Test Project');

            // Act
            useAppStore.getState().clearCurrentProject();

            // Assert
            expect(useAppStore.getState().currentProject).toBeNull();
        });
    });

    describe('setLanguage', () => {
        it('should set the language', () => {
            // Act
            useAppStore.getState().setLanguage('fr');

            // Assert
            expect(useAppStore.getState().language).toBe('fr');
        });

        it('should save language preference to localStorage', () => {
            // Arrange
            const setItemSpy = vi.spyOn(global.localStorage, 'setItem');

            // Act
            useAppStore.getState().setLanguage('fr');

            // Assert
            expect(setItemSpy).toHaveBeenCalledWith('irr-calculator-language', 'fr');

            // Cleanup
            setItemSpy.mockRestore();
        });
    });
});