'use client';

import '../styles/admin.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import ProjectsPanel from '@/components/admin/ProjectsPanel';
import { ProjectCard } from '@/components/ProjectGrid';
import type { AdminProject } from '@/components/admin/ProjectForm';
import logger from '@/lib/logger';
import apiClient from '@/lib/apiClient';
import type { Project } from '@/lib/projects';

const STORAGE_KEY = 'adminToken';

const mapProjectOrder = (projects: AdminProject[]): AdminProject[] =>
  projects.map((project, index) => ({
    ...project,
    order: typeof project.order === 'number' ? project.order : index,
  }));

const AdminPage = () => {
  const { theme } = useTheme();
  const [token, setToken] = useState('');
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate token from storage after mount (avoids SSR mismatch).
  useEffect(() => {
    setToken(window.localStorage.getItem(STORAGE_KEY) || '');
    setReady(true);
  }, []);

  const isAuthenticated = Boolean(token);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token],
  );

  const fetchProjects = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get('/api/admin/projects', {
          headers: authHeaders,
          signal,
        });
        setProjects(mapProjectOrder(data.projects || []));
      } catch (fetchError: any) {
        if (fetchError?.name === 'AbortError') return;
        logger.error('admin-projects-fetch', fetchError);
        // A 401 means the stored token expired — drop it.
        if (fetchError?.status === 401) {
          setToken('');
          window.localStorage.removeItem(STORAGE_KEY);
        }
        setError(fetchError);
      } finally {
        setLoading(false);
      }
    },
    [authHeaders, token],
  );

  useEffect(() => {
    if (token) {
      const controller = new AbortController();
      fetchProjects(controller.signal);
      return () => controller.abort();
    }
    return undefined;
  }, [token, fetchProjects]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = form.get('username');
    const password = form.get('password');

    setIsAuthenticating(true);
    setLoginError(null);

    try {
      const { data } = await apiClient.post('/api/admin/login', {
        body: { username, password },
      });
      setToken(data.token);
      window.localStorage.setItem(STORAGE_KEY, data.token);
      logger.interaction('admin-login', 'admin-portal', { username });
    } catch (authError: any) {
      const errorMessage = authError?.data?.error || authError?.message || 'Unable to sign in';
      setLoginError(errorMessage);
      logger.error('admin-login-failed', authError, { errorMessage });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setProjects([]);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const handleCreateProject = useCallback(
    async (payload: AdminProject) => {
      await apiClient.post('/api/admin/projects', { headers: authHeaders, body: payload });
      await fetchProjects();
    },
    [authHeaders, fetchProjects],
  );

  const handleUpdateProject = useCallback(
    async (projectId: string, payload: AdminProject) => {
      await apiClient.put(`/api/admin/projects/${projectId}`, {
        headers: authHeaders,
        body: payload,
      });
      await fetchProjects();
    },
    [authHeaders, fetchProjects],
  );

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      await apiClient.delete(`/api/admin/projects/${projectId}`, { headers: authHeaders });
      await fetchProjects();
    },
    [authHeaders, fetchProjects],
  );

  const handleTogglePublish = useCallback(
    async (projectId: string, published: boolean) => {
      await handleUpdateProject(projectId, { published } as unknown as AdminProject);
    },
    [handleUpdateProject],
  );

  const handleReorderProjects = useCallback(
    async (orderedProjects: AdminProject[]) => {
      const payload = orderedProjects.map((project, index) => ({ _id: project._id, order: index }));
      await apiClient.patch('/api/admin/projects', { headers: authHeaders, body: payload });
      setProjects(mapProjectOrder(orderedProjects));
    },
    [authHeaders],
  );

  const previewProjects = useMemo(() => projects.slice(0, 3), [projects]);

  // Avoid a flash of the login form before storage hydration.
  if (!ready) {
    return <div className="admin-login" style={{ background: theme.background }} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <h1>Admin Access</h1>
          <p>Sign in with your admin credentials to manage the project catalog.</p>
          <form onSubmit={handleLogin}>
            <label>
              Username
              <input name="username" type="text" required autoComplete="username" />
            </label>
            <label>
              Password
              <input name="password" type="password" required autoComplete="current-password" />
            </label>
            {loginError && (
              <div className="admin-error" role="alert">
                {loginError}
              </div>
            )}
            <button type="submit" className="primary-btn" disabled={isAuthenticating}>
              {isAuthenticating ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <Link href="/" className="admin-back-link">
            ← Return to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <Link href="/" className="admin-home-link">
            ← Back to site
          </Link>
          <h1>Admin Dashboard</h1>
          <div className="admin-header-actions">
            <ThemeSwitcher />
            <button type="button" onClick={handleLogout} className="ghost-btn">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-section">
          <h2>Quick Overview</h2>
          {projects.length === 0 ? (
            <p>No projects available yet. Create your first project below.</p>
          ) : (
            <div className="admin-preview-grid">
              {previewProjects.map((project) => (
                <ProjectCard
                  key={project._id || project.id}
                  project={project as unknown as Project}
                  previewMode
                />
              ))}
            </div>
          )}
        </section>

        <section className="admin-section">
          <h2>Manage catalog</h2>
          {error && (
            <div className="admin-error" role="alert">
              {error.message}
            </div>
          )}
          <ProjectsPanel
            projects={projects}
            loading={loading}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onTogglePublish={handleTogglePublish}
            onReorder={handleReorderProjects}
          />
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
