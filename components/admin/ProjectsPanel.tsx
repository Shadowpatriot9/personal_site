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
  onTogglePublish,
  onReorder,
}: ProjectsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [publishFilter, setPublishFilter] = useState('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
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
            placeholder="Search projects"
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

        <label htmlFor="projects-sort" className="sr-only">
          Sort projects
        </label>
        <select
          id="projects-sort"
          className="toolbar-sort"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="order">Custom order</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="newest">Last updated</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {isReorderDisabled && !loading && filteredProjects.length > 0 && (
        <p className="reorder-note" role="note">
          Clear search and filters, and sort by “Custom order”, to reorder.
        </p>
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
                <p>Your portfolio catalog is empty.</p>
                <button type="button" className="ghost-btn" onClick={onNew}>
                  New project
                </button>
              </>
            ) : (
              <>
                <strong>No matches</strong>
                <p>No projects match the current search or filters.</p>
              </>
            )}
          </div>
        ) : (
          filteredProjects.map((project) => {
            const projectId = project._id as string;
            return (
              <article
                key={projectId}
                className={`project-row${project.published ? '' : ' is-draft'}${
                  draggedId === projectId ? ' is-dragging' : ''
                }${dropTargetId === projectId ? ' is-drop-target' : ''}`}
                draggable={!isReorderDisabled}
                onDragStart={(event) => handleDragStart(event, projectId)}
                onDragOver={(event) => handleDragOver(event, projectId)}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDropTargetId(null);
                }}
                onDrop={(event) => handleDrop(event, projectId)}
                role="listitem"
              >
                <button
                  type="button"
                  className="drag-handle"
                  aria-label={`Reorder ${project.title}. Use arrow up and down keys to move.`}
                  disabled={isReorderDisabled}
                  title={
                    isReorderDisabled
                      ? 'Reordering is off while filtered'
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
                  <span className="row-tile" aria-hidden="true">
                    {(project.title || '?').charAt(0)}
                  </span>
                )}

                <div className="row-main">
                  {/* Stretched button: the whole row opens the editor. */}
                  <button
                    type="button"
                    className="row-open"
                    aria-label={`Edit ${project.title}`}
                    onClick={() => onEditProject(project)}
                  >
                    <span className="row-title">{project.title}</span>
                    <span className="row-slug">/projects/{project.id}</span>
                  </button>
                  <p className="row-desc">{project.description}</p>
                </div>

                <div className="row-side">
                  <span className="row-cat">{project.category}</span>
                  {!project.published && <span className="row-draft">Draft</span>}
                  <label className="row-switch" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={Boolean(project.published)}
                      onChange={() => handleTogglePublish(projectId, !project.published)}
                      aria-label={`Publish ${project.title}`}
                    />
                    <span className="switch" aria-hidden="true" />
                  </label>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ProjectsPanel;
