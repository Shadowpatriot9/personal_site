import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../contexts/ThemeContext';
import { useProjects } from '../contexts/ProjectsContext';
import logger from '../utils/logger';
import { fallbackProjects } from '../constants/projects';

const toComparableString = (value) => (value || '').toLowerCase();

const getProjectTags = (project) => {
  if (!project) {
    return [];
  }

  if (Array.isArray(project.tags) && project.tags.length > 0) {
    return project.tags;
  }

  if (Array.isArray(project.technology) && project.technology.length > 0) {
    return project.technology;
  }

  return [];
};

const getProjectDate = (project) => project?.dateCreated || project?.createdAt || project?.updatedAt || null;

const sortProjects = (projects, sortBy) => {
  const toTime = (value) => {
    if (!value) {
      return 0;
    }
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  const sorted = [...projects];

  switch (sortBy) {
    case 'newest':
      sorted.sort((a, b) => toTime(getProjectDate(b)) - toTime(getProjectDate(a)));
      break;
    case 'oldest':
      sorted.sort((a, b) => toTime(getProjectDate(a)) - toTime(getProjectDate(b)));
      break;
    case 'alphabetical':
      sorted.sort((a, b) => toComparableString(a?.title).localeCompare(toComparableString(b?.title)));
      break;
    case 'status':
      sorted.sort((a, b) => toComparableString(a?.status).localeCompare(toComparableString(b?.status)));
      break;
    default:
      break;
  }

  return sorted;
};

const ProjectSearch = ({ onFilteredResults, onLoadingChange, className = '' }) => {
  const { theme } = useTheme();
  const { projects, loading, error } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof onLoadingChange === 'function') {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  const dataset = useMemo(() => (projects && projects.length > 0 ? projects : fallbackProjects), [projects]);

  const categories = useMemo(() => {
    const unique = new Set(dataset.map((project) => project?.category).filter(Boolean));
    return ['All', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [dataset]);

  const statuses = useMemo(() => {
    const unique = new Set(dataset.map((project) => project?.status).filter(Boolean));
    return ['All', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [dataset]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const results = dataset.filter((project) => {
      const title = toComparableString(project?.title);
      const description = toComparableString(project?.description);
      const tags = getProjectTags(project).map((tag) => toComparableString(tag));

      const matchesSearch =
        normalizedSearch.length === 0 ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        tags.some((tag) => tag.includes(normalizedSearch));

      if (!matchesSearch) {
        return false;
      }

      const matchesCategory = selectedCategory === 'All' || project?.category === selectedCategory;
      if (!matchesCategory) {
        return false;
      }

      const matchesStatus = selectedStatus === 'All' || project?.status === selectedStatus;
      return matchesStatus;
    });

    return sortProjects(results, sortBy);
  }, [dataset, searchTerm, selectedCategory, selectedStatus, sortBy]);

  useEffect(() => {
    if (typeof onFilteredResults === 'function') {
      onFilteredResults(filteredProjects);
    }

    logger.interaction('search-filter', 'project-search', {
      searchTerm,
      category: selectedCategory,
      status: selectedStatus,
      sortBy,
      resultCount: filteredProjects.length,
      error: error?.message,
    });
  }, [filteredProjects, onFilteredResults, searchTerm, selectedCategory, selectedStatus, sortBy, error]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSortBy('newest');
  };

  return (
    <div
      className={`project-search ${className}`}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: `0 2px 8px ${theme.shadow}`,
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label htmlFor="project-search-input" style={{ fontWeight: 600, color: theme.text }}>
          Search projects
        </label>
        <input
          id="project-search-input"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by title, description, or tags"
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            background: theme.background,
            color: theme.text,
            fontSize: '14px',
          }}
        />
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            style={{
              background: theme.primary,
              color: theme.background,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{isExpanded ? 'Hide filters' : 'Show filters'}</span>
            <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>▼</span>
          </button>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              background: 'transparent',
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '16px', display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: theme.text }}>
            Category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                background: theme.background,
                color: theme.text,
                fontSize: '14px',
              }}
            >
              {categories.map((category) => (
                <option key={`category-${category}`} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: theme.text }}>
            Status
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                background: theme.background,
                color: theme.text,
                fontSize: '14px',
              }}
            >
              {statuses.map((status) => (
                <option key={`status-${status}`} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: theme.text }}>
            Sort by
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                background: theme.background,
                color: theme.text,
                fontSize: '14px',
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="status">Status</option>
            </select>
          </label>
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${theme.warning}`,
            background: `${theme.warning}20`,
            color: theme.warning,
            fontSize: '14px',
          }}
        >
          Unable to load the live catalog. Showing the latest available data.
        </div>
      )}
    </div>
  );
};

ProjectSearch.propTypes = {
  onFilteredResults: PropTypes.func,
  onLoadingChange: PropTypes.func,
  className: PropTypes.string,
};

export default ProjectSearch;
