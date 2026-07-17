'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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

type FieldKey = 'title' | 'id' | 'description' | 'link';

const STEPS = [
  { id: 'basics', label: 'Basics', hint: 'The essentials' },
  { id: 'details', label: 'Details', hint: 'Category & metadata' },
  { id: 'content', label: 'Content', hint: 'Write-up & visibility' },
] as const;

// Which fields are validated on each step (only required/format-checked ones).
const STEP_FIELDS: FieldKey[][] = [['title', 'id', 'description'], ['link'], []];

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
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // On edit the slug is fixed; on create it auto-follows the title until edited.
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm(toFormState(initialData));
  }, [initialData]);

  // Focus the first field whenever the step changes.
  useEffect(() => {
    const first = stepRef.current?.querySelector<HTMLElement>(
      'input:not([disabled]), select, textarea',
    );
    first?.focus();
  }, [step]);

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

  const setField =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = event.target as HTMLInputElement;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      id: mode === 'create' && !slugEdited ? slugify(title) : prev.id,
    }));
  };

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, id: event.target.value }));
  };

  const markTouched = (field: FieldKey) => setTouched((prev) => ({ ...prev, [field]: true }));

  const stepHasErrors = (index: number) => STEP_FIELDS[index].some((field) => errors[field]);

  const showError = (field: FieldKey) => (touched[field] ? errors[field] : undefined);

  const goNext = () => {
    const fields = STEP_FIELDS[step];
    if (stepHasErrors(step)) {
      setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }));
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goTo = (index: number) => {
    // Allow jumping back freely; jumping forward requires prior steps to be valid.
    if (index <= step) {
      setStep(index);
      return;
    }
    for (let i = step; i < index; i += 1) {
      if (stepHasErrors(i)) {
        setTouched((prev) => ({
          ...prev,
          ...Object.fromEntries(STEP_FIELDS[i].map((f) => [f, true])),
        }));
        setStep(i);
        return;
      }
    }
    setStep(index);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstBadStep = STEP_FIELDS.findIndex((fields) => fields.some((f) => errors[f]));
    if (firstBadStep !== -1) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(STEP_FIELDS[firstBadStep].map((f) => [f, true])),
      }));
      setStep(firstBadStep);
      return;
    }

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
  const isLastStep = step === STEPS.length - 1;

  return (
    <form onSubmit={handleSubmit} className="project-form" noValidate>
      {/* Progress stepper — doubles as navigation. */}
      <ol className="wizard-steps" aria-label="Progress">
        {STEPS.map((s, index) => {
          const state = index === step ? 'active' : index < step ? 'complete' : 'upcoming';
          return (
            <li key={s.id} className={`wizard-step is-${state}`}>
              <button
                type="button"
                className="wizard-step__btn"
                onClick={() => goTo(index)}
                aria-current={index === step ? 'step' : undefined}
              >
                <span className="wizard-step__dot">
                  {index < step ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 12.5l4 4 10-10"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="wizard-step__text">
                  <span className="wizard-step__label">{s.label}</span>
                  <span className="wizard-step__hint">{s.hint}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="wizard-panel" ref={stepRef}>
        {step === 0 && (
          <>
            <div className={`form-group${showError('title') ? ' has-error' : ''}`}>
              <label htmlFor={`${idBase}-title`}>Title</label>
              <input
                id={`${idBase}-title`}
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                onBlur={() => markTouched('title')}
                placeholder="Project name"
                aria-invalid={Boolean(showError('title'))}
              />
              {showError('title') && <span className="field-error">{showError('title')}</span>}
            </div>

            <div className={`form-group${showError('id') ? ' has-error' : ''}`}>
              <label htmlFor={`${idBase}-id`}>URL slug</label>
              <div className="input-affix">
                <span className="input-affix__prefix">/projects/</span>
                <input
                  id={`${idBase}-id`}
                  type="text"
                  value={form.id}
                  onChange={handleSlugChange}
                  onBlur={() => markTouched('id')}
                  placeholder="my-project"
                  disabled={mode === 'edit'}
                  aria-invalid={Boolean(showError('id'))}
                />
              </div>
              {showError('id') ? (
                <span className="field-error">{showError('id')}</span>
              ) : (
                <span className="field-hint">
                  {mode === 'edit'
                    ? 'The slug is fixed once a project is created.'
                    : 'Auto-filled from the title — edit it if you like.'}
                </span>
              )}
            </div>

            <div className={`form-group${showError('description') ? ' has-error' : ''}`}>
              <label htmlFor={`${idBase}-description`}>Description</label>
              <input
                id={`${idBase}-description`}
                type="text"
                value={form.description}
                onChange={setField('description')}
                onBlur={() => markTouched('description')}
                placeholder="One-line summary shown on the card"
                aria-invalid={Boolean(showError('description'))}
              />
              {showError('description') && (
                <span className="field-error">{showError('description')}</span>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`${idBase}-category`}>Category</label>
                <select id={`${idBase}-category`} value={form.category} onChange={setField('category')}>
                  {PROJECT_CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor={`${idBase}-status`}>Status</label>
                <select id={`${idBase}-status`} value={form.status} onChange={setField('status')}>
                  {PROJECT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={`${idBase}-tech`}>Technology</label>
              <input
                id={`${idBase}-tech`}
                type="text"
                value={form.technology}
                onChange={setField('technology')}
                placeholder="Next.js, TypeScript, …"
              />
              <span className="field-hint">Comma-separated · shown as chips on the card (first 3)</span>
            </div>

            <div className="form-group">
              <label htmlFor={`${idBase}-tags`}>Tags</label>
              <input
                id={`${idBase}-tags`}
                type="text"
                value={form.tags}
                onChange={setField('tags')}
                placeholder="homelab, networking, …"
              />
              <span className="field-hint">Comma-separated · used for search</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`${idBase}-date`}>Date</label>
                <input
                  id={`${idBase}-date`}
                  type="date"
                  value={form.dateCreated}
                  onChange={setField('dateCreated')}
                />
              </div>
              <div className={`form-group${showError('link') ? ' has-error' : ''}`}>
                <label htmlFor={`${idBase}-link`}>External link</label>
                <input
                  id={`${idBase}-link`}
                  type="url"
                  value={form.link}
                  onChange={setField('link')}
                  onBlur={() => markTouched('link')}
                  placeholder="https://github.com/…"
                  aria-invalid={Boolean(showError('link'))}
                />
                {showError('link') && <span className="field-error">{showError('link')}</span>}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label htmlFor={`${idBase}-body`}>Details</label>
              <textarea
                id={`${idBase}-body`}
                value={form.body}
                onChange={setField('body')}
                rows={7}
                placeholder="Longer write-up shown on the project's page. Blank lines separate paragraphs; use ## for headings and - for bullets."
              />
              <span className="field-hint">Optional · supports simple Markdown</span>
            </div>

            <label className="publish-toggle">
              <span className="publish-toggle__text">
                <span className="publish-toggle__title">Published</span>
                <span className="publish-toggle__sub">
                  {form.published ? 'Visible on the live site' : 'Hidden — saved as a draft'}
                </span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={form.published}
                onChange={setField('published')}
              />
              <span className="switch" aria-hidden="true" />
            </label>

            {mode === 'edit' && (
              <div className="form-group">
                <label htmlFor={`${idBase}-order`}>Display order</label>
                <input
                  id={`${idBase}-order`}
                  type="number"
                  value={form.order}
                  onChange={setField('order')}
                  min={0}
                />
                <span className="field-hint">Lower numbers appear first. Drag rows to reorder too.</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="wizard-actions">
        {step > 0 ? (
          <button type="button" className="ghost-btn" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        ) : (
          onCancel && (
            <button type="button" className="ghost-btn" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
          )
        )}

        <span className="wizard-actions__count">
          Step {step + 1} of {STEPS.length}
        </span>

        {isLastStep ? (
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create project'}
          </button>
        ) : (
          <button type="button" className="primary-btn" onClick={goNext}>
            Continue
          </button>
        )}
      </div>
    </form>
  );
};

export default ProjectForm;
