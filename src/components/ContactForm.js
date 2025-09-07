import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

const ContactForm = ({ className = '' }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    useAI: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponse(null);

    logger.interaction('submit', 'contact-form', {
      hasSubject: !!formData.subject,
      messageLength: formData.message.length,
      aiRequested: formData.useAI
    });

    try {
      console.log('📧 Submitting contact form...');
      
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ Contact form submitted successfully');
        setResponse(data);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          useAI: true
        });
        logger.interaction('success', 'contact-form', { aiResponseReceived: !!data.aiResponse });
      } else {
        console.error('❌ Contact form error:', data);
        setResponse({ 
          success: false, 
          error: data.error || 'Something went wrong' 
        });
        logger.interaction('error', 'contact-form', { error: data.error });
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setResponse({ 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      });
      logger.error('contact-form-network', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    logger.interaction('toggle', 'contact-form', { expanded: !showForm });
  };

  return (
    <div className={`contact-form ${className}`}>
      {/* Traditional Contact Info */}
      <div className="contact-info">
        <p> Email: <a href="mailto:gscovil9@gmail.com" style={{ color: theme.primary }}>gscovil9@gmail.com</a> </p>
        <p> LinkedIn: <a href="https://www.linkedin.com/in/gscovil/" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}> linkedin.com/in/gscovil </a></p>
        <p> GitHub: <a href="https://github.com/Shadowpatriot9" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}> github.com/Shadowpatriot9 </a></p>
      </div>

      {/* Interactive Form Toggle */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={toggleForm}
          style={{
            background: theme.primary,
            color: theme.background,
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <span>📧</span>
          {showForm ? 'Hide Contact Form' : 'Send Message Directly'}
          <span style={{ 
            transition: 'transform 0.3s ease',
            transform: showForm ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </button>
      </div>

      {/* Interactive Contact Form */}
      {showForm && (
        <div style={{
          marginTop: '20px',
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: `0 4px 12px ${theme.shadow}`,
        }}>
          <h3 style={{ 
            color: theme.text, 
            marginTop: '0', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>💬</span>
            Send me a message
          </h3>

          {/* Response Display */}
          {response && (
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              background: response.success ? theme.success + '20' : theme.danger + '20',
              border: `1px solid ${response.success ? theme.success : theme.danger}`,
              color: response.success ? theme.success : theme.danger,
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                {response.success ? '✅ Message Sent!' : '❌ Error'}
              </div>
              <div style={{ fontSize: '14px' }}>
                {response.success ? response.message : response.error}
              </div>
              
              {response.aiResponse && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: theme.background,
                  borderRadius: '6px',
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: theme.primary }}>
                    🤖 AI Response:
                  </div>
                  <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                    {response.aiResponse}
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name and Email Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '500' 
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '500' 
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: theme.text,
                fontSize: '14px',
                fontWeight: '500' 
              }}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="What's this about?"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: theme.background,
                  color: theme.text,
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = theme.primary}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: theme.text,
                fontSize: '14px',
                fontWeight: '500' 
              }}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Tell me what's on your mind..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: theme.background,
                  color: theme.text,
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  resize: 'vertical',
                  minHeight: '100px',
                }}
                onFocus={(e) => e.target.style.borderColor = theme.primary}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            </div>

            {/* AI Response Checkbox */}
            <div style={{ 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <input
                type="checkbox"
                name="useAI"
                id="useAI"
                checked={formData.useAI}
                onChange={handleInputChange}
                style={{ marginRight: '4px' }}
              />
              <label htmlFor="useAI" style={{ 
                color: theme.textSecondary,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>🤖</span>
                Get an instant AI response while you wait for my personal reply
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? theme.textSecondary : theme.primary,
                color: theme.background,
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? (
                <>
                  <span>⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
