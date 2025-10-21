import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';
import apiClient from '../utils/apiClient';

const defaultFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
  useAI: true,
};

const ContactForm = ({ className = '' }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResponse(null);

    logger.interaction('submit', 'contact-form', {
      hasSubject: Boolean(formData.subject),
      messageLength: formData.message.length,
      aiRequested: formData.useAI,
    });

    try {
      const { data } = await apiClient.post('/api/contact', {
        body: formData,
      });

      setResponse(data);
      setFormData(defaultFormData);
      logger.interaction('success', 'contact-form', { aiResponseReceived: Boolean(data?.aiResponse) });
    } catch (networkError) {
      const errorMessage =
        networkError?.name === 'TimeoutError'
          ? 'The request timed out. Please try again in a moment.'
          : networkError?.data?.error || networkError?.message || 'Network error. Please check your connection and try again.';

      setResponse({
        success: false,
        error: errorMessage,
      });
      logger.interaction('error', 'contact-form', { error: errorMessage });
      logger.error('contact-form-network', networkError, { errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setShowForm((value) => !value);
    logger.interaction('toggle', 'contact-form', { expanded: !showForm });
  };

  return (
    <div className={`contact-form ${className}`}>
      <div className="contact-info">
        <p>
          Email:
          <a href="mailto:gscovil9@gmail.com" style={{ color: theme.primary }}>
            gscovil9@gmail.com
          </a>
        </p>
        <p>
          LinkedIn:
          <a
            href="https://www.linkedin.com/in/gscovil/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.primary }}
          >
            linkedin.com/in/gscovil
          </a>
        </p>
        <p>
          GitHub:
          <a
            href="https://github.com/Shadowpatriot9"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.primary }}
          >
            github.com/Shadowpatriot9
          </a>
        </p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          type="button"
          onClick={toggleForm}
          style={{
            background: theme.primary,
            color: theme.background,
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(event) => {
            event.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(event) => {
            event.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>📧</span>
          {showForm ? 'Hide Contact Form' : 'Send Message Directly'}
          <span style={{ transition: 'transform 0.3s ease', transform: showForm ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </button>
      </div>

      {showForm && (
        <div
          style={{
            marginTop: '20px',
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: `0 4px 12px ${theme.shadow}`,
          }}
        >
          <h3
            style={{
              color: theme.text,
              marginTop: 0,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>💬</span>
            Send me a message
          </h3>

          {response && (
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                background: response.success ? `${theme.success}20` : `${theme.danger}20`,
                border: `1px solid ${response.success ? theme.success : theme.danger}`,
                color: response.success ? theme.success : theme.danger,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                {response.success ? '✅ Message Sent!' : '❌ Error'}
              </div>
              <div style={{ fontSize: '14px' }}>
                {response.success ? response.message : response.error}
              </div>
              {response.aiResponse && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: theme.background,
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: theme.primary }}>🤖 AI Response:</div>
                  {response.aiResponse}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label
                  htmlFor="contact-name"
                  style={{ display: 'block', marginBottom: '6px', color: theme.text, fontSize: '14px', fontWeight: 500 }}
                >
                  Name *
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                    background: theme.background,
                    color: theme.text,
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  style={{ display: 'block', marginBottom: '6px', color: theme.text, fontSize: '14px', fontWeight: 500 }}
                >
                  Email *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                    background: theme.background,
                    color: theme.text,
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="contact-subject"
                style={{ display: 'block', marginBottom: '6px', color: theme.text, fontSize: '14px', fontWeight: 500 }}
              >
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  background: theme.background,
                  color: theme.text,
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="contact-message"
                style={{ display: 'block', marginBottom: '6px', color: theme.text, fontSize: '14px', fontWeight: 500 }}
              >
                Message *
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  background: theme.background,
                  color: theme.text,
                }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.text, fontSize: '14px' }}>
              <input
                type="checkbox"
                name="useAI"
                checked={formData.useAI}
                onChange={handleInputChange}
              />
              Ask the AI to draft a reply
            </label>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: theme.primary,
                  color: theme.background,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {isSubmitting ? 'Sending…' : 'Send message'}
              </button>
              <button
                type="button"
                onClick={toggleForm}
                style={{
                  background: 'transparent',
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

ContactForm.propTypes = {
  className: PropTypes.string,
};

export default ContactForm;
