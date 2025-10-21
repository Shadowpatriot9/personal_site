import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/styles_admin.css';

const DEFAULT_PROJECT = {
  id: '',
  title: '',
  description: '',
  path: '',
  component: '',
  published: true,
  order: 0,
};

const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trimStart();

const ProjectForm = ({
  initialData = DEFAULT_PROJECT,
  mode = 'create',
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState(DEFAULT_PROJECT);

  useEffect(() => {
    setFormData({
      ...DEFAULT_PROJECT,
      ...initialData,
      published: typeof initialData.published === 'boolean' ? initialData.published : true,
      order: typeof initialData.order === 'number' ? initialData.order : 0,
    });
  }, [initialData]);

  const handleChange = (field) => (event) => {
    const { type, value, checked } = event.target;
    const isCheckbox = type === 'checkbox';
    const nextValue = isCheckbox ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [field]: !isCheckbox && typeof nextValue === 'string'
        ? normalizeWhitespace(nextValue)
        : nextValue,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...formData,
      id: formData.id.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      path: formData.path.trim(),
      component: formData.component.trim(),
      published: !!formData.published,
      order: Number.isFinite(formData.order) ? Number(formData.order) : 0,
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
          style={{
            backgroundColor: theme.cardBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: '4px',
            padding: '0.75rem',
            fontSize: '0.95rem',
          }}
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
            required
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
            required
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
