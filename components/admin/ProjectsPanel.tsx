'use client';

import React, { useMemo, useState } from 'react';
import ProjectForm, { type AdminProject } from './ProjectForm';

const reorderProjects = (
  projects: AdminProject[],
  draggedId: string,
  targetId: string,
): AdminProject[] | null => {
  const updated = [...projects];
  const fromIndex = updated.findIndex((project) => project._id === draggedId);
  const toIndex = updated.findIndex((project) => project._id === targetId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return null;
  }

  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);

  return updated.map((project, index) => ({ ...project, order: index }));
};

interface ProjectsPanelProps {
  projects: AdminProject[];
  loading: boolean;
  onCreateProject: (project: AdminProject) => Promise<void>;
  onUpdateProject: (projectId: string, project: AdminProject) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onTogglePublish: (projectId: string, published: boolean) => Promise<void>;
  onReorder: (projects: AdminProject[]) => Promise<void>;
}

const ProjectsPanel = ({
  projects,
  loading,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onTogglePublish,
  onReorder,
}: ProjectsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [publishFilter, setPublishFilter] = useState('all');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);

  const filteredProjects = useMemo(() => {
    let next = [...projects];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      next = next.filter((project) =>
        [project.title, project.description, project.id, project.category, ...(project.tags || [])]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(lower)),
      );
    }

    if (publishFilter !== 'all') {
      const shouldShowPublished = publishFilter === 'published';
      next = next.filter((project) => project.published === shouldShowPublished);
    }

    next.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'newest':
          return (
            new Date((b.updatedAt as string) || (b.createdAt as string) || 0).getTime() -
            new Date((a.updatedAt as string) || (a.createdAt as string) || 0).getTime()
          );
        case 'oldest':
          return (
            new Date((a.updatedAt as string) || (a.createdAt as string) || 0).getTime() -
            new Date((b.updatedAt as string) || (b.createdAt as string) || 0).getTime()
          );
        case 'order':
        default:
          return (a.order ?? 0) - (b.order ?? 0);
      }
    });

    return next;
  }, [projects, publishFilter, searchTerm, sortBy]);

  const isReorderDisabled = Boolean(searchTerm || publishFilter !== 'all');

  const activeEditingProject =
    editingProjectId && filteredProjects.find((project) => project._id === editingProjectId);

  const handleCreate = async (project: Record<string, unknown>) => {
    const order = projects.length;
    await onCreateProject({ ...project, order } as AdminProject);
    setCreateFormKey((value) => value + 1);
  };

  const handleEditSubmit = async (project: Record<string, unknown>) => {
    if (!activeEditingProject) {
      return;
    }
    await onUpdateProject(activeEditingProject._id as string, project as AdminProject);
    setEditingProjectId(null);
  };

  const handleDragStart = (event: React.DragEvent, projectId: string) => {
    if (isReorderDisabled) return;
    setDraggedId(projectId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', projectId);
  };

  const handleDragOver = (event: React.DragEvent) => {
    if (isReorderDisabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent, targetId: string) => {
    event.preventDefault();
    if (isReorderDisabled) return;

    const sourceId = draggedId || event.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;

    const reordered = reorderProjects(projects, sourceId, targetId);
    if (reordered) {
      onReorder(reordered);
    }
    setDraggedId(null);
  };

  return (
    <section className="projects-panel" aria-labelledby="projects-panel-heading">
      <div className="panel-header">
        <h2 id="projects-panel-heading">Projects</h2>
        <p className="panel-subtitle">
          Manage catalog entries, toggle visibility, and adjust display order.
        </p>
      </div>

      <div className="projects-toolbar">
        <div className="toolbar-search">
          <label htmlFor="projects-search" className="sr-only">
            Search projects
          </label>
          <input
            id="projects-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, description, or route"
          />
        </div>
        <div className="toolbar-controls">
          <label className="toolbar-label">
            Sort
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="order">Custom order</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="newest">Last updated</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <label className="toolbar-label">
            Visibility
            <select
              value={publishFilter}
              onChange={(event) => setPublishFilter(event.target.value)}
            >
              <option value="all">All</option>
              <option value="published">Published only</option>
              <option value="draft">Unpublished only</option>
            </select>
          </label>
        </div>
      </div>

      <div className="create-panel">
        <h3>Add new project</h3>
        <ProjectForm key={createFormKey} mode="create" onSubmit={handleCreate} />
      </div>

      {isReorderDisabled && (
        <div className="reorder-note" role="note">
          Disable filters to reorder the full catalog.
        </div>
      )}

      <div className="projects-list" role="list">
        {loading ? (
          <div className="empty-state">Loading projects…</div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">No projects match the current filters.</div>
        ) : (
          filteredProjects.map((project) => {
            const isEditing = editingProjectId === project._id;
            return (
              <article
                key={project._id}
                className={`project-row ${isEditing ? 'editing' : ''}`}
                draggable={!isReorderDisabled}
                onDragStart={(event) => handleDragStart(event, project._id as string)}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, project._id as string)}
                role="listitem"
                aria-label={`${project.title} management row`}
              >
                <div className="row-header">
                  <button
                    type="button"
                    className="drag-handle"
                    aria-label="Drag to reorder"
                    disabled={isReorderDisabled}
                  >
                    ☰
                  </button>
                  <div className="row-title">
                    <h3>{project.title}</h3>
                    <p className="row-meta">
                      <span>/projects/{project.id}</span>
                      <span>{project.category}</span>
                      <span>{project.status}</span>
                    </p>
                  </div>
                  <span
                    className={`status-pill ${project.published ? 'published' : 'draft'}`}
                    aria-label={project.published ? 'Published project' : 'Unpublished project'}
                  >
                    {project.published ? 'Published' : 'Unpublished'}
                  </span>
                </div>

                <p className="row-description">{project.description}</p>

                {isEditing ? (
                  <ProjectForm
                    key={project._id}
                    mode="edit"
                    initialData={project}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingProjectId(null)}
                  />
                ) : (
                  <div className="row-actions">
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => setEditingProjectId(project._id as string)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => onTogglePublish(project._id as string, !project.published)}
                    >
                      {project.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => onDeleteProject(project._id as string)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ProjectsPanel;
