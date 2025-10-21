import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import logger from '../utils/logger';

const ProjectsContext = createContext({
  projects: [],
  loading: false,
  error: null,
  refresh: () => Promise.resolve(),
  getProjectByIdentifier: () => null,
  syncProjects: () => {},
});

const isLocalEnvironment = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || process.env.NODE_ENV === 'development';
};

const normalizeProject = (source = {}) => {
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

const localMockProjects = [
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
    route: '/projects/muse',
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
  },
];

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  const fetchProjects = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let token = null;
      if (typeof window !== 'undefined') {
        token = window.localStorage.getItem('adminToken');
      }

      const localEnvironment = isLocalEnvironment();

      if (!token && localEnvironment) {
        token = 'dev-token';
      }

      if (token === 'dev-token' && localEnvironment) {
        const normalized = localMockProjects.map(normalizeProject);
        setProjects(normalized);
        logger.interaction('fetch-success', 'projects-provider', {
          count: normalized.length,
          source: 'local-mock',
        });
        return;
      }

      if (!token) {
        const noTokenError = new Error('Admin authentication required to load projects.');
        noTokenError.code = 'NO_TOKEN';
        throw noTokenError;
      }

      const API_BASE = process.env.REACT_APP_API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
      const response = await fetch(`${API_BASE}/api/admin/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const body = await response.json();
          if (body?.error) {
            errorMessage = body.error;
          }
        } catch (parseError) {
          logger.error('projects-fetch-response-parse-failure', parseError);
        }
        const fetchError = new Error(errorMessage);
        fetchError.status = response.status;
        throw fetchError;
      }

      const data = await response.json();
      const normalized = Array.isArray(data?.projects)
        ? data.projects.map(normalizeProject)
        : [];

      setProjects(normalized);
      logger.interaction('fetch-success', 'projects-provider', {
        count: normalized.length,
      });
    } catch (fetchError) {
      setError(fetchError);
      logger.error('projects-fetch-failure', fetchError, {
        code: fetchError.code,
        status: fetchError.status,
      });
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProjects();
    }
  }, [fetchProjects]);

  const refresh = useCallback(() => {
    return fetchProjects();
  }, [fetchProjects]);

  const getProjectByIdentifier = useCallback((identifier) => {
    if (!identifier) {
      return null;
    }

    const normalizedIdentifier = identifier.toLowerCase();

    return projects.find((project) => {
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

      return candidates.some((value) => value === normalizedIdentifier || value.endsWith(`/${normalizedIdentifier}`));
    }) || null;
  }, [projects]);

  const syncProjects = useCallback((projectList) => {
    if (!Array.isArray(projectList)) {
      return;
    }

    const normalized = projectList.map(normalizeProject);
    setProjects(normalized);
    setError(null);
  }, []);

  const value = useMemo(() => ({
    projects,
    loading,
    error,
    refresh,
    getProjectByIdentifier,
    syncProjects,
  }), [projects, loading, error, refresh, getProjectByIdentifier, syncProjects]);

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  return useContext(ProjectsContext);
};

export const useProjectMetadata = (identifier) => {
  const { loading, error, getProjectByIdentifier } = useProjects();
  const project = useMemo(() => getProjectByIdentifier(identifier), [getProjectByIdentifier, identifier]);
  return { project, loading, error };
};

export default ProjectsContext;
