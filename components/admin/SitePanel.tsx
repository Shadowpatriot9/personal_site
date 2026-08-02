'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from './Toast';
import type { ContactLink, SiteContent } from '@/lib/siteContent';

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const isValidHref = (value: string) => /^(https?:\/\/|mailto:)/i.test(value);

/** A textarea that grows with its content so text edits feel like editing the page. */
const GrowingTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);
  return <textarea ref={ref} rows={1} {...props} />;
};

interface SitePanelProps {
  content: SiteContent | null;
  saving: boolean;
  onSave: (content: SiteContent) => Promise<void>;
}

/**
 * Edits the homepage content in place: the panel is a canvas laid out like
 * the homepage itself (same typography classes), and every piece of text is
 * an invisible field you click into and edit where it lives. A floating
 * Save bar appears once something has changed.
 */
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

  const revert = () => {
    setForm(content ? JSON.parse(JSON.stringify(content)) : null);
    setShowErrors(false);
  };

  const handleSave = async () => {
    if (!form) return;
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      toast('Fix the highlighted fields first', 'error');
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
      <div className="site-canvas" aria-busy="true">
        <div className="skeleton-row" />
        <div className="skeleton-row" />
        <div className="skeleton-row" />
      </div>
    );
  }

  const err = (key: string) => (showErrors ? errors[key] : undefined);
  const year = new Date().getFullYear();
  const derivedFooter = `© ${year} ${form.name.trim() || 'Grayden Scovil'}`;

  return (
    <section className="site-panel" aria-labelledby="site-panel-heading">
      <h2 id="site-panel-heading" className="sr-only">
        Edit site content
      </h2>

      <p className="site-canvas__lead">
        This is your homepage — click any text to edit it where it lives.
      </p>

      <div className="site-canvas">
        {/* Faux nav: read-only, follows the section headings live. */}
        <div className="site-canvas__nav" aria-hidden="true">
          <span className="site-canvas__nav-mark">GS</span>
          <span>{form.projectsHeading.trim() || 'Projects'}</span>
          <span>{form.contactHeading.trim() || 'Contact'}</span>
        </div>

        <div className="site-canvas__page">
          {/* Intro */}
          <div className="site-canvas__block">
            <label htmlFor="site-name" className="sr-only">
              Name
            </label>
            <input
              id="site-name"
              type="text"
              className={`intro-name inline-field${err('name') ? ' inline-field--error' : ''}`}
              value={form.name}
              onChange={set('name')}
              placeholder="Your name"
            />
            {err('name') && <span className="inline-error">{err('name')}</span>}

            <label htmlFor="site-tagline" className="sr-only">
              Summary
            </label>
            <GrowingTextarea
              id="site-tagline"
              className="intro-tagline inline-field"
              value={form.tagline}
              onChange={set('tagline')}
              placeholder="A sentence or two about what you do — leave empty to hide it"
            />

            <label htmlFor="site-note" className="sr-only">
              Note
            </label>
            <GrowingTextarea
              id="site-note"
              className="intro-note inline-field"
              value={form.note}
              onChange={set('note')}
              placeholder="An optional quieter line — leave empty to hide it"
            />
          </div>

          {/* Projects section */}
          <div className="site-canvas__block">
            <label htmlFor="site-projects-heading" className="sr-only">
              Projects section heading
            </label>
            <input
              id="site-projects-heading"
              type="text"
              className="section-header inline-field"
              value={form.projectsHeading}
              onChange={set('projectsHeading')}
              placeholder="Projects"
            />
            <div className="site-canvas__ghost">
              Your project cards render here — edit them in the Projects tab.
            </div>
          </div>

          {/* Contact section */}
          <div className="site-canvas__block">
            <label htmlFor="site-contact-heading" className="sr-only">
              Contact section heading
            </label>
            <input
              id="site-contact-heading"
              type="text"
              className="section-header inline-field"
              value={form.contactHeading}
              onChange={set('contactHeading')}
              placeholder="Contact"
            />

            <ul className="site-canvas__links">
              {form.contactLinks.map((link, index) => (
                <li className="site-canvas__link" key={index}>
                  <div className="site-canvas__link-fields">
                    <label htmlFor={`link-label-${index}`} className="sr-only">
                      Link {index + 1} label
                    </label>
                    <input
                      id={`link-label-${index}`}
                      type="text"
                      className={`inline-field site-canvas__link-label${err(`link-label-${index}`) ? ' inline-field--error' : ''}`}
                      value={link.label}
                      onChange={(event) => setLink(index, 'label', event.target.value)}
                      placeholder="Label"
                    />
                    <label htmlFor={`link-href-${index}`} className="sr-only">
                      Link {index + 1} URL
                    </label>
                    <input
                      id={`link-href-${index}`}
                      type="text"
                      className={`inline-field site-canvas__link-href${err(`link-href-${index}`) ? ' inline-field--error' : ''}`}
                      value={link.href}
                      onChange={(event) => setLink(index, 'href', event.target.value)}
                      placeholder="https://… or mailto:…"
                    />
                    {(err(`link-label-${index}`) || err(`link-href-${index}`)) && (
                      <span className="inline-error">
                        {err(`link-label-${index}`) || err(`link-href-${index}`)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="site-canvas__link-remove"
                    aria-label={`Remove link ${link.label || index + 1}`}
                    onClick={() => removeLink(index)}
                  >
                    <XIcon />
                  </button>
                </li>
              ))}
            </ul>

            <button type="button" className="site-canvas__add" onClick={addLink}>
              + Add a link
            </button>
          </div>

          {/* Footer */}
          <div className="site-canvas__block site-canvas__block--footer">
            <label htmlFor="site-footer" className="sr-only">
              Footer text
            </label>
            <input
              id="site-footer"
              type="text"
              className="inline-field site-canvas__footer-field"
              value={form.footer}
              onChange={set('footer')}
              placeholder={derivedFooter}
            />
            {!form.footer.trim() && (
              <span className="site-canvas__footer-hint">
                Left as is, the footer shows “{derivedFooter}” with the year kept current.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating save bar — appears only when something changed. */}
      <div className={`site-savebar${dirty ? ' is-visible' : ''}`} aria-hidden={!dirty}>
        <span className="site-savebar__note">Unsaved changes</span>
        <button
          type="button"
          className="ghost-btn btn-sm"
          onClick={revert}
          disabled={saving}
          tabIndex={dirty ? 0 : -1}
        >
          Revert
        </button>
        <button
          type="button"
          className="primary-btn btn-sm"
          onClick={handleSave}
          disabled={saving || !dirty}
          tabIndex={dirty ? 0 : -1}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </section>
  );
};

export default SitePanel;
