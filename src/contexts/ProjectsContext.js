import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import logger from '../utils/logger';
import apiClient from '../utils/apiClient';
import { fallbackProjects } from '../constants/projects';

const ProjectsContext = createContext({
  projects: [],
  loading: true,
  error: null,
  refresh: async () => {},
  getProjectByIdentifier: () => undefined,
  syncProjects: () => {},
});

const normalizeProject = (source = {}) => {
  if (!source) {
    return null;
  }

  const id = source.id || source.slug || source._id || '';
  const derivedRoute = source.route || source.path || (id ? `/projects/${id}` : '#');
  const slugFromRoute = derivedRoute?.split?.('/')?.filter(Boolean).pop();
  const slug = (source.slug || slugFromRoute || id || '').toLowerCase();

  const tags = Array.isArray(source.tags)
    ? source.tags
    : Array.isArray(source.technology)
    ? source.technology
    : [];

  const technology = Array.isArray(source.technology) ? source.technology : tags;

  return {
    id,
    slug,
    title: source.title || 'Untitled Project',
    description: source.description || '',
    category: source.category || source.type || 'Uncategorized',
    status: source.status || source.stage || 'Unknown',
    tags,
    technology,
    dateCreated: source.dateCreated || source.createdAt || null,
    updatedAt: source.updatedAt || null,
    route: derivedRoute,
    path: source.path || derivedRoute,
    raw: source,
  };
};

const fallbackNormalizedProjects = fallbackProjects
  .map(normalizeProject)
  .filter((project) => project !== null);

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState(fallbackNormalizedProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchProjects = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const { data: payload } = await apiClient.get('/api/projects', {
        signal: controller.signal,
      });
      const receivedProjects = Array.isArray(payload?.projects)
        ? payload.projects.map(normalizeProject).filter((project) => project !== null)
        : [];

      if (receivedProjects.length === 0) {
        logger.interaction('projects-fallback', 'projects-provider', {
          reason: 'empty-response',
        });
        setProjects(fallbackNormalizedProjects);
      } else {
        setProjects(receivedProjects);
      }

      logger.interaction('projects-loaded', 'projects-provider', {
        count: receivedProjects.length,
      });
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return;
      }

      if (fetchError.name === 'TimeoutError') {
        logger.error('projects-fetch-timeout', fetchError);
      } else {
        logger.error('projects-fetch-failure', fetchError);
      }
      setProjects((current) => (current.length === 0 ? fallbackNormalizedProjects : current));
      setError(fetchError);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProjects]);

  const refresh = useCallback(() => fetchProjects(), [fetchProjects]);

  const getProjectByIdentifier = useCallback(
    (identifier) => {
      if (!identifier) {
        return null;
      }

      const normalizedIdentifier = identifier.toLowerCase();

      return (
        projects.find((project) => {
          const candidates = [
            project.id,
            project.slug,
            project.route,
            project.path,
            project.raw?.route,
            project.raw?.path,
          ]
            .filter(Boolean)
            .map((value) => value.toLowerCase());

          return candidates.some(
            (value) => value === normalizedIdentifier || value.endsWith(`/${normalizedIdentifier}`),
          );
        }) || null
      );
    },
    [projects],
  );

  const syncProjects = useCallback((projectList) => {
    if (!Array.isArray(projectList)) {
      return;
    }

    const normalized = projectList.map(normalizeProject).filter((project) => project !== null);
    setProjects(normalized);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      projects,
      loading,
      error,
      refresh,
      getProjectByIdentifier,
      syncProjects,
    }),
    [projects, loading, error, refresh, getProjectByIdentifier, syncProjects],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};

export const useProjects = () => useContext(ProjectsContext);

export const useProjectMetadata = (identifier) => {
  const { loading, error, getProjectByIdentifier } = useProjects();
  const project = useMemo(() => getProjectByIdentifier(identifier), [getProjectByIdentifier, identifier]);
  return { project, loading, error };
};

ProjectsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProjectsContext;
