import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProjects } from '../contexts/ProjectsContext';
import logger from '../utils/logger';

// Fallback fixtures for offline development
const fallbackProjects = [
  {
    id: 'sim',
    title: 'S_im',
    description: 'Shadow Simulator',
    category: 'Software',
    technology: ['Simulation', 'Software'],
    status: 'In Progress',
    dateCreated: '2024-01-01',
    tags: ['simulation', 'software', 'development'],
    route: '/projects/sim',
    displayOrder: 2,
    published: true
  },
  {
    id: 'sos',
    title: 'sOS',
    description: 'Shadow Operating System',
    category: 'Software',
    technology: ['Operating System', 'Low-level'],
    status: 'In Progress',
    dateCreated: '2023-06-15',
    tags: ['os', 'system', 'low-level', 'kernel'],
    route: '/projects/sos',
    displayOrder: 3,
    published: true
  },
  {
    id: 's9',
    title: 'S9',
    description: 'Shadow Home Server',
    category: 'Hardware',
    technology: ['Server', 'Networking', 'Linux'],
    status: 'Active',
    dateCreated: '2024-10-01',
    tags: ['server', 'networking', 'nas', 'ubuntu', 'homelab'],
    route: '/projects/s9',
    displayOrder: 1,
    published: true
  },
  {
    id: 'nfi',
    title: 'NFI',
    description: 'Rocket Propulsion System',
    category: 'Hardware',
    technology: ['Aerospace', 'Engineering'],
    status: 'Completed',
    dateCreated: '2022-03-01',
    tags: ['rocket', 'propulsion', 'aerospace', 'engineering'],
    route: '/projects/NFI',
    displayOrder: 4,
    published: true
  },
  {
    id: 'muse',
    title: 'Muse',
    description: 'Automated Audio Equalizer',
    category: 'Hardware',
    technology: ['Audio', 'Electronics'],
    status: 'Discontinued',
    dateCreated: '2018-03-01',
    tags: ['audio', 'music', 'equalizer', 'electronics'],
    route: '/projects/Muse',
    displayOrder: 7,
    published: true
  },
  {
    id: 'el',
    title: 'EyeLearn',
    description: 'Academia AR/VR Headset',
    category: 'Hardware',
    technology: ['AR/VR', 'Education'],
    status: 'Paused',
    dateCreated: '2021-09-01',
    tags: ['ar', 'vr', 'education', 'headset', 'learning'],
    route: '/projects/EL',
    displayOrder: 5,
    published: true
  },
  {
    id: 'naton',
    title: 'Naton',
    description: 'Element Converter',
    category: 'Hardware',
    technology: ['Chemistry', 'Physics'],
    status: 'Completed',
    dateCreated: '2020-01-15',
    tags: ['chemistry', 'physics', 'converter', 'elements'],
    route: '/projects/Naton',
    displayOrder: 6,
    published: true
    route: '/projects/Naton'
const getProjectTags = (project) => {
  if (!project) {
    return [];
  }

export const publishedProjectsData = projectsData.filter(project => project.published !== false);

const ProjectSearch = ({ onFilteredResults, className = '' }) => {
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

const ensureProjectShape = (project) => ({
  ...project,
  category: project.category || 'General',
  status: project.status || 'Active',
  technology: Array.isArray(project.technology) ? project.technology : [],
  tags: Array.isArray(project.tags) ? project.tags : [],
  description: project.description || '',
  route: project.route || project.path || `/projects/${project.id}`,
  dateCreated: project.dateCreated || project.createdAt || project.updatedAt || new Date().toISOString(),
});

const ProjectSearch = ({ onFilteredResults, onLoadingChange, className = '' }) => {
  const { theme } = useTheme();
  const { projects, loading, refresh } = useProjects();
  const hasRequestedRef = useRef(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error(`Failed to load projects: ${response.status}`);
        }

        const data = await response.json();
        if (!isMounted) {
          return;
        }

        const normalizedProjects = Array.isArray(data.projects) ? data.projects : [];
        const preparedProjects = normalizedProjects.map(ensureProjectShape);
        setProjects(preparedProjects);
        setLoadError(null);
        setIsUsingFallback(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProjects(fallbackProjects.map(ensureProjectShape));
        setLoadError(error);
        setIsUsingFallback(true);
        logger.error('project-fetch-failed', error, { scope: 'ProjectSearch' });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof onLoadingChange === 'function') {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  const categories = React.useMemo(() => {
    const uniqueCategories = new Set();
    projects.forEach((project) => {
      uniqueCategories.add(project.category || 'General');
    });
    return ['All', ...uniqueCategories];
  }, [projects]);

  // Get unique categories and statuses
  const categories = ['All', ...new Set(publishedProjectsData.map(p => p.category))];
  const statuses = ['All', ...new Set(publishedProjectsData.map(p => p.status))];

  const compareDisplayOrder = (a, b) => {
    const parsedOrderA = Number(a.displayOrder);
    const parsedOrderB = Number(b.displayOrder);
    const orderA = Number.isFinite(parsedOrderA) ? parsedOrderA : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(parsedOrderB) ? parsedOrderB : Number.MAX_SAFE_INTEGER;

    if (orderA === orderB) {
      return 0;
    }

    return orderA - orderB;
  };
  const statuses = React.useMemo(() => {
    const uniqueStatuses = new Set();
    projects.forEach((project) => {
      uniqueStatuses.add(project.status || 'Active');
    });
    return ['All', ...uniqueStatuses];
  }, [projects]);

  const filteredProjects = React.useMemo(() => {
    let filtered = publishedProjectsData.filter(project => {
      const matchesSearch = searchTerm === '' ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const normalizedProjects = projects.map(ensureProjectShape);
    const searchValue = searchTerm.trim().toLowerCase();

    let filtered = normalizedProjects.filter(project => {
      if (searchValue) {
        const matchesSearch =
          project.title.toLowerCase().includes(searchValue) ||
          project.description.toLowerCase().includes(searchValue) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchValue));

        if (!matchesSearch) {
          return false;
        }
      }

      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
      if (!matchesCategory) {
        return false;
      }

      const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
      if (!matchesStatus) {
        return false;
      }

      return true;
    });

    const getTimeValue = (project) => {
      const candidate = project.dateCreated || project.createdAt || project.updatedAt;
      const timestamp = candidate ? new Date(candidate).getTime() : 0;
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    filtered.sort((a, b) => {
      const orderComparison = compareDisplayOrder(a, b);

      switch (sortBy) {
        case 'newest':
          if (orderComparison !== 0) {
            return orderComparison;
          }
          return new Date(b.dateCreated) - new Date(a.dateCreated);
        case 'oldest':
          if (orderComparison !== 0) {
            return orderComparison;
          }
          return new Date(a.dateCreated) - new Date(b.dateCreated);
        case 'alphabetical':
          {
            const alphaComparison = a.title.localeCompare(b.title);
            return alphaComparison !== 0 ? alphaComparison : orderComparison;
          }
        case 'status':
          {
            const statusComparison = a.status.localeCompare(b.status);
            return statusComparison !== 0 ? statusComparison : orderComparison;
          }
          return getTimeValue(b) - getTimeValue(a);
        case 'oldest':
          return getTimeValue(a) - getTimeValue(b);
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
          return orderComparison;
      }
    });

    return filtered;
    return sorted;
  }, [projects, searchTerm, selectedCategory, selectedStatus, sortBy]);

  useEffect(() => {
    onFilteredResults(filteredProjects);

    if (!isLoading && (searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All')) {
    if (filteredProjects.length > 0 || searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') {
      logger.interaction('search-filter', 'project-search', {
        searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        resultCount: filteredProjects.length,
        usingFallback: isUsingFallback,
      });
    }
  }, [filteredProjects, onFilteredResults, searchTerm, selectedCategory, selectedStatus, sortBy, isLoading, isUsingFallback]);

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
            onFocus={(e) => e.target.style.borderColor = theme.primary}
            onBlur={(e) => e.target.style.borderColor = theme.border}
            disabled={isLoading && !isUsingFallback}
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

      {/* Filter Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? '16px' : '0',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          color: theme.textSecondary,
          fontSize: '14px',
          flexWrap: 'wrap'
        }}>
          <span>
            {isLoading ? 'Loading projects…' : `Found ${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`}
          </span>
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

          {isUsingFallback && !isLoading && (
            <span style={{
              background: theme.warning + '33',
              color: theme.warning,
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Offline data
            </span>
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
          disabled={isLoading && !isUsingFallback}
        >
          <span>{isExpanded ? 'Hide' : 'Show'} Filters</span>
          <span style={{
            transition: 'transform 0.3s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
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

      {loadError && !isLoading && (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: theme.warning + '20',
          color: theme.warning,
          fontSize: '13px'
        }}>
          Unable to reach the projects API. Showing local fixtures instead.
        </div>
      )}

      {/* Advanced Filters */}
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
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
            }}>
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
              disabled={isLoading && !isUsingFallback}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
            }}>
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
              disabled={isLoading && !isUsingFallback}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
            }}>
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
              disabled={isLoading && !isUsingFallback}
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
