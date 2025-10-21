import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

const statusColors = (theme) => ({
  Active: theme.success,
  Completed: '#4caf50',
  'In Progress': theme.warning,
  Paused: '#ff9800',
  Discontinued: theme.danger,
  Unknown: theme.textSecondary,
});

const statusIcons = {
  Active: '🟢',
  Completed: '✅',
  'In Progress': '🔄',
  Paused: '⏸️',
  Discontinued: '❌',
  Unknown: '⚫',
};

const projectPropType = PropTypes.shape({
  id: PropTypes.string,
  slug: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  category: PropTypes.string,
  status: PropTypes.string,
  technology: PropTypes.arrayOf(PropTypes.string),
  dateCreated: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
});

const formatDate = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString();
};

const ProjectCardContent = ({ project, theme }) => {
  const category = project?.category || 'Uncategorized';
  const status = project?.status || 'Unknown';
  const technologies = Array.isArray(project?.technology) ? project.technology : [];
  const formattedDate = formatDate(project?.dateCreated || project?.createdAt || project?.updatedAt);
  const statusPalette = statusColors(theme);
  const statusColor = statusPalette[status] || theme.textSecondary;
  const statusIcon = statusIcons[status] || statusIcons.Unknown;

  return (
    <div
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '20px',
        transition: 'all 0.3s ease',
        boxShadow: `0 2px 8px ${theme.shadow}`,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: statusColor,
          color: '#ffffff',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>{statusIcon}</span>
        {status}
      </div>

      <div
        style={{
          display: 'inline-block',
          background: theme.secondary,
          color: theme.textSecondary,
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 500,
          alignSelf: 'flex-start',
        }}
      >
        {category}
      </div>

      <h3
        style={{
          color: theme.text,
          margin: '0',
          fontSize: '20px',
          fontWeight: 600,
        }}
      >
        {project?.title || 'Untitled Project'}
      </h3>

      <p
        style={{
          color: theme.textSecondary,
          margin: '0',
          fontSize: '14px',
          lineHeight: 1.5,
          flexGrow: 1,
        }}
      >
        {project?.description || 'Description coming soon.'}
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {technologies.slice(0, 3).map((tech, index) => (
          <span
            key={`${project.id}-tech-${index}`}
            style={{
              background: `${theme.primary}20`,
              color: theme.primary,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            {tech}
          </span>
        ))}
        {technologies.length > 3 && (
          <span style={{ color: theme.textSecondary, fontSize: '11px' }}>
            +{technologies.length - 3} more
          </span>
        )}
      </div>

      <div
        style={{
          color: theme.textSecondary,
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span role="img" aria-label="Date created">
          📅
        </span>
        {formattedDate || 'Date unavailable'}
      </div>
    </div>
  );
};

export const ProjectCard = ({ project, previewMode = false }) => {
  const { theme } = useTheme();
  const route = project?.route || project?.path || (project?.id ? `/projects/${project.id}` : '#');

  const handleClick = () => {
    if (previewMode) {
      return;
    }

    logger.interaction('click', 'project-card', {
      project: project?.title,
      destination: route,
      status: project?.status,
      category: project?.category,
    });
  };

  const card = <ProjectCardContent project={project} theme={theme} />;

  if (previewMode) {
    return <div style={{ height: '100%' }}>{card}</div>;
  }

  return (
    <Link to={route} style={{ textDecoration: 'none', height: '100%' }} onClick={handleClick}>
      <div
        style={{ height: '100%' }}
        onMouseOver={(event) => {
          event.currentTarget.style.transform = 'translateY(-4px)';
          event.currentTarget.style.boxShadow = `0 8px 24px ${theme.shadow}`;
          event.currentTarget.style.borderColor = theme.primary;
        }}
        onFocus={(event) => {
          event.currentTarget.style.transform = 'translateY(-4px)';
          event.currentTarget.style.boxShadow = `0 8px 24px ${theme.shadow}`;
          event.currentTarget.style.borderColor = theme.primary;
        }}
        onMouseOut={(event) => {
          event.currentTarget.style.transform = 'translateY(0)';
          event.currentTarget.style.boxShadow = `0 2px 8px ${theme.shadow}`;
          event.currentTarget.style.borderColor = theme.border;
        }}
        onBlur={(event) => {
          event.currentTarget.style.transform = 'translateY(0)';
          event.currentTarget.style.boxShadow = `0 2px 8px ${theme.shadow}`;
          event.currentTarget.style.borderColor = theme.border;
        }}
      >
        {card}
      </div>
    </Link>
  );
};

const LoadingGrid = () => {
  const { theme } = useTheme();
  const placeholders = Array.from({ length: 3 });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginTop: '24px',
      }}
    >
      {placeholders.map((_, index) => (
        <div
          key={`placeholder-${index}`}
          style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: `0 2px 8px ${theme.shadow}`,
            opacity: 0.8,
            animation: 'pulse 1.5s ease-in-out infinite',
            minHeight: '220px',
          }}
        >
          <div style={{ alignSelf: 'flex-end', width: '80px', height: '20px', background: theme.secondary, borderRadius: '12px' }} />
          <div style={{ width: '120px', height: '18px', background: theme.secondary, borderRadius: '6px', marginTop: '12px' }} />
          <div style={{ width: '60%', height: '24px', background: theme.secondary, borderRadius: '6px', marginTop: '12px' }} />
          <div style={{ width: '100%', height: '48px', background: theme.secondary, borderRadius: '6px', marginTop: '12px' }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <span style={{ flex: 1, height: '18px', background: theme.secondary, borderRadius: '6px' }} />
            <span style={{ flex: 1, height: '18px', background: theme.secondary, borderRadius: '6px' }} />
            <span style={{ flex: 1, height: '18px', background: theme.secondary, borderRadius: '6px' }} />
          </div>
          <div style={{ width: '120px', height: '16px', background: theme.secondary, borderRadius: '6px', marginTop: '12px' }} />
        </div>
      ))}

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

const ErrorState = ({ message, onRetry }) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: theme.textSecondary,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        marginTop: '24px',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ color: theme.text, marginBottom: '8px' }}>Unable to load projects</h3>
      <p style={{ marginBottom: '16px' }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: theme.primary,
            color: theme.background,
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
};

