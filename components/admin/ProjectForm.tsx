'use client';

import React, { useEffect, useState } from 'react';

export interface AdminProject {
  _id?: string;
  id: string;
  title: string;
  description: string;
  path: string;
  component: string;
  published: boolean;
  order: number;
  [key: string]: unknown;
}

const DEFAULT_PROJECT: AdminProject = {
  id: '',
  title: '',
  description: '',
  path: '',
  component: '',
  published: true,
  order: 0,
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trimStart();

interface ProjectFormProps {
  initialData?: Partial<AdminProject>;
  mode?: 'create' | 'edit';
  submitLabel?: string;
  onSubmit: (payload: AdminProject) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const ProjectForm = ({
  initialData = DEFAULT_PROJECT,
  mode = 'create',
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProjectFormProps) => {
  const [formData, setFormData] = useState<AdminProject>(DEFAULT_PROJECT);

  useEffect(() => {
    setFormData({
      ...DEFAULT_PROJECT,
      ...initialData,
      published:
        typeof initialData.published === 'boolean' ? initialData.published : true,
      order: typeof initialData.order === 'number' ? initialData.order : 0,
    });
  }, [initialData]);

  const handleChange =
    (field: keyof AdminProject) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = event.target as HTMLInputElement;
      const isCheckbox = target.type === 'checkbox';
      const nextValue = isCheckbox ? target.checked : target.value;
      setFormData((prev) => ({
        ...prev,
        [field]:
          !isCheckbox && typeof nextValue === 'string'
            ? normalizeWhitespace(nextValue)
            : nextValue,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: AdminProject = {
      ...formData,
      id: formData.id.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      path: formData.path.trim(),
      component: formData.component.trim(),
      published: !!formData.published,
      order: Number.isFinite(Number(formData.order)) ? Number(formData.order) : 0,
    };

    onSubmit?.(payload);
  };

  const submitButtonLabel = submitLabel || (mode === 'edit' ? 'Save Changes' : 'Add Project');

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${mode}-project-id`}>ID</label>
          <input
            id={`${mode}-project-id`}
            type="text"
            value={formData.id}
            onChange={handleChange('id')}
            required
            placeholder="e.g., s9"
            disabled={mode === 'edit'}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${mode}-project-title`}>Title</label>
          <input
            id={`${mode}-project-title`}
            type="text"
            value={formData.title}
            onChange={handleChange('title')}
            required
            placeholder="Project name"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`${mode}-project-description`}>Description</label>
        <textarea
          id={`${mode}-project-description`}
          value={formData.description}
          onChange={handleChange('description')}
          required
          rows={mode === 'edit' ? 3 : 2}
          placeholder="Short summary of the project"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${mode}-project-path`}>Path</label>
          <input
            id={`${mode}-project-path`}
            type="text"
            value={formData.path}
            onChange={handleChange('path')}
            placeholder="/projects/example"
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${mode}-project-component`}>Component</label>
          <input
            id={`${mode}-project-component`}
            type="text"
            value={formData.component}
            onChange={handleChange('component')}
            placeholder="Component file name"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={handleChange('published')}
            />
            <span>Published</span>
          </label>
        </div>
        {mode === 'edit' && (
          <div className="form-group">
            <label htmlFor={`${mode}-project-order`}>Display Order</label>
            <input
              id={`${mode}-project-order`}
              type="number"
              value={formData.order}
              onChange={handleChange('order')}
              min={0}
            />
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitButtonLabel}
        </button>
        {mode === 'edit' && (
          <button type="button" onClick={onCancel} className="ghost-btn">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProjectForm;
