import React from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectGridProps } from '../types';

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onSelect,
  onEdit,
  onDelete,
  copiedId,
  onCopy,
  onOpenTechModal,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((proj) => (
        <ProjectCard
          key={proj.id}
          project={proj}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          copiedId={copiedId}
          onCopy={onCopy}
          onOpenTechModal={onOpenTechModal}
        />
      ))}
    </div>
  );
};
