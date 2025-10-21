import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { ProjectCatalogProvider } from './contexts/ProjectCatalogContext';
import ProjectsPanel from './components/admin/ProjectsPanel';
import ProjectForm from './components/admin/ProjectForm';
import { ProjectCard } from './components/ProjectGrid';
import ThemeSwitcher from './components/ThemeSwitcher';
import logger from './utils/logger';
import apiClient from './utils/apiClient';

import './styles/styles_admin.css';

const STORAGE_KEY = 'adminToken';

const mapProjectOrder = (projects) =>
  projects.map((project, index) => ({
    ...project,
    order: typeof project.order === 'number' ? project.order : index,
  }));

const Admin = () => {
  const { theme } = useTheme();
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return window.localStorage.getItem(STORAGE_KEY) || '';
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isAuthenticated = Boolean(token);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const fetchProjects = useCallback(
    async (signal) => {
      if (!token) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get('/api/admin/projects', {
          headers: authHeaders,
          signal,
        });
        setProjects(mapProjectOrder(data.projects || []));
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          return;
        }
        if (fetchError.name === 'TimeoutError') {
          logger.error('admin-projects-timeout', fetchError);
        } else {
          logger.error('admin-projects-fetch', fetchError);
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

  const handleLogin = async (event) => {
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
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, data.token);
      }
      logger.interaction('admin-login', 'admin-portal', { username });
    } catch (authError) {
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
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleCreateProject = useCallback(
    async (payload) => {
      await apiClient.post('/api/admin/projects', {
        headers: authHeaders,
        body: payload,
      });
      await fetchProjects();
    },
    [authHeaders, fetchProjects],
  );

  const handleUpdateProject = useCallback(
    async (projectId, payload) => {
      await apiClient.put(`/api/admin/projects/${projectId}`, {
        headers: authHeaders,
        body: payload,
      });
      await fetchProjects();
    },
    [authHeaders, fetchProjects],
  );

  const handleDeleteProject = useCallback(
    async (projectId) => {
      await apiClient.delete(`/api/admin/projects/${projectId}`, {
        headers: authHeaders,
      });
      await fetchProjects();
    },
    [authHeaders, fetchProjects],
  );

  const handleTogglePublish = useCallback(
    async (projectId, published) => {
      await handleUpdateProject(projectId, { published });
    },
    [handleUpdateProject],
  );

  const handleReorderProjects = useCallback(
    async (orderedProjects) => {
      const payload = orderedProjects.map((project, index) => ({ _id: project._id, order: index }));
      await apiClient.patch('/api/admin/projects', {
        headers: authHeaders,
        body: payload,
      });
      setProjects(mapProjectOrder(orderedProjects));
    },
    [authHeaders],
  );

  const previewProjects = useMemo(() => projects.slice(0, 3), [projects]);

  if (!isAuthenticated) {
    return (
      <div className="admin-login" style={{ background: theme.background, color: theme.text }}>
        <div className="admin-login-card" style={{ border: `1px solid ${theme.border}`, boxShadow: `0 4px 16px ${theme.shadow}` }}>
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
            {loginError && <div className="admin-error" role="alert">{loginError}</div>}
            <button type="submit" disabled={isAuthenticating}>
              {isAuthenticating ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <Link to="/" className="admin-back-link">
            ← Return to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{ background: theme.background, color: theme.text }}>
      <header className="admin-header" style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}` }}>
        <div className="admin-header-content">
          <Link to="/" className="admin-home-link">
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
                <ProjectCard key={project._id || project.id} project={project} previewMode />
              ))}
            </div>
          )}
        </section>

        <section className="admin-section">
          <h2>Add a project</h2>
          <ProjectForm mode="create" onSubmit={handleCreateProject} isSubmitting={loading} />
        </section>

        <section className="admin-section">
          <h2>Manage catalog</h2>
          {error && (
            <div className="admin-error" role="alert">
              {error.message}
            </div>
          )}
          <ProjectCatalogProvider value={{ projects, loading }}>
            <ProjectsPanel
              onCreateProject={handleCreateProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onTogglePublish={handleTogglePublish}
              onReorder={handleReorderProjects}
            />
          </ProjectCatalogProvider>
        </section>
      </main>
    </div>
  );
};

export default Admin;
