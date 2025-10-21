import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

// Status color mapping
const getStatusColor = (status, theme) => {
  switch (status) {
    case 'Active':
      return theme.success;
    case 'Completed':
      return '#4caf50';
    case 'In Progress':
      return theme.warning;
    case 'Paused':
      return '#ff9800';
    case 'Discontinued':
      return theme.danger;
    default:
      return theme.textSecondary;
  }
};

// Status icons
const getStatusIcon = (status) => {
  switch (status) {
    case 'Active':
      return '🟢';
    case 'Completed':
      return '✅';
    case 'In Progress':
      return '🔄';
    case 'Paused':
      return '⏸️';
    case 'Discontinued':
      return '❌';
    default:
      return '⚫';
  }
};

export const ProjectCard = ({ project, previewMode = false }) => {
  const { theme } = useTheme();

  const status = project?.status || (project?.published ? 'Published' : 'Draft');
  const category = project?.category || (project?.published ? 'Published' : 'Preview');
  const technology = Array.isArray(project?.technology) ? project.technology : [];
  const route = project?.route || project?.path || '#';

  const dateValue = project?.dateCreated ? new Date(project.dateCreated) : new Date();
  const formattedDate = Number.isNaN(dateValue.getTime())
    ? new Date().toLocaleDateString()
    : dateValue.toLocaleDateString();

  const handleClick = () => {
    if (previewMode) {
      return;
    }

    logger.interaction('click', 'project-card', {
      project: project?.title,
      destination: route,
      status,
      category,
    });
  };

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '20px',
    cursor: previewMode ? 'default' : 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: `0 2px 8px ${theme.shadow}`,
    position: 'relative',
    overflow: 'hidden',
  };

  const handleMouseOver = (event) => {
    if (previewMode) {
      return;
    }
    event.currentTarget.style.transform = 'translateY(-4px)';
    event.currentTarget.style.boxShadow = `0 8px 24px ${theme.shadow}`;
    event.currentTarget.style.borderColor = theme.primary;
  };

  const handleMouseOut = (event) => {
    if (previewMode) {
      return;
    }
    event.currentTarget.style.transform = 'translateY(0)';
    event.currentTarget.style.boxShadow = `0 2px 8px ${theme.shadow}`;
    event.currentTarget.style.borderColor = theme.border;
  };

  const statusColor = getStatusColor(status, theme);

  const cardContent = (
    <div
      onClick={previewMode ? undefined : handleClick}
      style={cardStyle}
      onMouseOver={previewMode ? undefined : handleMouseOver}
      onMouseOut={previewMode ? undefined : handleMouseOut}
      aria-live={previewMode ? 'polite' : undefined}
    >
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: statusColor,
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <span>{getStatusIcon(status)}</span>
        {status}
      </div>

      <div style={{
        display: 'inline-block',
        background: theme.secondary,
        color: theme.textSecondary,
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '500',
        marginBottom: '12px',
      }}>
        {category}
      </div>

      <h3 style={{
        color: theme.text,
        margin: '0 0 8px 0',
        fontSize: '20px',
        fontWeight: '600',
      }}>
        {project?.title || 'Untitled Project'}
      </h3>

      <p style={{
        color: theme.textSecondary,
        margin: '0 0 16px 0',
        fontSize: '14px',
        lineHeight: '1.5',
      }}>
        {project?.description || 'Description pending.'}
      </p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '12px',
      }}>
        {technology.slice(0, 3).map((tech, index) => (
          <span
            key={`${tech}-${index}`}
            style={{
              background: theme.primary + '20',
              color: theme.primary,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
            }}
          >
            {tech}
          </span>
        ))}
        {technology.length > 3 && (
          <span style={{
            color: theme.textSecondary,
            fontSize: '11px',
          }}>
            +{technology.length - 3} more
          </span>
        )}
      </div>

      <div style={{
        color: theme.textSecondary,
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <span role="img" aria-label="Date created">📅</span>
        {formattedDate}
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }}
      className="hover-gradient"
      />
    </div>
  );

  if (previewMode) {
    return (
      <div style={{ textDecoration: 'none' }}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={route} style={{ textDecoration: 'none' }}>
      {cardContent}
    </Link>
  );
};

const ProjectGrid = ({ projects, emptyMessage = "No projects found matching your criteria." }) => {
  const { theme } = useTheme();

  if (projects.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: theme.textSecondary,
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
        }}>
          🔍
        </div>
        <h3 style={{
          color: theme.text,
          marginBottom: '8px',
        }}>
          No Projects Found
        </h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginTop: '24px',
    }}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}

      <style jsx>{`
        .hover-gradient:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default ProjectGrid;
