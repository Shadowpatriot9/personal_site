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

const ProjectCard = ({ project }) => {
  const { theme } = useTheme();
  const technologies = Array.isArray(project.technology) ? project.technology : [];
  const categoryLabel = project.category || 'General';
  const statusLabel = project.status || 'Active';
  const route = project.route || '#';
  const description = project.description || '';
  const dateCreated = project.dateCreated || project.createdAt || project.updatedAt;

  const handleClick = () => {
    logger.interaction('click', 'project-card', {
      project: project.title,
      destination: route,
      status: statusLabel,
      category: categoryLabel
    });
  };

  return (
    <Link to={route} style={{ textDecoration: 'none' }}>
      <div
        onClick={handleClick}
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: `0 2px 8px ${theme.shadow}`,
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${theme.shadow}`;
          e.currentTarget.style.borderColor = theme.primary;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${theme.shadow}`;
          e.currentTarget.style.borderColor = theme.border;
        }}
      >
        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: getStatusColor(statusLabel, theme),
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span>{getStatusIcon(statusLabel)}</span>
          {statusLabel}
        </div>

        {/* Category Tag */}
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
          {categoryLabel}
        </div>

        {/* Project Title */}
        <h3 style={{
          color: theme.text,
          margin: '0 0 8px 0',
          fontSize: '20px',
          fontWeight: '600',
        }}>
          {project.title}
        </h3>

        {/* Project Description */}
        <p style={{
          color: theme.textSecondary,
          margin: '0 0 16px 0',
          fontSize: '14px',
          lineHeight: '1.5',
        }}>
          {description}
        </p>

        {/* Technology Tags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '12px',
        }}>
          {technologies.slice(0, 3).map((tech, index) => (
            <span
              key={index}
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
          {technologies.length > 3 && (
            <span style={{
              color: theme.textSecondary,
              fontSize: '11px',
            }}>
              +{technologies.length - 3} more
            </span>
          )}
        </div>

        {/* Date */}
        <div style={{
          color: theme.textSecondary,
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span>📅</span>
          {dateCreated ? new Date(dateCreated).toLocaleDateString() : 'Date unavailable'}
        </div>

        {/* Hover Effect Gradient */}
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
