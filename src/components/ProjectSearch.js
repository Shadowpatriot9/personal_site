import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

// Project data with metadata for filtering
export const projectsData = [
  {
    id: 'sim',
    title: 'S_im',
    description: 'Shadow Simulator',
    category: 'Software',
    technology: ['Simulation', 'Software'],
    status: 'In Progress',
    dateCreated: '2024-01-01',
    tags: ['simulation', 'software', 'development'],
    route: '/projects/sim'
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
    route: '/projects/sos'
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
    route: '/projects/s9'
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
    route: '/projects/NFI'
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
    route: '/projects/Muse'
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
    route: '/projects/EL'
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
    route: '/projects/Naton'
  }
];

const ProjectSearch = ({ onFilteredResults, className = '' }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique categories and statuses
  const categories = ['All', ...new Set(projectsData.map(p => p.category))];
  const statuses = ['All', ...new Set(projectsData.map(p => p.status))];

  // Filter and sort projects
  const filteredProjects = React.useMemo(() => {
    let filtered = projectsData.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dateCreated) - new Date(a.dateCreated);
        case 'oldest':
          return new Date(a.dateCreated) - new Date(b.dateCreated);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedStatus, sortBy]);

  // Send filtered results to parent component
  useEffect(() => {
    onFilteredResults(filteredProjects);
    
    // Log search activity
    if (searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') {
      logger.interaction('search-filter', 'project-search', {
        searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        resultCount: filteredProjects.length
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

  return (
    <div className={`project-search ${className}`} style={{
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: `0 4px 12px ${theme.shadow}`,
    }}>
      {/* Search Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search projects by name, description, or tags..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: `2px solid ${theme.border}`,
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: theme.background,
              color: theme.text,
              outline: 'none',
              transition: 'border-color 0.3s ease',
            }}
            onFocus={(e) => e.target.style.borderColor = theme.primary}
            onBlur={(e) => e.target.style.borderColor = theme.border}
          />
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.textSecondary,
            fontSize: '18px',
          }}>
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
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          color: theme.textSecondary,
          fontSize: '14px',
        }}>
          <span>Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}</span>
          
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
          <span style={{ 
            transition: 'transform 0.3s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '16px',
          padding: '16px',
          backgroundColor: theme.secondary,
          borderRadius: '8px',
        }}>
          {/* Category Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
