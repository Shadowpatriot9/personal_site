'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import logger from '@/lib/logger';
import apiClient from '@/lib/apiClient';
import { fallbackProjects, normalizeProject, type Project } from '@/lib/projects';

interface ProjectsContextValue {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void> | void;
  getProjectByIdentifier: (identifier: string) => Project | null;
  syncProjects: (projectList: unknown[]) => void;
}

const fallbackNormalizedProjects = fallbackProjects
  .map(normalizeProject)
  .filter((project): project is Project => project !== null);

const ProjectsContext = createContext<ProjectsContextValue>({
  projects: [],
  loading: true,
  error: null,
  refresh: async () => {},
  getProjectByIdentifier: () => null,
  syncProjects: () => {},
});

export const ProjectsProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(fallbackNormalizedProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      const receivedProjects: Project[] = Array.isArray(payload?.projects)
        ? payload.projects
            .map(normalizeProject)
            .filter((project: Project | null): project is Project => project !== null)
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
    } catch (fetchError: any) {
      if (fetchError?.name === 'AbortError') {
        return;
      }

      if (fetchError?.name === 'TimeoutError') {
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
    (identifier: string) => {
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
          ]
            .filter((value): value is string => Boolean(value))
            .map((value) => value.toLowerCase());

          return candidates.some(
            (value) => value === normalizedIdentifier || value.endsWith(`/${normalizedIdentifier}`),
          );
        }) || null
      );
    },
    [projects],
  );

  const syncProjects = useCallback((projectList: unknown[]) => {
    if (!Array.isArray(projectList)) {
      return;
    }

    const normalized = projectList
      .map(normalizeProject)
      .filter((project): project is Project => project !== null);
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

export const useProjectMetadata = (identifier: string) => {
  const { loading, error, getProjectByIdentifier } = useProjects();
  const project = useMemo(
    () => getProjectByIdentifier(identifier),
    [getProjectByIdentifier, identifier],
  );
  return { project, loading, error };
};

export default ProjectsContext;
