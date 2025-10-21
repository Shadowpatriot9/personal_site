import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProjects } from '../contexts/ProjectsContext';
import logger from '../utils/logger';

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

const getProjectDate = (project) => {
  if (!project) {
    return null;
  }

  return project.dateCreated || project.createdAt || project.raw?.createdAt || null;
};

const getCategory = (project) => project?.category || 'Uncategorized';
const getStatus = (project) => project?.status || 'Unknown';

const ProjectSearch = ({ onFilteredResults, className = '' }) => {
  const { theme } = useTheme();
  const { projects, loading, refresh } = useProjects();
  const hasRequestedRef = useRef(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      refresh();
    }
  }, [refresh]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set();
    projects.forEach((project) => {
      const category = getCategory(project);
      if (category) {
        uniqueCategories.add(category);
      }
    });

    return ['All', ...Array.from(uniqueCategories)];
  }, [projects]);

  const statuses = useMemo(() => {
    const uniqueStatuses = new Set();
    projects.forEach((project) => {
      const status = getStatus(project);
      if (status) {
        uniqueStatuses.add(status);
      }
    });

    return ['All', ...Array.from(uniqueStatuses)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const dataset = Array.isArray(projects) ? projects : [];

    const filtered = dataset.filter((project) => {
      const title = project?.title || '';
      const description = project?.description || '';
      const tags = getProjectTags(project);
      const searchLower = searchTerm.trim().toLowerCase();

      const matchesSearch =
        searchLower === '' ||
        title.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower) ||
        tags.some((tag) => tag.toLowerCase().includes(searchLower));

      const matchesCategory = selectedCategory === 'All' || getCategory(project) === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || getStatus(project) === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest': {
          const dateA = getProjectDate(b);
          const dateB = getProjectDate(a);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return new Date(dateA) - new Date(dateB);
        }
        case 'oldest': {
          const dateA = getProjectDate(a);
          const dateB = getProjectDate(b);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return new Date(dateA) - new Date(dateB);
        }
        case 'alphabetical':
          return (a?.title || '').localeCompare(b?.title || '');
        case 'status':
          return getStatus(a).localeCompare(getStatus(b));
        default:
          return 0;
      }
    });

    return sorted;
  }, [projects, searchTerm, selectedCategory, selectedStatus, sortBy]);

  useEffect(() => {
    onFilteredResults(filteredProjects);

    if (filteredProjects.length > 0 || searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') {
      logger.interaction('search-filter', 'project-search', {
        searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        resultCount: filteredProjects.length,
      });
    }
  }, [filteredProjects, searchTerm, selectedCategory, selectedStatus, sortBy, onFilteredResults]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSortBy('newest');
    logger.interaction('clear-filters', 'project-search', { action: 'clear-all' });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    logger.interaction('toggle-filters', 'project-search', { expanded: !isExpanded });
  };

  const resultLabel = loading ? 'Loading projects…' : `Found ${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`;

  return (
    <div
      className={`project-search ${className}`}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: `0 4px 12px ${theme.shadow}`,
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search projects by name, description, or tags..."
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={loading && !projects.length}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: `2px solid ${theme.border}`,
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: theme.background,
              color: theme.text,
              opacity: loading && !projects.length ? 0.6 : 1,
              outline: 'none',
              transition: 'border-color 0.3s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = theme.primary)}
            onBlur={(e) => (e.target.style.borderColor = theme.border)}
          />
          <div
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.textSecondary,
              fontSize: '18px',
            }}
          >
            🔍
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isExpanded ? '16px' : '0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            color: theme.textSecondary,
            fontSize: '14px',
          }}
        >
          <span>{resultLabel}</span>

          {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: theme.primary,
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline',
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <button
          onClick={toggleExpanded}
          style={{
            background: theme.primary,
            color: theme.background,
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
          }}
        >
          <span>{isExpanded ? 'Hide' : 'Show'} Filters</span>
          <span
            style={{
              transition: 'transform 0.3s ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▼
          </span>
        </button>
      </div>

      {isExpanded && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '16px',
            padding: '16px',
            backgroundColor: theme.secondary,
            borderRadius: '8px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading && !projects.length}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                backgroundColor: theme.background,
                color: theme.text,
                fontSize: '14px',
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={loading && !projects.length}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                backgroundColor: theme.background,
                color: theme.text,
                fontSize: '14px',
              }}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={loading && !projects.length}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                backgroundColor: theme.background,
                color: theme.text,
                fontSize: '14px',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="status">By Status</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSearch;
