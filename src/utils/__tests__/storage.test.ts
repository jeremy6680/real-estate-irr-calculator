import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProjectStorage } from '../storage';
import { createProject } from '../factory';
import type { Project } from '../../types';
import { serializeProject } from '../serialization';

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
Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

describe('ProjectStorage', () => {
    const STORAGE_KEY = 'irr-calculator-projects';
    let testProject: Project;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorageMock.clear();

        // Create a test project
        testProject = createProject('Test Project', 'Test Description');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('saveProject', () => {
        it('should save a new project to localStorage', () => {
            // Act
            ProjectStorage.saveProject(testProject);

            // Assert
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEY,
                JSON.stringify([serializeProject(testProject)])
            );
        });

        it('should update an existing project in localStorage', () => {
            // Arrange
            ProjectStorage.saveProject(testProject);

            // Update the project
            const updatedProject = { ...testProject, name: 'Updated Project' };

            // Act
            ProjectStorage.saveProject(updatedProject);

            // Assert - Load the project back and verify it was updated
            const loadedProject = ProjectStorage.loadProject(testProject.id);
            expect(loadedProject).not.toBeNull();
            expect(loadedProject?.name).toBe('Updated Project');
            expect(loadedProject?.id).toBe(testProject.id);
        });
    });

    describe('loadProject', () => {
        it('should return null if project does not exist', () => {
            // Act
            const result = ProjectStorage.loadProject('non-existent-id');

            // Assert
            expect(result).toBeNull();
        });

        it('should load a project by ID from localStorage', () => {
            // Arrange
            ProjectStorage.saveProject(testProject);

            // Act
            const loadedProject = ProjectStorage.loadProject(testProject.id);

            // Assert
            expect(loadedProject).not.toBeNull();
            expect(loadedProject?.id).toBe(testProject.id);
            expect(loadedProject?.name).toBe(testProject.name);
        });
    });

    describe('loadAllProjects', () => {
        it('should return an empty array if no projects exist', () => {
            // Act
            const projects = ProjectStorage.loadAllProjects();

            // Assert
            expect(projects).toEqual([]);
        });

        it('should load all projects from localStorage', () => {
            // Arrange
            const project1 = createProject('Project 1');
            const project2 = createProject('Project 2');

            ProjectStorage.saveProject(project1);
            ProjectStorage.saveProject(project2);

            // Act
            const loadedProjects = ProjectStorage.loadAllProjects();

            // Assert
            expect(loadedProjects.length).toBe(2);
            expect(loadedProjects.some(p => p.id === project1.id)).toBe(true);
            expect(loadedProjects.some(p => p.id === project2.id)).toBe(true);
        });

        it('should handle invalid JSON in localStorage', () => {
            // Arrange
            localStorageMock.getItem.mockReturnValueOnce('invalid-json');

            // Act & Assert
            expect(() => ProjectStorage.loadAllProjects()).toThrow();
        });

        it('should handle non-array data in localStorage', () => {
            // Arrange
            localStorageMock.getItem.mockReturnValueOnce('{"notAnArray": true}');

            // Act
            const projects = ProjectStorage.loadAllProjects();

            // Assert
            expect(projects).toEqual([]);
        });
    });

    describe('deleteProject', () => {
        it('should delete a project from localStorage', () => {
            // Arrange
            const project1 = createProject('Project 1');
            const project2 = createProject('Project 2');

            ProjectStorage.saveProject(project1);
            ProjectStorage.saveProject(project2);

            // Act
            ProjectStorage.deleteProject(project1.id);

            // Assert
            const remainingProjects = ProjectStorage.loadAllProjects();
            expect(remainingProjects.length).toBe(1);
            expect(remainingProjects[0].id).toBe(project2.id);
        });

        it('should not throw if project does not exist', () => {
            // Act & Assert
            expect(() => ProjectStorage.deleteProject('non-existent-id')).not.toThrow();
        });
    });

    describe('exportProject', () => {
        it('should export a project as JSON string', () => {
            // Arrange
            ProjectStorage.saveProject(testProject);

            // Act
            const exportedJson = ProjectStorage.exportProject(testProject.id);

            // Assert
            const exportedProject = JSON.parse(exportedJson);
            expect(exportedProject.id).toBe(testProject.id);
            expect(exportedProject.name).toBe(testProject.name);
        });

        it('should throw if project does not exist', () => {
            // Act & Assert
            expect(() => ProjectStorage.exportProject('non-existent-id')).toThrow();
        });
    });

    describe('importProject', () => {
        it('should import a project from JSON string', () => {
            // Arrange
            const exportedJson = JSON.stringify(serializeProject(testProject));

            // Act
            const importedProject = ProjectStorage.importProject(exportedJson);

            // Assert
            expect(importedProject.id).toBe(testProject.id);
            expect(importedProject.name).toBe(testProject.name);
        });

        it('should throw if JSON is invalid', () => {
            // Act & Assert
            expect(() => ProjectStorage.importProject('invalid-json')).toThrow();
        });
    });
});