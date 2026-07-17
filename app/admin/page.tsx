'use client';

import '../styles/admin.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import ProjectsPanel from '@/components/admin/ProjectsPanel';
import ProjectEditor from '@/components/admin/ProjectEditor';
import { ToastProvider, useToast } from '@/components/admin/Toast';
import AdminLogin from '@/components/admin/AdminLogin';
import type { AdminProject } from '@/components/admin/types';
import logger from '@/lib/logger';
import apiClient from '@/lib/apiClient';

const STORAGE_KEY = 'adminToken';

const mapProjectOrder = (projects: AdminProject[]): AdminProject[] =>
  projects.map((project, index) => ({
    ...project,
    order: typeof project.order === 'number' ? project.order : index,
  }));

const errMessage = (error: unknown, fallback: string) =>
  (error as { data?: { error?: string } })?.data?.error ||
  (error as { message?: string })?.message ||
  fallback;

type EditorState = { mode: 'create' } | { mode: 'edit'; project: AdminProject } | null;

interface WorkspaceProps {
  projects: AdminProject[];
  loading: boolean;
  error: Error | null;
  token: string;
  onLogout: () => void;
  onCreate: (payload: AdminProject) => Promise<void>;
  onUpdate: (projectId: string, payload: AdminProject) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  onTogglePublish: (projectId: string, published: boolean) => Promise<void>;
  onReorder: (projects: AdminProject[]) => Promise<void>;
}

/** Authenticated admin UI. Lives inside ToastProvider so it can raise toasts. */
const AdminWorkspace = ({
  projects,
  loading,
  error,
  token,
  onLogout,
  onCreate,
  onUpdate,
  onDelete,
  onTogglePublish,
  onReorder,
}: WorkspaceProps) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState<EditorState>(null);
  const [isSaving, setIsSaving] = useState(false);

  const stats = useMemo(() => {
    const total = projects.length;
    const published = projects.filter((project) => project.published).length;
    const categories = new Set(projects.map((project) => project.category).filter(Boolean)).size;
    return { total, published, drafts: total - published, categories };
  }, [projects]);

  const handleSave = async (payload: Record<string, unknown>) => {
    if (!editing) return;
    setIsSaving(true);
    try {
      if (editing.mode === 'edit') {
        await onUpdate(editing.project._id as string, payload as AdminProject);
        toast('Changes saved');
      } else {
        await onCreate({ ...payload, order: projects.length } as AdminProject);
        toast('Project created');
      }
      setEditing(null);
    } catch (err) {
      toast(errMessage(err, 'Could not save project'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (editing) {
    return (
      <ProjectEditor
        mode={editing.mode}
        initialData={editing.mode === 'edit' ? editing.project : undefined}
        token={token}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={() => !isSaving && setEditing(null)}
      />
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__inner">
          <div className="admin-topbar__brand">
            <Link href="/" className="admin-topbar__mark" aria-label="Home">
              GS
            </Link>
            <span className="admin-topbar__divider" aria-hidden="true">
              /
            </span>
            <span className="admin-topbar__title">Admin</span>
          </div>
          <div className="admin-topbar__actions">
            <Link href="/" className="admin-viewsite-link">
              View site ↗
            </Link>
            <ThemeSwitcher />
            <button type="button" onClick={onLogout} className="ghost-btn btn-sm">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-page-head">
          <h1>Projects</h1>
          <p>Create, edit, reorder, and publish the entries in your portfolio catalog.</p>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-card__value">{stats.total}</span>
            <span className="stat-card__label">
              <span className="stat-card__dot" />
              Total projects
            </span>
          </div>
          <div className="stat-card stat-card--success">
            <span className="stat-card__value">{stats.published}</span>
            <span className="stat-card__label">
              <span className="stat-card__dot" />
              Published
            </span>
          </div>
          <div className="stat-card stat-card--muted">
            <span className="stat-card__value">{stats.drafts}</span>
            <span className="stat-card__label">
              <span className="stat-card__dot" />
              Drafts
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">{stats.categories}</span>
            <span className="stat-card__label">
              <span className="stat-card__dot" />
              Categories
            </span>
          </div>
        </div>

        {error && (
          <div className="admin-banner admin-banner--error" role="alert">
            {error.message}
          </div>
        )}

        <ProjectsPanel
          projects={projects}
          loading={loading}
          onNew={() => setEditing({ mode: 'create' })}
          onEditProject={(project) => setEditing({ mode: 'edit', project })}
          onDeleteProject={onDelete}
          onTogglePublish={onTogglePublish}
          onReorder={onReorder}
        />
      </main>
    </div>
  );
};

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

  const handleLogin = async (username: string, password: string) => {
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

  // Avoid a flash of the login form before storage hydration.
  if (!ready) {
    return <div className="admin-login" style={{ background: theme.background }} />;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} error={loginError} isSubmitting={isAuthenticating} />;
  }

  return (
    <ToastProvider>
      <AdminWorkspace
        projects={projects}
        loading={loading}
        error={error}
        token={token}
        onLogout={handleLogout}
        onCreate={handleCreateProject}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
        onTogglePublish={handleTogglePublish}
        onReorder={handleReorderProjects}
      />
    </ToastProvider>
  );
};

export default AdminPage;
