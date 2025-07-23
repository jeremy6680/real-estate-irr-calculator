import { Project } from '../types';
import { serializeProject, deserializeProject } from './serialization';

/**
 * Storage key for projects in local storage
 */
const STORAGE_KEY = 'irr-calculator-projects';

/**
 * Class for handling project storage operations
 */
export class ProjectStorage {
    /**
     * Saves a project to local storage
     * @param project The project to save
     * @throws Error if local storage is not available or if saving fails
     */
    static saveProject(project: Project): void {
        try {
            // Get existing projects
            const projects = this.loadAllProjects();

            // Find if project already exists
            const existingIndex = projects.findIndex(p => p.id === project.id);

            // Update or add the project
            if (existingIndex >= 0) {
                // Update existing project
                project.updatedAt = new Date();
                projects[existingIndex] = project;
            } else {
                // Add new project
                projects.push(project);
            }

            // Save all projects back to storage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.map(serializeProject)));
        } catch (error) {
            console.error('Failed to save project:', error);
            throw new Error('Failed to save project to local storage');
        }
    }

    /**
     * Loads a project from local storage by ID
     * @param projectId The ID of the project to load
     * @returns The loaded project or null if not found
     * @throws Error if local storage is not available or if loading fails
     */
    static loadProject(projectId: string): Project | null {
        try {
            const projects = this.loadAllProjects();
            const project = projects.find(p => p.id === projectId);
            return project || null;
        } catch (error) {
            console.error('Failed to load project:', error);
            throw new Error('Failed to load project from local storage');
        }
    }

    /**
     * Loads all projects from local storage
     * @returns Array of all projects
     * @throws Error if local storage is not available or if loading fails
     */
    static loadAllProjects(): Project[] {
        try {
            // Check if local storage is available
            if (!this.isLocalStorageAvailable()) {
                throw new Error('Local storage is not available');
            }

            // Get projects from storage
            const projectsJson = localStorage.getItem(STORAGE_KEY);

            // If no projects exist yet, return empty array
            if (!projectsJson) {
                return [];
            }

            // Parse and deserialize projects
            const projectsData = JSON.parse(projectsJson);

            // Ensure projectsData is an array
            if (!Array.isArray(projectsData)) {
                return [];
            }

            // Deserialize each project
            return projectsData.map(deserializeProject);
        } catch (error) {
            console.error('Failed to load projects:', error);
            throw new Error('Failed to load projects from local storage');
        }
    }

    /**
     * Deletes a project from local storage
     * @param projectId The ID of the project to delete
     * @throws Error if local storage is not available or if deletion fails
     */
    static deleteProject(projectId: string): void {
        try {
            // Get existing projects
            const projects = this.loadAllProjects();

            // Filter out the project to delete
            const filteredProjects = projects.filter(p => p.id !== projectId);

            // Save the filtered projects back to storage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects.map(serializeProject)));
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw new Error('Failed to delete project from local storage');
        }
    }

    /**
     * Exports a project as JSON string
     * @param projectId The ID of the project to export
     * @returns JSON string representation of the project
     * @throws Error if project is not found
     */
    static exportProject(projectId: string): string {
        const project = this.loadProject(projectId);

        if (!project) {
            throw new Error(`Project with ID ${projectId} not found`);
        }

        return JSON.stringify(serializeProject(project));
    }

    /**
     * Imports a project from JSON string
     * @param jsonData JSON string representation of the project
     * @returns The imported project
     * @throws Error if import fails
     */
    static importProject(jsonData: string): Project {
        try {
            const projectData = JSON.parse(jsonData);
            return deserializeProject(projectData);
        } catch (error) {
            console.error('Failed to import project:', error);
            throw new Error('Failed to import project: Invalid JSON data');
        }
    }

    /**
     * Checks if local storage is available
     * @returns true if local storage is available, false otherwise
     */
    private static isLocalStorageAvailable(): boolean {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
}