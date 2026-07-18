'use client';

import React, { useState } from 'react';
import apiClient from '@/lib/apiClient';

const defaultFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

interface ContactResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ContactForm = ({ className = '' }: { className?: string }) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<ContactResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResponse(null);

    try {
      const { data } = await apiClient.post('/api/contact', { body: formData });
      setResponse(data);
      setFormData(defaultFormData);
    } catch (networkError: any) {
      const errorMessage =
        networkError?.name === 'TimeoutError'
          ? 'The request timed out. Please try again in a moment.'
          : networkError?.data?.error ||
            networkError?.message ||
            'Network error. Please check your connection and try again.';
      setResponse({ success: false, error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => setShowForm((value) => !value);

  return (
    <div className={`contact-form ${className}`}>
      <ul className="contact-links">
        <li>
          <a href="mailto:gscovil9@gmail.com">gscovil9@gmail.com</a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/gscovil/" target="_blank" rel="noopener noreferrer">
            linkedin.com/in/gscovil
          </a>
        </li>
        <li>
          <a href="https://github.com/Shadowpatriot9" target="_blank" rel="noopener noreferrer">
            github.com/Shadowpatriot9
          </a>
        </li>
      </ul>

      <button
        type="button"
        onClick={toggleForm}
        className={`contact-cta${showForm ? ' is-open' : ''}`}
        aria-expanded={showForm}
      >
        {showForm ? 'Hide contact form' : 'Send a message'}
        <span className="contact-cta__chevron">
          <Chevron />
        </span>
      </button>

      {showForm && (
        <div className="contact-panel">
          <h3 className="contact-panel__title">Send me a message</h3>

          {response && (
            <div
              className={`contact-note ${response.success ? 'is-success' : 'is-error'}`}
              role="alert"
            >
              <strong>{response.success ? 'Message sent' : 'Something went wrong'}</strong>
              <span>{response.success ? response.message : response.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="contact-grid">
              <div className="contact-field">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </div>

            <div className="contact-actions">
              <button type="submit" className="contact-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send message'}
              </button>
              <button type="button" className="contact-cancel" onClick={toggleForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
