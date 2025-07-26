import { create } from 'zustand';
import type { Project } from '../types';
import { ProjectStorage } from '../utils/storage';
import { createProject } from '../utils/factory';

/**
 * Interface for the global application state
 */
interface AppState {
    // Projects
    projects: Project[];
    currentProject: Project | null;
    isLoading: boolean;
    error: string | null;

    // UI State
    language: 'en' | 'fr';

    // Actions
    initializeStore: () => Promise<void>;
    createProject: (name: string, description?: string) => Promise<Project>;
    updateProject: (project: Project) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    setCurrentProject: (projectId: string) => void;
    clearCurrentProject: () => void;
    setLanguage: (language: 'en' | 'fr') => void;
}

/**
 * Create the global store using Zustand
 */
export const useAppStore = create<AppState>((set, get) => ({
    // Initial state
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    language: 'en',

    // Initialize the store by loading projects from local storage
    initializeStore: async () => {
        set({ isLoading: true, error: null });

        try {
            const projects = ProjectStorage.loadAllProjects();

            // Load saved language preference or detect browser language
            let language: 'en' | 'fr' = 'en';
            try {
                const savedLanguage = localStorage.getItem('irr-calculator-language');
                if (savedLanguage === 'fr' || savedLanguage === 'en') {
                    language = savedLanguage;
                } else {
                    // Fallback to browser language detection
                    language = navigator.language.startsWith('fr') ? 'fr' : 'en';
                }
            } catch (error) {
                // Fallback to browser language detection if localStorage fails
                language = navigator.language.startsWith('fr') ? 'fr' : 'en';
            }

            set({
                projects,
                isLoading: false,
                language
            });
        } catch (error) {
            console.error('Failed to initialize store:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load projects'
            });
        }
    },

    // Create a new project
    createProject: async (name: string, description?: string) => {
        set({ isLoading: true, error: null });

        try {
            const newProject = createProject(name, description);

            // Save to local storage
            ProjectStorage.saveProject(newProject);

            // Update state
            set(state => ({
                projects: [...state.projects, newProject],
                currentProject: newProject,
                isLoading: false
            }));

            return newProject;
        } catch (error) {
            console.error('Failed to create project:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to create project'
            });
            throw error;
        }
    },

    // Update an existing project
    updateProject: async (project: Project) => {
        set({ isLoading: true, error: null });

        try {
            // Update timestamp
            project.updatedAt = new Date();

            // Save to local storage
            ProjectStorage.saveProject(project);

            // Update state
            set(state => ({
                projects: state.projects.map(p => p.id === project.id ? project : p),
                currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
                isLoading: false
            }));
        } catch (error) {
            console.error('Failed to update project:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to update project'
            });
            throw error;
        }
    },

    // Delete a project
    deleteProject: async (projectId: string) => {
        set({ isLoading: true, error: null });

        try {
            // Delete from local storage
            ProjectStorage.deleteProject(projectId);

            // Update state
            set(state => ({
                projects: state.projects.filter(p => p.id !== projectId),
                currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
                isLoading: false
            }));
        } catch (error) {
            console.error('Failed to delete project:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to delete project'
            });
            throw error;
        }
    },

    // Set the current project
    setCurrentProject: (projectId: string) => {
        const { projects } = get();
        const project = projects.find(p => p.id === projectId);

        if (project) {
            set({ currentProject: project });
        } else {
            console.error(`Project with ID ${projectId} not found`);
            set({ error: `Project with ID ${projectId} not found` });
        }
    },

    // Clear the current project
    clearCurrentProject: () => {
        set({ currentProject: null });
    },

    // Set the application language
    setLanguage: (language: 'en' | 'fr') => {
        set({ language });
        // Save language preference to localStorage
        try {
            localStorage.setItem('irr-calculator-language', language);
        } catch (error) {
            console.error('Failed to save language preference:', error);
        }
    }
}));