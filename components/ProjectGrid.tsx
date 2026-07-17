'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import logger from '@/lib/logger';
import type { Project } from '@/lib/projects';

const formatDate = (value?: string | Date | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const ProjectCardContent = ({ project }: { project: Project }) => {
  const status = project?.status || 'Unknown';
  const technologies = Array.isArray(project?.technology) ? project.technology : [];
  const formattedDate = formatDate(project?.dateCreated || project?.updatedAt);

  return (
    <div className={`project-card${project?.image ? ' has-cover' : ''}`}>
      {project?.image && (
        <div className="project-card__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.image} alt="" loading="lazy" />
        </div>
      )}

      <div className="project-card__top">
        <span className="project-card__status">{status}</span>
        <span className="project-card__category">{project?.category || 'Project'}</span>
      </div>

      <h3 className="project-card__title">{project?.title || 'Untitled Project'}</h3>
      <p className="project-card__desc">{project?.description || 'Description coming soon.'}</p>

      {technologies.length > 0 && (
        <div className="project-card__tags">
          {technologies.slice(0, 3).map((tech, index) => (
            <span key={`${project.id}-tech-${index}`} className="project-card__tag">
              {tech}
            </span>
          ))}
          {technologies.length > 3 && (
            <span className="project-card__tag">+{technologies.length - 3}</span>
          )}
        </div>
      )}

      {formattedDate && <div className="project-card__meta">{formattedDate}</div>}
    </div>
  );
};

export const ProjectCard = ({
  project,
  previewMode = false,
}: {
  project: Project;
  previewMode?: boolean;
}) => {
  const route = project?.route || project?.path || (project?.id ? `/projects/${project.id}` : '#');

  const handleClick = () => {
    if (previewMode) return;
    logger.interaction('click', 'project-card', {
      project: project?.title,
      destination: route,
    });
  };

  const card = <ProjectCardContent project={project} />;

  if (previewMode) {
    return <div style={{ height: '100%' }}>{card}</div>;
  }

  return (
    <Link href={route} style={{ height: '100%' }} onClick={handleClick}>
      {card}
    </Link>
  );
};

const LoadingGrid = () => {
  const placeholders = Array.from({ length: 3 });
  return (
    <div className="projects-grid">
      {placeholders.map((_, index) => (
        <div
          key={`placeholder-${index}`}
          className="project-card"
          style={{ opacity: 0.6, minHeight: 180, animation: 'pulse 1.5s ease-in-out infinite' }}
        />
      ))}
      <style>{`@keyframes pulse { 0%,100% { opacity: 0.45 } 50% { opacity: 0.7 } }`}</style>
    </div>
  );
};

const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => {
  const { theme } = useTheme();
  return (
    <div style={{ padding: '48px 0', color: theme.textSecondary }}>
      <p style={{ margin: '0 0 16px' }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: 'transparent',
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: 'var(--radius-pill)',
            padding: '8px 18px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
};

const EmptyState = ({ message }: { message?: string }) => {
  const { theme } = useTheme();
  return (
    <div style={{ padding: '48px 0', color: theme.textSecondary }}>
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
};

interface ProjectGridProps {
  projects: Project[];
  emptyMessage?: string;
  loading?: boolean;
  error?: { message?: string; code?: string } | null;
  onRetry?: () => void;
}

const ProjectGrid = ({
  projects,
  emptyMessage = 'No projects found matching your criteria.',
  loading = false,
  error = null,
  onRetry,
}: ProjectGridProps) => {
  if (loading) return <LoadingGrid />;

  if (error) {
    const message =
      error?.code === 'NO_TOKEN'
        ? 'Admin authentication is required to view the project catalog.'
        : error?.message || 'Something went wrong while fetching projects.';
    return <ErrorState message={message} onRetry={onRetry} />;
  }

  if (!projects || projects.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <ProjectCard key={project.id || project.route} project={project} />
      ))}
    </div>
  );
};

export default ProjectGrid;
