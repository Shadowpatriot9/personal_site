'use client';

import React, { useEffect, useMemo, useState } from 'react';
import logger from '@/lib/logger';
import { fallbackProjects, type Project } from '@/lib/projects';

const toComparableString = (value?: string | null) => (value || '').toLowerCase();

const getProjectTags = (project?: Project | null): string[] => {
  if (!project) return [];
  if (Array.isArray(project.tags) && project.tags.length > 0) return project.tags;
  if (Array.isArray(project.technology) && project.technology.length > 0) return project.technology;
  return [];
};

const getProjectDate = (project?: Project | null) =>
  project?.dateCreated || project?.updatedAt || null;

const sortProjects = (projects: Project[], sortBy: string) => {
  const toTime = (value?: string | null) => {
    if (!value) return 0;
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

interface ProjectSearchProps {
  projects: Project[];
  onFilteredResults?: (projects: Project[]) => void;
  className?: string;
}

const ProjectSearch = ({ projects, onFilteredResults, className = '' }: ProjectSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const dataset = useMemo(
    () => (projects && projects.length > 0 ? projects : fallbackProjects),
    [projects],
  );

  const categories = useMemo(() => {
    const unique = new Set(dataset.map((project) => project?.category).filter(Boolean));
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
      if (!matchesSearch) return false;
      return selectedCategory === 'All' || project?.category === selectedCategory;
    });
    return sortProjects(results, sortBy);
  }, [dataset, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    onFilteredResults?.(filteredProjects);
    logger.interaction('search-filter', 'project-search', {
      searchTerm,
      category: selectedCategory,
      sortBy,
      resultCount: filteredProjects.length,
    });
  }, [filteredProjects, onFilteredResults, searchTerm, selectedCategory, sortBy]);

  return (
    <div className={`project-search ${className}`}>
      <input
        className="project-search__input"
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search projects"
        aria-label="Search projects"
      />
      <select
        className="project-search__select"
        value={selectedCategory}
        onChange={(event) => setSelectedCategory(event.target.value)}
        aria-label="Filter by category"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category === 'All' ? 'All categories' : category}
          </option>
        ))}
      </select>
      <select
        className="project-search__select"
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value)}
        aria-label="Sort projects"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="alphabetical">A–Z</option>
        <option value="status">Status</option>
      </select>
    </div>
  );
};

export default ProjectSearch;