const EmptyState = ({ message }) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: theme.textSecondary,
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
      <h3 style={{ color: theme.text, marginBottom: '8px' }}>No Projects Found</h3>
      <p>{message}</p>
    </div>
  );
};

const ProjectGrid = ({ projects, emptyMessage, loading = false, error = null, onRetry }) => {
  if (loading) {
    return <LoadingGrid />;
  }

  if (error) {
    const errorMessage =
      error?.code === 'NO_TOKEN'
        ? 'Admin authentication is required to view the project catalog.'
        : error?.message || 'Something went wrong while fetching projects.';
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  if (!projects || projects.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginTop: '24px',
      }}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id || project.route} project={project} />
      ))}
    </div>
  );
};

ProjectGrid.defaultProps = {
  emptyMessage: 'No projects found matching your criteria.',
};

ProjectCardContent.propTypes = {
  project: projectPropType.isRequired,
  theme: PropTypes.shape({
    cardBg: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
    shadow: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    textSecondary: PropTypes.string.isRequired,
    primary: PropTypes.string.isRequired,
    success: PropTypes.string.isRequired,
    warning: PropTypes.string.isRequired,
    danger: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired,
  }).isRequired,
};

ProjectCard.propTypes = {
  project: projectPropType.isRequired,
  previewMode: PropTypes.bool,
};

ErrorState.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
};

ProjectGrid.propTypes = {
  projects: PropTypes.arrayOf(projectPropType),
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string,
    code: PropTypes.string,
  }),
  onRetry: PropTypes.func,
};

export default ProjectGrid;
