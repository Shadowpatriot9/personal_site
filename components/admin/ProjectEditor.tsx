'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PROJECT_CATEGORY_OPTIONS, PROJECT_STATUS_OPTIONS, type Project } from '@/lib/projects';
import { ProjectCard } from '@/components/ProjectGrid';
import MediaInput from './MediaInput';
import ImageCropper from './ImageCropper';
import { uploadImage, checkUploadsEnabled } from './uploadImage';
import type { AdminProject } from './types';

interface FormState {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  technology: string;
  tags: string;
  dateCreated: string;
  link: string;
  body: string;
  image: string;
  gallery: string[];
  published: boolean;
  order: number;
}

const toDateInput = (value: string | null | undefined): string => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const toFormState = (data: Partial<AdminProject> = {}): FormState => ({
  id: data.id ?? '',
  title: data.title ?? '',
  description: data.description ?? '',
  category: data.category ?? PROJECT_CATEGORY_OPTIONS[0],
  status: data.status ?? PROJECT_STATUS_OPTIONS[0],
  technology: Array.isArray(data.technology) ? data.technology.join(', ') : '',
  tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
  dateCreated: toDateInput(data.dateCreated),
  link: data.link ?? '',
  body: data.body ?? '',
  image: data.image ?? '',
  gallery: Array.isArray(data.gallery) ? data.gallery : [],
  published: typeof data.published === 'boolean' ? data.published : true,
  order: typeof data.order === 'number' ? data.order : 0,
});

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Light markdown for the page preview — mirrors the real project page renderer.
const renderBody = (body: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;
  const flushPara = () => {
    if (para.length) {
      out.push(<p key={key++}>{para.join(' ')}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(
        <ul key={key++}>
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
    } else if (line.startsWith('## ')) {
      flushPara();
      flushList();
      out.push(
        <h3 key={key++} className="preview-page__h">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith('- ')) {
      flushPara();
      list.push(line.slice(2));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return out;
};

type FieldKey = 'title' | 'id' | 'description' | 'link';

interface ProjectEditorProps {
  mode: 'create' | 'edit';
  initialData?: AdminProject;
  token: string;
  isSaving?: boolean;
  onSave: (payload: Record<string, unknown>) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>;
}

const ProjectEditor = ({
  mode,
  initialData,
  token,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: ProjectEditorProps) => {
  const initial = useRef(toFormState(initialData));
  const [form, setForm] = useState<FormState>(initial.current);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const [previewTab, setPreviewTab] = useState<'card' | 'page'>('card');
  const [uploadsEnabled, setUploadsEnabled] = useState(true);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [previewDragging, setPreviewDragging] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let active = true;
    checkUploadsEnabled(token).then((enabled) => active && setUploadsEnabled(enabled));
    return () => {
      active = false;
    };
  }, [token]);

  const handleCropConfirm = async (blob: Blob) => {
    setCoverError(null);
    setCoverUploading(true);
    try {
      const uploadedUrl = await uploadImage(blob, token);
      setForm((prev) => ({ ...prev, image: uploadedUrl }));
      setCropFile(null);
    } catch (err) {
      setCoverError((err as Error).message);
    } finally {
      setCoverUploading(false);
    }
  };

  const errors = useMemo(() => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.id.trim()) next.id = 'A URL slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.id))
      next.id = 'Use lowercase letters, numbers, and hyphens only';
    if (!form.description.trim()) next.description = 'A short description is required';
    if (form.link.trim() && !isValidUrl(form.link)) next.link = 'Enter a valid URL (https://…)';
    return next;
  }, [form.title, form.id, form.description, form.link]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial.current);

  const set =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = event.target as HTMLInputElement;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const onTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      id: mode === 'create' && !slugEdited ? slugify(title) : prev.id,
    }));
  };

  const showErr = (field: FieldKey) => (touched[field] ? errors[field] : undefined);

  const handleSave = () => {
    if (Object.keys(errors).length > 0) {
      setTouched({ title: true, id: true, description: true, link: true });
      const firstBad = (['title', 'id', 'description', 'link'] as FieldKey[]).find((f) => errors[f]);
      if (firstBad) document.getElementById(`editor-${firstBad}`)?.focus();
      return;
    }
    onSave({
      id: form.id.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      status: form.status,
      technology: form.technology,
      tags: form.tags,
      dateCreated: form.dateCreated || null,
      link: form.link.trim(),
      body: form.body.trim(),
      image: form.image.trim(),
      gallery: form.gallery,
      published: form.published,
      order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
    });
  };

  const previewProject: Project = {
    id: form.id || 'preview',
    title: form.title || 'Untitled project',
    description: form.description || 'Your project description will appear here.',
    category: form.category,
    status: form.status,
    technology: splitList(form.technology),
    tags: splitList(form.tags),
    image: form.image,
    gallery: form.gallery,
    route: `/projects/${form.id || 'preview'}`,
    dateCreated: form.dateCreated || null,
    link: form.link || undefined,
    body: form.body || undefined,
  };

  const previewMeta = [form.status, form.category, form.dateCreated
    ? new Date(form.dateCreated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null,
  ].filter(Boolean) as string[];
  const previewTech = splitList(form.technology);

  return (
    <div className="editor">
      <header className="editor__bar">
        <div className="editor__bar-side">
          <button type="button" className="editor__back" onClick={onCancel} aria-label="Back to projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <nav className="editor__crumb" aria-label="Breadcrumb">
            <span className="editor__crumb-root">
              Projects<span className="editor__crumb-sep"> / </span>
            </span>
            <span className="editor__crumb-current">
              {mode === 'edit' ? form.title || 'Untitled' : 'New project'}
            </span>
          </nav>
        </div>
        <div className="editor__bar-side">
          <span className={`editor__status${form.published ? ' is-live' : ''}`}>
            <span className="editor__status-dot" />
            {form.published ? 'Published' : 'Draft'}
          </span>
          {dirty && <span className="editor__dirty">Unsaved</span>}
          <button
            type="button"
            className="ghost-btn btn-sm editor__cancel"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button type="button" className="primary-btn btn-sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : mode === 'edit' ? 'Save' : 'Create'}
          </button>
        </div>
      </header>

      <div className="editor__body">
        <div className="editor__form">
          {/* Overview */}
          <section className="editor-section">
            <div className="editor-section__head">
              <h2>Overview</h2>
              <p>What this project is, and where it lives.</p>
            </div>
            <div className="editor-section__fields">
              <div className={`form-group${showErr('title') ? ' has-error' : ''}`}>
                <label htmlFor="editor-title">Title</label>
                <input
                  id="editor-title"
                  className="editor-title-input"
                  type="text"
                  value={form.title}
                  onChange={onTitle}
                  onBlur={() => setTouched((p) => ({ ...p, title: true }))}
                  placeholder="Project name"
                />
                {showErr('title') && <span className="field-error">{showErr('title')}</span>}
              </div>

              <div className={`form-group${showErr('id') ? ' has-error' : ''}`}>
                <label htmlFor="editor-id">URL slug</label>
                <div className="input-affix">
                  <span className="input-affix__prefix">/projects/</span>
                  <input
                    id="editor-id"
                    type="text"
                    value={form.id}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setForm((p) => ({ ...p, id: e.target.value }));
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, id: true }))}
                    placeholder="my-project"
                    disabled={mode === 'edit'}
                  />
                </div>
                {showErr('id') ? (
                  <span className="field-error">{showErr('id')}</span>
                ) : (
                  <span className="field-hint">
                    {mode === 'edit'
                      ? 'The slug is fixed once a project is created.'
                      : 'Auto-filled from the title — edit it if you like.'}
                  </span>
                )}
              </div>

              <div className={`form-group${showErr('description') ? ' has-error' : ''}`}>
                <label htmlFor="editor-description">Description</label>
                <input
                  id="editor-description"
                  type="text"
                  value={form.description}
                  onChange={set('description')}
                  onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                  placeholder="One-line summary shown on the card"
                />
                {showErr('description') && (
                  <span className="field-error">{showErr('description')}</span>
                )}
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="editor-section">
            <div className="editor-section__head">
              <h2>Media</h2>
              <p>A cover image and an optional gallery for the project page.</p>
            </div>
            <div className="editor-section__fields">
              <MediaInput
                cover={form.image}
                gallery={form.gallery}
                token={token}
                uploadsEnabled={uploadsEnabled}
                onCoverChange={(url) => setForm((p) => ({ ...p, image: url }))}
                onCoverFile={(file) => {
                  setCoverError(null);
                  setCropFile(file);
                }}
                onGalleryChange={(urls) => setForm((p) => ({ ...p, gallery: urls }))}
              />
            </div>
          </section>

          {/* Details */}
          <section className="editor-section">
            <div className="editor-section__head">
              <h2>Details</h2>
              <p>Classification and metadata.</p>
            </div>
            <div className="editor-section__fields">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="editor-category">Category</label>
                  <select id="editor-category" value={form.category} onChange={set('category')}>
                    {PROJECT_CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="editor-status">Status</label>
                  <select id="editor-status" value={form.status} onChange={set('status')}>
                    {PROJECT_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="editor-tech">Technology</label>
                <input
                  id="editor-tech"
                  type="text"
                  value={form.technology}
                  onChange={set('technology')}
                  placeholder="Next.js, TypeScript, …"
                />
                <span className="field-hint">Comma-separated · shown as chips (first 3 on the card)</span>
              </div>

              <div className="form-group">
                <label htmlFor="editor-tags">Tags</label>
                <input
                  id="editor-tags"
                  type="text"
                  value={form.tags}
                  onChange={set('tags')}
                  placeholder="homelab, networking, …"
                />
                <span className="field-hint">Comma-separated · used for search</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="editor-date">Date</label>
                  <input id="editor-date" type="date" value={form.dateCreated} onChange={set('dateCreated')} />
                </div>
                <div className={`form-group${showErr('link') ? ' has-error' : ''}`}>
                  <label htmlFor="editor-link">External link</label>
                  <input
                    id="editor-link"
                    type="url"
                    value={form.link}
                    onChange={set('link')}
                    onBlur={() => setTouched((p) => ({ ...p, link: true }))}
                    placeholder="https://github.com/…"
                  />
                  {showErr('link') && <span className="field-error">{showErr('link')}</span>}
                </div>
              </div>
            </div>
          </section>

          {/* Write-up */}
          <section className="editor-section">
            <div className="editor-section__head">
              <h2>Write-up</h2>
              <p>The long-form story shown on the project page.</p>
            </div>
            <div className="editor-section__fields">
              <div className="form-group">
                <label htmlFor="editor-body">Details</label>
                <textarea
                  id="editor-body"
                  value={form.body}
                  onChange={set('body')}
                  rows={10}
                  placeholder="Blank lines separate paragraphs. Use ## for headings and - for bullet lists."
                />
                <span className="field-hint">Supports simple Markdown</span>
              </div>
            </div>
          </section>

          {/* Visibility */}
          <section className="editor-section">
            <div className="editor-section__head">
              <h2>Visibility</h2>
              <p>Control whether this shows on the live site.</p>
            </div>
            <div className="editor-section__fields">
              <label className="publish-toggle">
                <span className="publish-toggle__text">
                  <span className="publish-toggle__title">Published</span>
                  <span className="publish-toggle__sub">
                    {form.published ? 'Visible on the live site' : 'Hidden — saved as a draft'}
                  </span>
                </span>
                <input type="checkbox" role="switch" checked={form.published} onChange={set('published')} />
                <span className="switch" aria-hidden="true" />
              </label>

              {mode === 'edit' && (
                <div className="form-group">
                  <label htmlFor="editor-order">Display order</label>
                  <input id="editor-order" type="number" value={form.order} onChange={set('order')} min={0} />
                  <span className="field-hint">Lower numbers appear first. Drag rows to reorder too.</span>
                </div>
              )}
            </div>
          </section>

          {/* Delete — deliberate, tucked at the end rather than on every list row */}
          {mode === 'edit' && onDelete && (
            <section className="editor-section editor-section--danger">
              <div className="editor-section__head">
                <h2>Delete project</h2>
                <p>Removes it from the site and the catalog. This can’t be undone.</p>
              </div>
              <div className="editor-section__fields">
                {confirmingDelete ? (
                  <div className="editor-danger__confirm">
                    <span>Delete “{form.title || 'this project'}”?</span>
                    <button
                      type="button"
                      className="ghost-btn btn-sm"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={isDeleting}
                    >
                      Keep
                    </button>
                    <button
                      type="button"
                      className="danger-btn is-solid btn-sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="danger-btn editor-danger__trigger"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    Delete project…
                  </button>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Live preview */}
        <aside className="editor__preview">
          <div className="editor__preview-head">
            <span className="editor__preview-title">Live preview</span>
            <div className="preview-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={previewTab === 'card'}
                className={previewTab === 'card' ? 'is-active' : ''}
                onClick={() => setPreviewTab('card')}
              >
                Card
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={previewTab === 'page'}
                className={previewTab === 'page' ? 'is-active' : ''}
                onClick={() => setPreviewTab('page')}
              >
                Page
              </button>
            </div>
          </div>

          <div
            className={`editor__preview-canvas${previewDragging ? ' is-dropping' : ''}`}
            onDragOver={(e) => {
              if (!uploadsEnabled) return;
              e.preventDefault();
              setPreviewDragging(true);
            }}
            onDragLeave={() => setPreviewDragging(false)}
            onDrop={(e) => {
              if (!uploadsEnabled) return;
              e.preventDefault();
              setPreviewDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                setCoverError(null);
                setCropFile(file);
              }
            }}
          >
            {previewDragging && uploadsEnabled && (
              <div className="editor__preview-drop" aria-hidden="true">
                Drop image to set cover
              </div>
            )}
            {previewTab === 'card' ? (
              <div className="preview-card-wrap">
                <ProjectCard project={previewProject} previewMode />
              </div>
            ) : (
              <div className="preview-page">
                {form.image && (
                  <div className="preview-page__cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="" />
                  </div>
                )}
                <h1 className="preview-page__title">{previewProject.title}</h1>
                <p className="preview-page__desc">{previewProject.description}</p>
                {previewMeta.length > 0 && (
                  <p className="preview-page__meta">{previewMeta.join('  ·  ')}</p>
                )}
                {previewTech.length > 0 && (
                  <div className="preview-page__tags">
                    {previewTech.map((t) => (
                      <span key={t} className="preview-page__tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {form.body.trim() ? (
                  <div className="preview-page__body">{renderBody(form.body)}</div>
                ) : (
                  <p className="preview-page__muted">More details coming soon.</p>
                )}
                {form.gallery.length > 0 && (
                  <div className="preview-page__gallery">
                    {form.gallery.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={`${src}-${i}`} src={src} alt={`Gallery ${i + 1}`} />
                    ))}
                  </div>
                )}
                {form.link && <span className="preview-page__link">Visit project ↗</span>}
              </div>
            )}
          </div>
        </aside>
      </div>

      {cropFile && (
        <ImageCropper
          file={cropFile}
          busy={coverUploading}
          error={coverError}
          onCancel={() => {
            if (!coverUploading) {
              setCropFile(null);
              setCoverError(null);
            }
          }}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
};

export default ProjectEditor;
