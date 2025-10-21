import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PerformanceMonitor from './components/PerformanceMonitor';
import { useTheme } from './contexts/ThemeContext';
import styles from './styles/styles_admin.css';
import { ProjectCard } from './components/ProjectGrid';

const FEATURE_FLAGS = {
  devAuthBypass: process.env.REACT_APP_ENABLE_DEV_AUTH_BYPASS === 'true',
  showMfaPrompt: process.env.REACT_APP_SHOW_ADMIN_MFA_PROMPT === 'true',
  showPasswordRotationReminder: process.env.REACT_APP_SHOW_PASSWORD_ROTATION_REMINDER === 'true',
};

const DEFAULT_REAUTH_THRESHOLD_MS = 4 * 60 * 60 * 1000;
const REAUTH_THRESHOLD_MS = (() => {
  const parsed = parseInt(process.env.REACT_APP_ADMIN_REAUTH_THRESHOLD_MS || '', 10);
  return Number.isNaN(parsed) ? DEFAULT_REAUTH_THRESHOLD_MS : parsed;
})();
const REAUTH_THRESHOLD_MINUTES = Math.round(REAUTH_THRESHOLD_MS / 60000);

const DEV_CREDENTIALS = {
  username: 'shadowpatriot9',
  password: '16196823',
};

