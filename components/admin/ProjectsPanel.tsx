'use client';

import React, { useMemo, useState } from 'react';
import { useToast } from './Toast';
import type { AdminProject } from './types';

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

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 7h14M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DragIcon = () => (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
    <circle cx="3" cy="3" r="1.4" />
    <circle cx="9" cy="3" r="1.4" />
    <circle cx="3" cy="8" r="1.4" />
    <circle cx="9" cy="8" r="1.4" />
    <circle cx="3" cy="13" r="1.4" />
    <circle cx="9" cy="13" r="1.4" />
  </svg>
);

interface ProjectsPanelProps {
  projects: AdminProject[];
  loading: boolean;
  onNew: () => void;
  onEditProject: (project: AdminProject) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onTogglePublish: (projectId: string, published: boolean) => Promise<void>;
  onReorder: (projects: AdminProject[]) => Promise<void>;
}

const VISIBILITY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
];

const ProjectsPanel = ({
  projects,
  loading,
  onNew,
  onEditProject,
  onDeleteProject,
  onTogglePublish,
  onReorder,
}: ProjectsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [publishFilter, setPublishFilter] = useState('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const errMessage = (error: unknown, fallback: string) =>
    (error as { data?: { error?: string }; message?: string })?.data?.error ||
    (error as { message?: string })?.message ||
    fallback;

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

  const isReorderDisabled = Boolean(searchTerm || publishFilter !== 'all' || sortBy !== 'order');

  const handleDelete = async (projectId: string) => {
    try {
      await onDeleteProject(projectId);
      toast('Project deleted');
    } catch (error) {
      toast(errMessage(error, 'Could not delete project'), 'error');
    } finally {
      setConfirmingDeleteId(null);
    }
  };

  const handleTogglePublish = async (projectId: string, next: boolean) => {
    try {
      await onTogglePublish(projectId, next);
      toast(next ? 'Project published' : 'Moved to drafts');
    } catch (error) {
      toast(errMessage(error, 'Could not update visibility'), 'error');
    }
  };

  // Keyboard-accessible reordering: move a project one slot up/down within the
  // full custom-ordered catalog (mirrors what drag-and-drop does with a mouse).
  const moveProject = async (projectId: string, direction: -1 | 1) => {
    if (isReorderDisabled) return;
    const ordered = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const index = ordered.findIndex((project) => project._id === projectId);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= ordered.length) return;

    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((project, i) => ({ ...project, order: i }));
    try {
      await onReorder(reordered);
    } catch (error) {
      toast(errMessage(error, 'Could not reorder projects'), 'error');
    }
  };

  const handleHandleKeyDown = (event: React.KeyboardEvent, projectId: string) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveProject(projectId, -1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveProject(projectId, 1);
    }
  };

  const handleDragStart = (event: React.DragEvent, projectId: string) => {
    if (isReorderDisabled) return;
    setDraggedId(projectId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', projectId);
  };

  const handleDragOver = (event: React.DragEvent, targetId: string) => {
    if (isReorderDisabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (targetId !== dropTargetId) setDropTargetId(targetId);
  };

  const handleDrop = (event: React.DragEvent, targetId: string) => {
    event.preventDefault();
    setDropTargetId(null);
    if (isReorderDisabled) return;

    const sourceId = draggedId || event.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;

    const reordered = reorderProjects(projects, sourceId, targetId);
    if (reordered) onReorder(reordered);
    setDraggedId(null);
  };

  return (
    <section className="projects-panel" aria-labelledby="projects-panel-heading">
      <h2 id="projects-panel-heading" className="sr-only">
        Manage projects
      </h2>

      <div className="projects-toolbar">
        <div className="toolbar-search">
          <SearchIcon />
          <label htmlFor="projects-search" className="sr-only">
            Search projects
          </label>
          <input
            id="projects-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search projects…"
          />
        </div>

        <div className="segmented" role="group" aria-label="Filter by visibility">
          {VISIBILITY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={publishFilter === filter.value}
              onClick={() => setPublishFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="toolbar-sort">
          <label htmlFor="projects-sort">Sort</label>
          <select
            id="projects-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="order">Custom order</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="newest">Last updated</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="toolbar-spacer" />

        <button type="button" className="primary-btn" onClick={onNew}>
          <PlusIcon />
          New project
        </button>
      </div>

      {isReorderDisabled && !loading && filteredProjects.length > 0 && (
        <div className="reorder-note" role="note">
          Clear search, filters, and set sort to “Custom order” to drag-reorder.
        </div>
      )}

      <div className="projects-list" role="list">
        {loading ? (
          <>
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            {projects.length === 0 ? (
              <>
                <strong>No projects yet</strong>
                Create your first project to populate the catalog.
              </>
            ) : (
              <>
                <strong>No matches</strong>
                No projects match the current search or filters.
              </>
            )}
          </div>
        ) : (
          filteredProjects.map((project) => {
            const projectId = project._id as string;
            const isConfirming = confirmingDeleteId === projectId;
            return (
              <article
                key={projectId}
                className={`project-row${draggedId === projectId ? ' is-dragging' : ''}${
                  dropTargetId === projectId ? ' is-drop-target' : ''
                }`}
                draggable={!isReorderDisabled}
                onDragStart={(event) => handleDragStart(event, projectId)}
                onDragOver={(event) => handleDragOver(event, projectId)}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDropTargetId(null);
                }}
                onDrop={(event) => handleDrop(event, projectId)}
                role="listitem"
                aria-label={`${project.title} management row`}
              >
                <button
                  type="button"
                  className="drag-handle"
                  aria-label={`Reorder ${project.title}. Use arrow up and down keys to move.`}
                  disabled={isReorderDisabled}
                  title={
                    isReorderDisabled
                      ? 'Reordering disabled while filtered'
                      : 'Drag, or focus and use ↑/↓ to reorder'
                  }
                  onKeyDown={(event) => handleHandleKeyDown(event, projectId)}
                >
                  <DragIcon />
                </button>

                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="row-thumb" src={project.image} alt="" />
                ) : (
                  <span
                    className={`row-status-dot${project.published ? ' is-published' : ''}`}
                    aria-hidden="true"
                  />
                )}

                <div className="row-main">
                  <div className="row-title-line">
                    <h3>{project.title}</h3>
                    <span className="row-slug">/projects/{project.id}</span>
                  </div>
                  <p className="row-desc">{project.description}</p>
                </div>

                <div className="row-meta">
                  <span className="chip">{project.category}</span>
                  <span className={`status-pill ${project.published ? 'published' : 'draft'}`}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {isConfirming ? (
                  <div className="row-confirm">
                    <span>Delete?</span>
                    <button
                      type="button"
                      className="ghost-btn btn-sm"
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="danger-btn is-solid btn-sm"
                      onClick={() => handleDelete(projectId)}
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="row-actions">
                    <button
                      type="button"
                      className="ghost-btn btn-sm"
                      onClick={() => handleTogglePublish(projectId, !project.published)}
                    >
                      {project.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Edit ${project.title}`}
                      title="Edit"
                      onClick={() => onEditProject(project)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      className="icon-btn is-danger"
                      aria-label={`Delete ${project.title}`}
                      title="Delete"
                      onClick={() => setConfirmingDeleteId(projectId)}
                    >
                      <TrashIcon />
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
