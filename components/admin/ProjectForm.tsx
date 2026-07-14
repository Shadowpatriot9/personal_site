'use client';

import React, { useEffect, useState } from 'react';
import { PROJECT_CATEGORY_OPTIONS, PROJECT_STATUS_OPTIONS } from '@/lib/projects';

export interface AdminProject {
  _id?: string;
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  technology: string[];
  tags: string[];
  dateCreated: string | null;
  link: string;
  body: string;
  published: boolean;
  order: number;
  route?: string;
  [key: string]: unknown;
}

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
  published: typeof data.published === 'boolean' ? data.published : true,
  order: typeof data.order === 'number' ? data.order : 0,
});

interface ProjectFormProps {
  initialData?: Partial<AdminProject>;
  mode?: 'create' | 'edit';
  onSubmit: (payload: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const ProjectForm = ({
  initialData,
  mode = 'create',
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProjectFormProps) => {
  const [form, setForm] = useState<FormState>(() => toFormState(initialData));

  useEffect(() => {
    setForm(toFormState(initialData));
  }, [initialData]);

  const set =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = event.target as HTMLInputElement;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
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
      published: form.published,
      order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
    });
  };

  const idBase = `${mode}-${initialData?._id ?? 'new'}`;

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${idBase}-id`}>ID / URL slug</label>
          <input
            id={`${idBase}-id`}
            type="text"
            value={form.id}
            onChange={set('id')}
            required
            placeholder="e.g. my-project"
            disabled={mode === 'edit'}
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens"
          />
          <span className="field-hint">Lives at /projects/{form.id || 'slug'}</span>
        </div>
        <div className="form-group">
          <label htmlFor={`${idBase}-title`}>Title</label>
          <input
            id={`${idBase}-title`}
            type="text"
            value={form.title}
            onChange={set('title')}
            required
            placeholder="Project name"
            autoFocus
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`${idBase}-description`}>Description</label>
        <input
          id={`${idBase}-description`}
          type="text"
          value={form.description}
          onChange={set('description')}
          required
          placeholder="One-line summary shown on the card"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${idBase}-category`}>Category</label>
          <select id={`${idBase}-category`} value={form.category} onChange={set('category')}>
            {PROJECT_CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={`${idBase}-status`}>Status</label>
          <select id={`${idBase}-status`} value={form.status} onChange={set('status')}>
            {PROJECT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${idBase}-tech`}>Technology</label>
          <input
            id={`${idBase}-tech`}
            type="text"
            value={form.technology}
            onChange={set('technology')}
            placeholder="Comma-separated, e.g. Next.js, TypeScript"
          />
          <span className="field-hint">Shown as chips on the card (first 3)</span>
        </div>
        <div className="form-group">
          <label htmlFor={`${idBase}-date`}>Date</label>
          <input
            id={`${idBase}-date`}
            type="date"
            value={form.dateCreated}
            onChange={set('dateCreated')}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`${idBase}-tags`}>Tags</label>
        <input
          id={`${idBase}-tags`}
          type="text"
          value={form.tags}
          onChange={set('tags')}
          placeholder="Comma-separated, used for search"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`${idBase}-link`}>External link (optional)</label>
        <input
          id={`${idBase}-link`}
          type="url"
          value={form.link}
          onChange={set('link')}
          placeholder="https://github.com/…"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`${idBase}-body`}>Details (optional)</label>
        <textarea
          id={`${idBase}-body`}
          value={form.body}
          onChange={set('body')}
          rows={5}
          placeholder="Longer write-up shown on the project's page. Blank lines separate paragraphs."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" checked={form.published} onChange={set('published')} />
            <span>Published (visible on the site)</span>
          </label>
        </div>
        {mode === 'edit' && (
          <div className="form-group">
            <label htmlFor={`${idBase}-order`}>Display order</label>
            <input
              id={`${idBase}-order`}
              type="number"
              value={form.order}
              onChange={set('order')}
              min={0}
            />
          </div>
        )}
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="ghost-btn" disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="primary-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