function Admin() {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [token, setToken] = useState('');
  const [authTimestamp, setAuthTimestamp] = useState(null);
  const [lastAuthUsername, setLastAuthUsername] = useState('');
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [reauthCredentials, setReauthCredentials] = useState({ username: '', password: '' });
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [reauthError, setReauthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    id: '',
    title: '',
    description: '',
    path: '',
    component: '',
    published: false,
  });
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const clientIsDevelopment =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    process.env.NODE_ENV === 'development';

  const isDevelopmentSession = () =>
    clientIsDevelopment || token === 'dev-token';

  const securityNotices = useMemo(() => {
    const notices = [];
    if (FEATURE_FLAGS.showMfaPrompt) {
      notices.push('Multi-factor authentication is enabled. Have your secondary factor ready before continuing.');
    }
    if (FEATURE_FLAGS.showPasswordRotationReminder) {
      notices.push('Reminder: Rotate the admin password regularly and confirm compliance with the security schedule.');
    }
    return notices;
  }, []);

  const previewProject = useMemo(() => ({
    id: newProject.id || 'pending-id',
    title: newProject.title || 'Untitled Project',
    description: newProject.description || 'Project description will appear here.',
    route: newProject.path || '#',
    path: newProject.path || '',
    component: newProject.component || '',
    status: newProject.published ? 'Published' : 'Draft',
    category: 'Preview',
    technology: [],
    dateCreated: new Date().toISOString(),
    published: newProject.published,
  }), [newProject]);

  // Check if user is already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    const savedToken = localStorage.getItem('adminToken');
    const savedAuthTimestamp = localStorage.getItem('adminAuthenticatedAt');
    const savedUsername = localStorage.getItem('adminLastUsername');

    if (authStatus === 'true' && savedToken) {
      console.log('🔄 Restoring authentication from localStorage');
      setIsAuthenticated(true);
      setToken(savedToken);
      setAuthTimestamp(savedAuthTimestamp ? Number(savedAuthTimestamp) : Date.now());
      if (savedUsername) {
        setLastAuthUsername(savedUsername);
      }
      loadProjects(savedToken);
    } else {
      console.log('🔓 No saved authentication found');
    }
  }, []);

  useEffect(() => {
    setReauthCredentials((prev) => ({
      ...prev,
      username: lastAuthUsername || prev.username || '',
    }));
  }, [lastAuthUsername]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('\n' + '='.repeat(60));
    console.log('🛡️ FRONTEND LOGIN ATTEMPT STARTED');
    console.log('Time:', new Date().toISOString());
    console.log('Username provided:', `"${username}"`);
    console.log('Password length:', password?.length);
    console.log('='.repeat(60));

    if (!username || !password) {
      console.log('❌ VALIDATION FAILED: Missing credentials');
      console.log('Username:', !!username, '| Password:', !!password);
      alert('Please enter both username and password');
      setIsLoading(false);
      return;
    }
    console.log('✅ VALIDATION PASSED: Credentials provided');

    // Detect if we're in development (localhost)
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              process.env.NODE_ENV === 'development';

    console.log('\n🌍 ENVIRONMENT DETECTION:');
    console.log('window.location.hostname:', window.location.hostname);
    console.log('window.location.href:', window.location.href);
    console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
    console.log('isLocalDevelopment:', isLocalDevelopment);
    console.log('User agent:', navigator.userAgent);

    console.log('\n🔌 ATTEMPTING API AUTHENTICATION:');
    
    // Use canonical API base URL to avoid domain issues
    const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
    const apiEndpoint = `${API_BASE}/api/admin/login`;
    const requestBody = { username, password };
    const requestHeaders = { 'Content-Type': 'application/json' };
    
    console.log('API_BASE determined:', API_BASE);
    console.log('window.location.origin:', window.location.origin);
    console.log('process.env.REACT_APP_API_BASE:', process.env.REACT_APP_API_BASE);
    
    console.log('API endpoint:', apiEndpoint);
    console.log('Request method: POST');
    console.log('Request headers:', requestHeaders);
    console.log('Request body (password masked):', { username, password: '[MASKED]' });
    
    try {
      console.log('🚀 Making fetch request...');
      const fetchStartTime = Date.now();
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });
      
      const fetchEndTime = Date.now();
      console.log(`⏱️ Fetch completed in ${fetchEndTime - fetchStartTime}ms`);
      
      console.log('\n📝 RESPONSE DETAILS:');
      console.log('Status:', response.status);
      console.log('Status text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response OK:', response.ok);
      console.log('URL:', response.url);
      
      if (response.ok) {
        console.log('\n📦 PARSING SUCCESS RESPONSE:');
        let data;
        try {
          const responseText = await response.text();
          console.log('Raw response text:', responseText);
          data = JSON.parse(responseText);
          console.log('Parsed JSON:', data);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          throw new Error('Invalid JSON response from server');
        }
        
        console.log('\n✅ API LOGIN SUCCESSFUL:');
        console.log('Token received:', data.token ? `[${data.token.length} chars]` : 'NO TOKEN');
        console.log('User data:', data.user);
        console.log('Message:', data.message);
        
        console.log('\n💾 UPDATING FRONTEND STATE:');
        setIsAuthenticated(true);
        console.log('setIsAuthenticated(true) called');
        
        setToken(data.token);
        console.log('setToken called with token');

        const authUsername = data.user?.username || username;
        const authTimestampValue = Date.now();
        setAuthTimestamp(authTimestampValue);
        setLastAuthUsername(authUsername);

        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminAuthenticatedAt', authTimestampValue.toString());
        localStorage.setItem('adminLastUsername', authUsername);
        console.log('localStorage updated');
        
        console.log('📁 Loading projects...');
        loadProjects(data.token);
        
        setIsLoading(false);
        console.log('✅ LOGIN PROCESS COMPLETED SUCCESSFULLY');
        return;
        
      } else {
        console.log('\n❌ API RESPONSE ERROR:');
        let errorData;
        try {
          const errorText = await response.text();
          console.log('Error response text:', errorText);
          errorData = JSON.parse(errorText);
          console.log('Parsed error JSON:', errorData);
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
          errorData = { error: 'Login failed' };
        }
        
        console.log('Error data:', errorData);
        
        // If API fails and we're in development, try feature-flagged fallback
        if (
          FEATURE_FLAGS.devAuthBypass &&
          isLocalDevelopment &&
          username === DEV_CREDENTIALS.username &&
          password === DEV_CREDENTIALS.password
        ) {
          console.log('\n🔧 API FAILED - ATTEMPTING DEVELOPMENT FALLBACK:');
          console.log('Fallback conditions met - switching to dev mode');

          setIsAuthenticated(true);
          setToken('dev-token');
          const fallbackAuthTime = Date.now();
          setAuthTimestamp(fallbackAuthTime);
          setLastAuthUsername(username);
          localStorage.setItem('adminAuthenticated', 'true');
          localStorage.setItem('adminToken', 'dev-token');
          localStorage.setItem('adminAuthenticatedAt', fallbackAuthTime.toString());
          localStorage.setItem('adminLastUsername', username);
          loadProjects('dev-token');
          setIsLoading(false);
          console.log('✅ DEVELOPMENT FALLBACK SUCCESSFUL');
          return;
        }

        if (!FEATURE_FLAGS.devAuthBypass && isLocalDevelopment) {
          console.log('🚫 Development auth bypass is disabled via feature flag.');
        }
        console.log('❌ NO FALLBACK AVAILABLE - Showing error to user');
        const errorMessage = `Login failed: ${errorData.error || 'Invalid credentials'}`;
        console.log('Error message:', errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.log('\n⚡ NETWORK/FETCH ERROR:');
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Network error fallback for development
      if (
        FEATURE_FLAGS.devAuthBypass &&
        isLocalDevelopment &&
        username === DEV_CREDENTIALS.username &&
        password === DEV_CREDENTIALS.password
      ) {
        console.log('\n🔧 NETWORK ERROR - ATTEMPTING DEVELOPMENT FALLBACK:');
        console.log('Fallback conditions met - switching to dev mode');

        setIsAuthenticated(true);
        setToken('dev-token');
        const fallbackAuthTime = Date.now();
        setAuthTimestamp(fallbackAuthTime);
        setLastAuthUsername(username);
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminToken', 'dev-token');
        localStorage.setItem('adminAuthenticatedAt', fallbackAuthTime.toString());
        localStorage.setItem('adminLastUsername', username);
        loadProjects('dev-token');
        setIsLoading(false);
        console.log('✅ DEVELOPMENT FALLBACK AFTER NETWORK ERROR SUCCESSFUL');
        return;
      }

      if (!FEATURE_FLAGS.devAuthBypass && isLocalDevelopment) {
        console.log('🚫 Development auth bypass is disabled via feature flag.');
      }
      console.log('❌ NO FALLBACK AVAILABLE - Showing network error to user');
      const errorMessage = '❌ Login failed: Unable to connect to server. Please check your connection and try again.';
      console.log('Error message:', errorMessage);
      alert(errorMessage);
    } finally {
      console.log('\n🏁 LOGIN ATTEMPT COMPLETED');
      console.log('Final setIsLoading(false) call');
      setIsLoading(false);
      console.log('='.repeat(60) + '\n');
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    setIsAuthenticated(false);
    setToken('');
    setUsername('');
    setPassword('');
    setProjects([]);
    setEditingProject(null);
    setAuthTimestamp(null);
    setLastAuthUsername('');
    setConfirmationModal(null);
    setReauthCredentials({ username: '', password: '' });
    setIsProcessingAction(false);
    setReauthError('');
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthenticatedAt');
    localStorage.removeItem('adminLastUsername');
    console.log('✅ Logout successful');
  };

  const getSessionAge = () =>
    authTimestamp ? Date.now() - authTimestamp : Number.POSITIVE_INFINITY;

  const openConfirmationModal = ({ title, message, confirmLabel, onConfirm, project, type }) => {
    const requiresReauth = getSessionAge() > REAUTH_THRESHOLD_MS;
    setConfirmationModal({
      title,
      message,
      confirmLabel,
      onConfirm,
      project,
      type,
      requiresReauth,
    });
    setReauthError('');
    setReauthCredentials((prev) => ({
      username: lastAuthUsername || prev.username || username,
      password: '',
    }));
  };

  const closeConfirmationModal = () => {
    setConfirmationModal(null);
    setIsProcessingAction(false);
    setReauthError('');
    setReauthCredentials((prev) => ({ ...prev, password: '' }));
  };

  const performReauthentication = async () => {
    const reauthUsername = (reauthCredentials.username || lastAuthUsername || '').trim();
    const reauthPassword = reauthCredentials.password;

    if (!reauthUsername || !reauthPassword) {
      throw new Error('Username and password are required for re-authentication.');
    }

    if (
      FEATURE_FLAGS.devAuthBypass &&
      clientIsDevelopment &&
      reauthUsername === DEV_CREDENTIALS.username &&
      reauthPassword === DEV_CREDENTIALS.password
    ) {
      const fallbackAuthTime = Date.now();
      setToken('dev-token');
      setAuthTimestamp(fallbackAuthTime);
      setLastAuthUsername(reauthUsername);
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminToken', 'dev-token');
      localStorage.setItem('adminAuthenticatedAt', fallbackAuthTime.toString());
      localStorage.setItem('adminLastUsername', reauthUsername);
      return 'dev-token';
    }

    const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: reauthUsername, password: reauthPassword }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error || 'Re-authentication failed');
    }

    const data = await response.json();
    const newAuthTime = Date.now();
    const normalizedUsername = data.user?.username || reauthUsername;

    setToken(data.token);
    setAuthTimestamp(newAuthTime);
    setLastAuthUsername(normalizedUsername);
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminAuthenticatedAt', newAuthTime.toString());
    localStorage.setItem('adminLastUsername', normalizedUsername);

    return data.token;
  };

  const executeConfirmation = async () => {
    if (!confirmationModal) return;
    setIsProcessingAction(true);
    try {
      let freshToken = null;
      if (confirmationModal.requiresReauth) {
        freshToken = await performReauthentication();
      }
      await confirmationModal.onConfirm(freshToken || token);
      closeConfirmationModal();
    } catch (error) {
      console.error('Confirmation modal error:', error);
      setReauthError(error.message || 'Unable to complete this action.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const loadProjects = async (authToken) => {
    // Check if we're in development or if token is dev-token
    const isLocalDevelopment = clientIsDevelopment ||
                              authToken === 'dev-token' ||
                              token === 'dev-token';
    
    // Development mode - load mock projects
    if (isLocalDevelopment) {
      const mockProjects = [
        {
          _id: '1',
          id: 's9',
          title: 'S9',
          description: 'Shadow Home Server',
          path: '/projects/s9',
          component: 'S9',
          published: true,
        },
        {
          _id: '2',
          id: 'muse',
          title: 'Muse',
          description: 'Automated Audio Equalizer',
          path: '/projects/muse',
          component: 'Muse',
          published: true,
        },
        {
          _id: '3',
          id: 'el',
          title: 'EyeLearn',
          description: 'Academia AR/VR Headset',
          path: '/projects/EL',
          component: 'EL',
          published: false,
        },
        {
          _id: '4',
          id: 'nfi',
          title: 'NFI',
          description: 'Rocket Propulsion System',
          path: '/projects/NFI',
          component: 'NFI',
          published: true,
        },
        {
          _id: '5',
          id: 'naton',
          title: 'Naton',
          description: 'Element Converter',
          path: '/projects/Naton',
          component: 'Naton',
          published: false,
        },
        {
          _id: '6',
          id: 'sos',
          title: 'sOS',
          description: 'Shadow Operating System',
          path: '/projects/sos',
          component: 'Sos',
          published: true,
        },
        {
          _id: '7',
          id: 'sim',
          title: 'S_im',
          description: 'Shadow Simulator',
          path: '/projects/sim',
          component: 'Sim',
          published: true,
        }
      ];
      setProjects(mockProjects);
      return;
    }

    // Production mode
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const apiEndpoint = `${API_BASE}/api/admin/projects`;
      console.log('Loading projects from:', apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${authToken || token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();

    // Development mode - add to local state
    if (isDevelopmentSession()) {
      const newProjectWithId = {
        ...newProject,
        _id: Date.now().toString()
      };
      setProjects([newProjectWithId, ...projects]);
      setNewProject({ id: '', title: '', description: '', path: '', component: '', published: false });
      alert('Project added successfully! (Development mode)');
      return;
    }

    // Production mode
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const apiEndpoint = `${API_BASE}/api/admin/projects`;
      console.log('Adding project to:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        setNewProject({ id: '', title: '', description: '', path: '', component: '', published: false });
        loadProjects();
        alert('Project added successfully!');
      } else {
        alert('Failed to add project');
      }
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    // Development mode - update local state
    if (isDevelopmentSession()) {
      setProjects(projects.map(p =>
        p._id === editingProject._id ? editingProject : p
      ));
      setEditingProject(null);
      alert('Project updated successfully! (Development mode)');
      return;
    }

    // Production mode
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const apiEndpoint = `${API_BASE}/api/admin/projects/${editingProject._id}`;
      console.log('Updating project at:', apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProject),
      });

      if (response.ok) {
        setEditingProject(null);
        loadProjects();
        alert('Project updated successfully!');
      } else {
        alert('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  };

  const executeDeleteProject = async (project, authTokenOverride) => {
    if (isDevelopmentSession()) {
      setProjects((prev) => prev.filter((p) => p._id !== project._id));
      setEditingProject((prev) => (prev && prev._id === project._id ? null : prev));
      alert('Project deleted successfully! (Development mode)');
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const apiEndpoint = `${API_BASE}/api/admin/projects/${project._id}`;
      console.log('Deleting project at:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authTokenOverride || token}`,
        },
      });

      if (response.ok) {
        setEditingProject((prev) => (prev && prev._id === project._id ? null : prev));
        await loadProjects(authTokenOverride || token);
        alert('Project deleted successfully!');
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Failed to delete project:', errorText);
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const executePublishStatusChange = async (project, shouldPublish, authTokenOverride) => {
    if (isDevelopmentSession()) {
      setProjects((prev) => prev.map((p) => (
        p._id === project._id ? { ...p, published: shouldPublish } : p
      )));
      setEditingProject((prev) => (
        prev && prev._id === project._id ? { ...prev, published: shouldPublish } : prev
      ));
      alert(`Project ${shouldPublish ? 'published' : 'unpublished'} successfully! (Development mode)`);
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const apiEndpoint = `${API_BASE}/api/admin/projects/${project._id}`;
      console.log('Updating publish status at:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authTokenOverride || token}`,
        },
        body: JSON.stringify({ published: shouldPublish }),
      });

      if (response.ok) {
        setEditingProject((prev) => (
          prev && prev._id === project._id ? { ...prev, published: shouldPublish } : prev
        ));
        await loadProjects(authTokenOverride || token);
        alert(`Project ${shouldPublish ? 'published' : 'unpublished'} successfully!`);
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Failed to update publish status:', errorText);
        alert('Failed to update publish status');
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
      alert('Failed to update publish status');
    }
  };

  const handlePublishToggle = (project, shouldPublish) => {
    if (shouldPublish) {
      executePublishStatusChange(project, true);
      return;
    }

    openConfirmationModal({
      type: 'unpublish',
      project,
      title: `Unpublish "${project.title}"?`,
      message: 'Unpublishing removes this card from the public projects feed until it is published again.',
      confirmLabel: 'Unpublish',
      onConfirm: (freshToken) => executePublishStatusChange(project, false, freshToken),
    });
  };

  const handleDeleteProject = (project) => {
    openConfirmationModal({
      type: 'delete',
      project,
      title: `Delete "${project.title}"?`,
      message: 'This action permanently removes the project and its history. Consider unpublishing if you only need to hide it.',
      confirmLabel: 'Delete',
      onConfirm: (freshToken) => executeDeleteProject(project, freshToken),
    });
  };

  const handleChatGPT = async (e) => {
    e.preventDefault();
    if (!chatPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setChatLoading(true);
    console.log('\n🤖 CHATGPT REQUEST STARTED');
    console.log('Prompt:', chatPrompt);

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const apiEndpoint = `${API_BASE}/api/admin/chatgpt`;
      console.log('ChatGPT endpoint:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: chatPrompt })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ChatGPT response received:', data);
        setChatResponse(data.response);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ ChatGPT API error:', errorData);
        setChatResponse(`Error: ${errorData.error || 'Failed to get response'}`);
      }
    } catch (error) {
      console.error('❌ ChatGPT network error:', error);
      setChatResponse(`Network Error: ${error.message}`);
    } finally {
      setChatLoading(false);
      console.log('🏁 ChatGPT request completed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <header className="admin-header" role="banner">
          <Link to="/" aria-label="Return to homepage">
            <button className="gs-btn" title="Return to homepage">GS</button>
          </Link>
          <h1>Admin Login</h1>
          {clientIsDevelopment && (
            <div id="dev-credentials" style={{
              color: theme.warning,
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '10px',
              border: `1px solid ${theme.warning}`,
              borderRadius: '5px',
              marginBottom: '20px',
              backgroundColor: `${theme.warning}20`
            }} role="note" aria-label="Development mode credentials">
              <strong>Development Mode</strong><br />
              {FEATURE_FLAGS.devAuthBypass ? (
                <>
                  Username: {DEV_CREDENTIALS.username}<br />
                  Password: {DEV_CREDENTIALS.password}
                </>
              ) : (
                <span>Dev bypass is disabled. Use your admin credentials to sign in.</span>
              )}
            </div>
          )}
        </header>

        <main className="login-form" role="main">
          {securityNotices.length > 0 && (
            <aside className="security-notices" role="alert">
              <h2>Security reminders</h2>
              <ul>
                {securityNotices.map((notice, index) => (
                  <li key={index}>{notice}</li>
                ))}
              </ul>
            </aside>
          )}
          <form onSubmit={handleLogin} aria-label="Admin login form">
            <div className="form-group">
              <label htmlFor="username-input">Username:</label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-describedby={clientIsDevelopment && FEATURE_FLAGS.devAuthBypass ? 'dev-credentials' : undefined}
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password-input">Password:</label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-describedby={clientIsDevelopment && FEATURE_FLAGS.devAuthBypass ? 'dev-credentials' : undefined}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-btn" disabled={isLoading} aria-describedby="login-status">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div id="login-status" className="sr-only">
              {isLoading ? 'Please wait while we log you in...' : ''}
            </div>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.admin_container} id="admin-container">
      <header className={styles.admin_header} id="admin_header">
        <Link to="/">
          <button className="gs-btn">GS</button>
        </Link>
        <h1>Project Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ color: theme.warning, fontSize: '0.8rem' }}>
              Development Mode
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className={styles.admin_main} id="admin_main">
        {securityNotices.length > 0 && (
          <section className="security-notices" role="alert">
            <h2>Security reminders</h2>
            <ul>
              {securityNotices.map((notice, index) => (
                <li key={index}>{notice}</li>
              ))}
            </ul>
          </section>
        )}
        {/* Analytics Dashboard */}
        <AnalyticsDashboard />
        
        {/* Performance Monitor */}
        <PerformanceMonitor />
        
        {/* ChatGPT AI Assistant */}
        <section className="chatgpt-section" style={{ marginBottom: '2rem', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: theme.cardBg }}>
          <h2 style={{ color: theme.text, marginBottom: '15px' }}>🤖 AI Assistant (ChatGPT)</h2>
          <form onSubmit={handleChatGPT} style={{ marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: theme.text }}>Ask ChatGPT:</label>
              <textarea
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Enter your question or prompt here..."
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '4px',
                  resize: 'vertical',
                  fontSize: '14px',
                  backgroundColor: theme.cardBg,
                  color: theme.text
                }}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={chatLoading}
              style={{
                backgroundColor: chatLoading ? theme.textSecondary : theme.primary,
                color: theme.cardBg,
                border: `1px solid ${chatLoading ? theme.textSecondary : theme.primary}`,
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: chatLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s, border-color 0.2s'
              }}
            >
              {chatLoading ? '🔄 Thinking...' : '🚀 Ask ChatGPT'}
            </button>
          </form>
          
          {chatResponse && (
            <div style={{ 
              backgroundColor: theme.surface, 
              padding: '15px', 
              border: `1px solid ${theme.border}`, 
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.4',
              color: theme.text
            }}>
              <strong style={{ color: theme.primary }}>🤖 ChatGPT Response:</strong>
              <div style={{ marginTop: '10px' }}>{chatResponse}</div>
            </div>
          )}
        </section>

        {/* Add New Project */}
        <section className="add-project-section">
          <h2>Add New Project</h2>
          <form onSubmit={handleAddProject} className="project-form">
            <div className="form-row">
              <div className="form-group">
                <label>ID:</label>
                <input
                  type="text"
                  value={newProject.id}
                  onChange={(e) => setNewProject({ ...newProject, id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Path:</label>
                <input
                  type="text"
                  value={newProject.path}
                  onChange={(e) => setNewProject({ ...newProject, path: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Component:</label>
                <input
                  type="text"
                  value={newProject.component}
                  onChange={(e) => setNewProject({ ...newProject, component: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newProject.published}
                  onChange={(e) => setNewProject({ ...newProject, published: e.target.checked })}
                />
                <span>Published</span>
              </label>
              <p className="field-hint">Draft projects remain hidden from the public projects feed.</p>
            </div>
            <button type="submit" className="add-btn">Add Project</button>
          </form>
          <div className="preview-section" aria-live="polite">
            <h3>Live Preview</h3>
            <p className="field-hint">Validate formatting before saving. The preview updates as you edit.</p>
            <div className="preview-card-wrapper">
              <ProjectCard project={previewProject} previewMode />
            </div>
          </div>
        </section>

        {/* Existing Projects */}
        <section className="projects-section">
          <h2>Existing Projects</h2>
          <div className="projects-list">
            {projects.map((project) => (
              <div key={project._id} className="project-item">
                {editingProject && editingProject._id === project._id ? (
                  <form onSubmit={handleUpdateProject} className="edit-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>ID:</label>
                        <input
                          type="text"
                          value={editingProject.id}
                          onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Title:</label>
                        <input
                          type="text"
                          value={editingProject.title}
                          onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description:</label>
                      <input
                        type="text"
                        value={editingProject.description}
                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Path:</label>
                        <input
                          type="text"
                          value={editingProject.path}
                          onChange={(e) => setEditingProject({ ...editingProject, path: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Component:</label>
                        <input
                          type="text"
                          value={editingProject.component}
                          onChange={(e) => setEditingProject({ ...editingProject, component: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={Boolean(editingProject.published)}
                          onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                        />
                        <span>Published</span>
                      </label>
                      <p className="field-hint">Unpublishing will hide this project from public listings.</p>
                    </div>
                    <div className="edit-actions">
                      <button type="submit" className="save-btn">Save</button>
                      <button type="button" onClick={() => setEditingProject(null)} className="cancel-btn">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="project-info">
                    <div className="project-header-row">
                      <h3>{project.title}</h3>
                      <span
                        className={`status-badge ${project.published ? 'status-badge--published' : 'status-badge--draft'}`}
                      >
                        {project.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="project-meta"><strong>ID:</strong> {project.id}</p>
                    <p className="project-meta"><strong>Description:</strong> {project.description}</p>
                    <p className="project-meta"><strong>Path:</strong> {project.path}</p>
                    <p className="project-meta"><strong>Component:</strong> {project.component}</p>
                    <p className="project-meta project-meta--timestamp">
                      <strong>Updated:</strong>{' '}
                      {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : '—'}
                    </p>
                    <div className="project-actions">
                      <button onClick={() => setEditingProject(project)} className="edit-btn">Edit</button>
                      <button
                        onClick={() => handlePublishToggle(project, !project.published)}
                        className={project.published ? 'unpublish-btn' : 'publish-btn'}
                      >
                        {project.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => handleDeleteProject(project)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      {confirmationModal && (
        <div
          className="confirmation-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-modal-title"
          aria-describedby="confirmation-modal-message"
        >
          <div className="confirmation-modal">
            <h3 id="confirmation-modal-title">{confirmationModal.title}</h3>
            <p id="confirmation-modal-message">{confirmationModal.message}</p>
            {confirmationModal.requiresReauth && (
              <div className="reauth-container">
                <p className="field-hint">
                  Session age exceeds {REAUTH_THRESHOLD_MINUTES} minutes. Re-authenticate to continue.
                </p>
                <label className="form-group">
                  <span>Username</span>
                  <input
                    type="text"
                    value={reauthCredentials.username}
                    onChange={(e) => setReauthCredentials((prev) => ({ ...prev, username: e.target.value }))}
                    autoComplete="username"
                  />
                </label>
                <label className="form-group">
                  <span>Password</span>
                  <input
                    type="password"
                    value={reauthCredentials.password}
                    onChange={(e) => setReauthCredentials((prev) => ({ ...prev, password: e.target.value }))}
                    autoComplete="current-password"
                  />
                </label>
                {reauthError && <p className="error-text">{reauthError}</p>}
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={closeConfirmationModal} disabled={isProcessingAction}>
                Cancel
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={executeConfirmation}
                disabled={isProcessingAction}
              >
                {isProcessingAction ? 'Processing...' : confirmationModal.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin; 