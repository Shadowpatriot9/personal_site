'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from './Toast';
import type { ContactLink, SiteContent } from '@/lib/siteContent';

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const isValidHref = (value: string) => /^(https?:\/\/|mailto:)/i.test(value);

interface SitePanelProps {
  content: SiteContent | null;
  saving: boolean;
  onSave: (content: SiteContent) => Promise<void>;
}

/** Edits the homepage introduction and contact links. */
const SitePanel = ({ content, saving, onSave }: SitePanelProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState<SiteContent | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  // Sync the working copy whenever fresh content arrives (initial load, save).
  useEffect(() => {
    setForm(content ? JSON.parse(JSON.stringify(content)) : null);
    setShowErrors(false);
  }, [content]);

  const dirty = Boolean(form && content && JSON.stringify(form) !== JSON.stringify(content));

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!form) return next;
    if (!form.name.trim()) next.name = 'A name is required';
    form.contactLinks.forEach((link, index) => {
      const label = link.label.trim();
      const href = link.href.trim();
      if (!label && !href) return; // Fully empty rows are dropped on save.
      if (!label) next[`link-label-${index}`] = 'Add a label';
      if (!href) next[`link-href-${index}`] = 'Add a URL';
      else if (!isValidHref(href)) next[`link-href-${index}`] = 'Use https://… or mailto:…';
    });
    return next;
  }, [form]);

  const set = (
    field: 'name' | 'tagline' | 'note' | 'projectsHeading' | 'contactHeading' | 'footer',
  ) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => (prev ? { ...prev, [field]: event.target.value } : prev));

  const setLink = (index: number, field: keyof ContactLink, value: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      const contactLinks = prev.contactLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link,
      );
      return { ...prev, contactLinks };
    });

  const addLink = () =>
    setForm((prev) =>
      prev ? { ...prev, contactLinks: [...prev.contactLinks, { label: '', href: '' }] } : prev,
    );

  const removeLink = (index: number) =>
    setForm((prev) =>
      prev
        ? { ...prev, contactLinks: prev.contactLinks.filter((_, i) => i !== index) }
        : prev,
    );

  const handleSave = async () => {
    if (!form) return;
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    const cleaned: SiteContent = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      note: form.note.trim(),
      projectsHeading: form.projectsHeading.trim(),
      contactHeading: form.contactHeading.trim(),
      footer: form.footer.trim(),
      contactLinks: form.contactLinks
        .map((link) => ({ label: link.label.trim(), href: link.href.trim() }))
        .filter((link) => link.label && link.href),
    };
    try {
      await onSave(cleaned);
      toast('Site content saved');
    } catch (error) {
      const message =
        (error as { data?: { error?: string } })?.data?.error ||
        (error as { message?: string })?.message ||
        'Could not save site content';
      toast(message, 'error');
    }
  };

  if (!form) {
    return (
      <div className="site-card" aria-busy="true">
        <div className="skeleton-row" />
        <div className="skeleton-row" />
        <div className="skeleton-row" />
      </div>
    );
  }

  const err = (key: string) => (showErrors ? errors[key] : undefined);

  return (
    <section className="site-panel" aria-labelledby="site-panel-heading">
      <h2 id="site-panel-heading" className="sr-only">
        Edit site content
      </h2>

      <div className="site-card">
        <section className="site-card__section">
          <div className="editor-section__head">
            <h2>Introduction</h2>
            <p>The name and summary at the top of the homepage.</p>
          </div>
          <div className="editor-section__fields">
            <div className={`form-group${err('name') ? ' has-error' : ''}`}>
              <label htmlFor="site-name">Name</label>
              <input id="site-name" type="text" value={form.name} onChange={set('name')} />
              {err('name') && <span className="field-error">{err('name')}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="site-tagline">Summary</label>
              <textarea
                id="site-tagline"
                rows={3}
                value={form.tagline}
                onChange={set('tagline')}
                placeholder="A sentence or two about what you do"
              />
              <span className="field-hint">Shown under your name. Leave empty to hide it.</span>
            </div>

            <div className="form-group">
              <label htmlFor="site-note">Note</label>
              <textarea
                id="site-note"
                rows={2}
                value={form.note}
                onChange={set('note')}
                placeholder="An optional quieter line under the summary"
              />
              <span className="field-hint">Leave empty to hide it.</span>
            </div>
          </div>
        </section>

        <section className="site-card__section">
          <div className="editor-section__head">
            <h2>Sections</h2>
            <p>Headings for the two homepage sections — the nav links use them too.</p>
          </div>
          <div className="editor-section__fields">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="site-projects-heading">Projects section</label>
                <input
                  id="site-projects-heading"
                  type="text"
                  value={form.projectsHeading}
                  onChange={set('projectsHeading')}
                  placeholder="Projects"
                />
              </div>
              <div className="form-group">
                <label htmlFor="site-contact-heading">Contact section</label>
                <input
                  id="site-contact-heading"
                  type="text"
                  value={form.contactHeading}
                  onChange={set('contactHeading')}
                  placeholder="Contact"
                />
              </div>
            </div>
            <span className="field-hint">Left empty, they fall back to “Projects” and “Contact”.</span>
          </div>
        </section>

        <section className="site-card__section">
          <div className="editor-section__head">
            <h2>Contact links</h2>
            <p>Listed in the Contact section, in this order.</p>
          </div>
          <div className="editor-section__fields">
            {form.contactLinks.map((link, index) => (
              <div className="link-row" key={index}>
                <div className={`form-group link-row__label${err(`link-label-${index}`) ? ' has-error' : ''}`}>
                  <label htmlFor={`link-label-${index}`} className="sr-only">
                    Link {index + 1} label
                  </label>
                  <input
                    id={`link-label-${index}`}
                    type="text"
                    value={link.label}
                    onChange={(event) => setLink(index, 'label', event.target.value)}
                    placeholder="Label"
                  />
                  {err(`link-label-${index}`) && (
                    <span className="field-error">{err(`link-label-${index}`)}</span>
                  )}
                </div>
                <div className={`form-group link-row__href${err(`link-href-${index}`) ? ' has-error' : ''}`}>
                  <label htmlFor={`link-href-${index}`} className="sr-only">
                    Link {index + 1} URL
                  </label>
                  <input
                    id={`link-href-${index}`}
                    type="text"
                    value={link.href}
                    onChange={(event) => setLink(index, 'href', event.target.value)}
                    placeholder="https://… or mailto:…"
                  />
                  {err(`link-href-${index}`) && (
                    <span className="field-error">{err(`link-href-${index}`)}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="link-row__remove"
                  aria-label={`Remove link ${link.label || index + 1}`}
                  onClick={() => removeLink(index)}
                >
                  <XIcon />
                </button>
              </div>
            ))}

            <button type="button" className="ghost-btn btn-sm site-card__add" onClick={addLink}>
              Add link
            </button>
          </div>
        </section>

        <section className="site-card__section">
          <div className="editor-section__head">
            <h2>Footer</h2>
            <p>The line in the bottom-left corner of every page.</p>
          </div>
          <div className="editor-section__fields">
            <div className="form-group">
              <label htmlFor="site-footer" className="sr-only">
                Footer text
              </label>
              <input
                id="site-footer"
                type="text"
                value={form.footer}
                onChange={set('footer')}
                placeholder={`© ${new Date().getFullYear()} ${form.name.trim() || 'Grayden Scovil'}`}
              />
              <span className="field-hint">
                Left empty, it shows “© {new Date().getFullYear()}{' '}
                {form.name.trim() || 'Grayden Scovil'}” with the year kept current.
              </span>
            </div>
          </div>
        </section>

        <div className="site-card__footer">
          {dirty && <span className="site-card__dirty">Unsaved changes</span>}
          <button
            type="button"
            className="primary-btn"
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SitePanel;
