import React, { useState } from 'react';
import type { Project } from '../../types';
import { Card, Button } from '../common';
import { EditProjectModal } from './EditProjectModal';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  onDelete: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onSelect,
  onDelete
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatIRR = (irr?: number) => {
    if (irr === undefined || irr === null) {
      return 'Not calculated';
    }
    return `${(irr * 100).toFixed(2)}%`;
  };

  const getIRRColor = (irr?: number) => {
    if (irr === undefined || irr === null) {
      return 'text-gray-500';
    }
    if (irr > 0.15) return 'text-green-600';
    if (irr > 0.08) return 'text-blue-600';
    if (irr > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const hasData = project.initialInvestment.total > 0 || 
                  project.cashFlows.some(cf => cf.netCashFlow !== 0) || 
                  project.saleProceeds.netProceeds > 0;

  if (viewMode === 'list') {
    return (
      <>
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {project.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-gray-500">IRR</div>
                    <div className={`font-medium ${getIRRColor(project.calculatedIRR)}`}>
                      {formatIRR(project.calculatedIRR)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-500">Updated</div>
                    <div className="text-gray-900">
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-500">Status</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      hasData 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hasData ? 'Has Data' : 'Empty'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-1 text-sm"
              >
                Edit
              </Button>
              <Button
                onClick={onSelect}
                className="px-4 py-1 text-sm"
              >
                Open
              </Button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete project"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </Card>

        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          project={project}
        />
      </>
    );
  }

  // Grid view
  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <div 
          className="space-y-4"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            
            {/* Status Badge */}
            <div className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
              hasData 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {hasData ? 'Has Data' : 'Empty'}
            </div>
          </div>

          {/* IRR Display */}
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Internal Rate of Return</div>
            <div className={`text-2xl font-bold ${getIRRColor(project.calculatedIRR)}`}>
              {formatIRR(project.calculatedIRR)}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Created: {formatDate(project.createdAt)}</span>
            <span>Updated: {formatDate(project.updatedAt)}</span>
          </div>

          {/* Actions */}
          <div className={`flex gap-2 transition-opacity ${
            showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <Button
              onClick={onSelect}
              className="flex-1"
            >
              Open Project
            </Button>
            <Button
              variant="secondary"
              onClick={(e) => {
                e?.stopPropagation();
                setIsEditModalOpen(true);
              }}
              className="px-3"
              aria-label="Edit project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              variant="danger"
              onClick={(e) => {
                e?.stopPropagation();
                onDelete();
              }}
              className="px-3"
              aria-label="Delete project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      </Card>

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
      />
    </>
  );
};

export default ProjectCard;