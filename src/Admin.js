import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PerformanceMonitor from './components/PerformanceMonitor';
import { useTheme } from './contexts/ThemeContext';
import styles from './styles/styles_admin.css';

const getDefaultProjectValues = (overrides = {}) => ({
  id: '',
  title: '',
  description: '',
  path: '',
  component: '',
  displayOrder: 1,
  published: false,
  ...overrides
});

const parseDisplayOrder = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePublished = (value, defaultValue = true) => {
  if (value === false || value === 'false') {
    return false;
  }
  if (value === true || value === 'true') {
    return true;
  }
  return defaultValue;
};

const sortProjectsByDisplayOrder = (a, b) => {
  const orderA = parseDisplayOrder(a?.displayOrder, Number.MAX_SAFE_INTEGER);
  const orderB = parseDisplayOrder(b?.displayOrder, Number.MAX_SAFE_INTEGER);

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
  const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;

  if (dateA !== dateB) {
    return dateB - dateA;
  }

  return (a?.title || '').localeCompare(b?.title || '');
};

function Admin() {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newProject, setNewProject] = useState(() => getDefaultProjectValues());
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('published');

  const isLocalEnvironment = (overrideToken) => {
    const activeToken = overrideToken ?? token;
    return window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development' ||
      activeToken === 'dev-token';
  };

  const computeNextDisplayOrder = () => {
    if (!projects.length) {
      return 1;
    }

    const parsedOrders = projects.map((project, index) => {
      const parsed = Number(project?.displayOrder);
      return Number.isFinite(parsed) ? parsed : index;
    });

    const maxOrder = Math.max(...parsedOrders);
    return (Number.isFinite(maxOrder) ? maxOrder : projects.length) + 1;
  };

  const createEmptyProject = () => getDefaultProjectValues({ displayOrder: computeNextDisplayOrder() });

  const buildProjectPayload = (project, { defaultPublished = true, fallbackDisplayOrder } = {}) => {
    if (!project) {
      return {};
    }

    const fallbackOrder = fallbackDisplayOrder ?? computeNextDisplayOrder();

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      path: project.path,
      component: project.component,
      displayOrder: parseDisplayOrder(project.displayOrder, fallbackOrder),
      published: normalizePublished(project.published, defaultPublished)
    };
  };

  const persistProjectUpdate = async (projectId, payload) => {
    const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
    const apiEndpoint = `${API_BASE}/api/admin/projects/${projectId}`;

    const response = await fetch(apiEndpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update project');
    }

    return response.json();
  };

  // Check if user is already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    const savedToken = localStorage.getItem('adminToken');
    
    if (authStatus === 'true' && savedToken) {
      console.log('🔄 Restoring authentication from localStorage');
      setIsAuthenticated(true);
      setToken(savedToken);
      loadProjects(savedToken);
    } else {
      console.log('🔓 No saved authentication found');
    }
  }, []);

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
        
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminToken', data.token);
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
        
        // If API fails and we're in development, try fallback
        if (isLocalDevelopment && username === 'shadowpatriot9' && password === '16196823') {
          console.log('\n🔧 API FAILED - ATTEMPTING DEVELOPMENT FALLBACK:');
          console.log('Fallback conditions met - switching to dev mode');
          
          setIsAuthenticated(true);
          setToken('dev-token');
          localStorage.setItem('adminAuthenticated', 'true');
          localStorage.setItem('adminToken', 'dev-token');
          loadProjects('dev-token');
          setIsLoading(false);
          console.log('✅ DEVELOPMENT FALLBACK SUCCESSFUL');
          return;
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
      if (isLocalDevelopment && username === 'shadowpatriot9' && password === '16196823') {
        console.log('\n🔧 NETWORK ERROR - ATTEMPTING DEVELOPMENT FALLBACK:');
        console.log('Fallback conditions met - switching to dev mode');
        
        setIsAuthenticated(true);
        setToken('dev-token');
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminToken', 'dev-token');
        loadProjects('dev-token');
        setIsLoading(false);
        console.log('✅ DEVELOPMENT FALLBACK AFTER NETWORK ERROR SUCCESSFUL');
        return;
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
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminToken');
    console.log('✅ Logout successful');
  };

  const loadProjects = async (authToken) => {
    if (isLocalEnvironment(authToken)) {
      const mockProjects = [
        {
          _id: '1',
          id: 's9',
          title: 'S9',
          description: 'Shadow Home Server',
          path: '/projects/s9',
          component: 'S9',
          displayOrder: 1,
          published: true
        },
        {
          _id: '2',
          id: 'sim',
          title: 'S_im',
          description: 'Shadow Simulator',
          path: '/projects/sim',
          component: 'Sim',
          displayOrder: 2,
          published: true
        },
        {
          _id: '3',
          id: 'sos',
          title: 'sOS',
          description: 'Shadow Operating System',
          path: '/projects/sos',
          component: 'Sos',
          displayOrder: 3,
          published: true
        },
        {
          _id: '4',
          id: 'nfi',
          title: 'NFI',
          description: 'Rocket Propulsion System',
          path: '/projects/NFI',
          component: 'NFI',
          displayOrder: 4,
          published: true
        },
        {
          _id: '5',
          id: 'el',
          title: 'EyeLearn',
          description: 'Academia AR/VR Headset',
          path: '/projects/EL',
          component: 'EL',
          displayOrder: 5,
          published: true
        },
        {
          _id: '6',
          id: 'naton',
          title: 'Naton',
          description: 'Element Converter',
          path: '/projects/Naton',
          component: 'Naton',
          displayOrder: 6,
          published: true
        },
        {
          _id: '7',
          id: 'muse',
          title: 'Muse',
          description: 'Automated Audio Equalizer',
          path: '/projects/muse',
          component: 'Muse',
          displayOrder: 7,
          published: false
        }
      ];
      setProjects(mockProjects);
      return;
    }

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

  useEffect(() => {
    setNewProject((prev) => {
      const hasFormData = prev.id || prev.title || prev.description || prev.path || prev.component;
      if (hasFormData) {
        return prev;
      }
      return getDefaultProjectValues({ displayOrder: computeNextDisplayOrder() });
    });
  }, [projects]);

  const handleAddProject = async (e) => {
    e.preventDefault();

    const preparedProject = buildProjectPayload(newProject, {
      defaultPublished: false,
      fallbackDisplayOrder: computeNextDisplayOrder()
    });

    if (isLocalEnvironment()) {
      const now = new Date().toISOString();
      const newProjectWithId = {
        ...preparedProject,
        _id: Date.now().toString(),
        createdAt: now,
        updatedAt: now
      };

      setProjects((prev) => [...prev, newProjectWithId]);
      setNewProject(createEmptyProject());
      alert('Project added successfully! (Development mode)');
      return;
    }

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
        body: JSON.stringify(preparedProject),
      });

      if (response.ok) {
        setNewProject(createEmptyProject());
        await loadProjects();
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

    if (!editingProject) {
      return;
    }

    const fallbackOrder = parseDisplayOrder(editingProject.displayOrder, computeNextDisplayOrder());
    const payload = buildProjectPayload(editingProject, {
      defaultPublished: true,
      fallbackDisplayOrder: fallbackOrder
    });

    if (isLocalEnvironment()) {
      const now = new Date().toISOString();
      setProjects((prev) => prev.map((project) => (
        project._id === editingProject._id
          ? { ...project, ...payload, updatedAt: now }
          : project
      )));
      setEditingProject(null);
      alert('Project updated successfully! (Development mode)');
      return;
    }

    try {
      await persistProjectUpdate(editingProject._id, payload);
      setEditingProject(null);
      await loadProjects();
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {

      if (isLocalEnvironment()) {
        setProjects((prev) => prev.filter(p => p._id !== projectId));
        alert('Project deleted successfully! (Development mode)');
        return;
      }

      try {
        const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
        const apiEndpoint = `${API_BASE}/api/admin/projects/${projectId}`;
        console.log('Deleting project at:', apiEndpoint);

        const response = await fetch(apiEndpoint, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await loadProjects();
          alert('Project deleted successfully!');
        } else {
          alert('Failed to delete project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleMoveProject = async (projectId, direction, currentList = []) => {
    const currentIndex = currentList.findIndex(project => project._id === projectId);
    if (currentIndex === -1) {
      return;
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= currentList.length) {
      return;
    }

    const currentProject = currentList[currentIndex];
    const swapProject = currentList[swapIndex];

    const currentOrder = parseDisplayOrder(currentProject.displayOrder, currentIndex);
    const swapOrder = parseDisplayOrder(swapProject.displayOrder, swapIndex);

    setProjects((prev) => prev.map((project) => {
      if (project._id === currentProject._id) {
        return { ...project, displayOrder: swapOrder };
      }
      if (project._id === swapProject._id) {
        return { ...project, displayOrder: currentOrder };
      }
      return project;
    }));

    if (isLocalEnvironment()) {
      return;
    }

    try {
      await Promise.all([
        persistProjectUpdate(currentProject._id, { displayOrder: swapOrder }),
        persistProjectUpdate(swapProject._id, { displayOrder: currentOrder })
      ]);
      await loadProjects();
    } catch (error) {
      console.error('Error updating project order:', error);
      alert('Failed to update project order. Please try again.');
      await loadProjects();
    }
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

  const sortedProjects = useMemo(() => [...projects].sort(sortProjectsByDisplayOrder), [projects]);
  const publishedProjects = useMemo(
    () => sortedProjects.filter((project) => project.published !== false),
    [sortedProjects]
  );
  const draftProjects = useMemo(
    () => sortedProjects.filter((project) => project.published === false),
    [sortedProjects]
  );
  const visibleProjects = activeTab === 'published' ? publishedProjects : draftProjects;

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <header className="admin-header" role="banner">
          <Link to="/" aria-label="Return to homepage">
            <button className="gs-btn" title="Return to homepage">GS</button>
          </Link>
          <h1>Admin Login</h1>
          {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || process.env.NODE_ENV === 'development') && (
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
              Username: shadowpatriot9<br />
              Password: 16196823
            </div>
          )}
        </header>

        <main className="login-form" role="main">
          <form onSubmit={handleLogin} aria-label="Admin login form">
            <div className="form-group">
              <label htmlFor="username-input">Username:</label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-describedby={process.env.NODE_ENV === 'development' ? 'dev-credentials' : undefined}
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
                aria-describedby={process.env.NODE_ENV === 'development' ? 'dev-credentials' : undefined}
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
            <div className="form-row">
              <div className="form-group">
                <label>Display Order:</label>
                <input
                  type="number"
                  min="0"
                  value={newProject.displayOrder === '' ? '' : newProject.displayOrder}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewProject({
                      ...newProject,
                      displayOrder: value === '' ? '' : Number(value)
                    });
                  }}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ marginBottom: 0 }}>Published:</label>
                <input
                  type="checkbox"
                  checked={normalizePublished(newProject.published, false)}
                  onChange={(e) => setNewProject({ ...newProject, published: e.target.checked })}
                />
                <span style={{ fontSize: '12px', color: theme.textSecondary }}>Uncheck to keep as draft</span>
              </div>
            </div>
            <button type="submit" className="add-btn">Add Project</button>
          </form>
        </section>

        {/* Existing Projects */}
        <section className="projects-section">
          <h2>Existing Projects</h2>
          <div className="projects-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              className={activeTab === 'published' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab('published')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                backgroundColor: activeTab === 'published' ? theme.primary : theme.surface,
                color: activeTab === 'published' ? theme.cardBg : theme.text,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              Published ({publishedProjects.length})
            </button>
            <button
              type="button"
              className={activeTab === 'drafts' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab('drafts')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                backgroundColor: activeTab === 'drafts' ? theme.primary : theme.surface,
                color: activeTab === 'drafts' ? theme.cardBg : theme.text,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              Drafts ({draftProjects.length})
            </button>
          </div>
          <div className="projects-list">
            {visibleProjects.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  border: `1px dashed ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.textSecondary,
                  textAlign: 'center'
                }}
              >
                {activeTab === 'published'
                  ? 'No published projects yet. Publish a project to show it on the site.'
                  : 'No drafts at the moment. Save a project as a draft to stage content.'}
              </div>
            ) : (
              visibleProjects.map((project, index) => (
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
                    <div className="form-row">
                      <div className="form-group">
                        <label>Display Order:</label>
                        <input
                          type="number"
                          min="0"
                          value={editingProject.displayOrder === '' || editingProject.displayOrder === undefined ? '' : editingProject.displayOrder}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEditingProject({
                              ...editingProject,
                              displayOrder: value === '' ? '' : Number(value)
                            });
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ marginBottom: 0 }}>Published:</label>
                        <input
                          type="checkbox"
                          checked={normalizePublished(editingProject.published, true)}
                          onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                        />
                        <span style={{ fontSize: '12px', color: theme.textSecondary }}>Drafts stay hidden from the site</span>
                      </div>
                    </div>
                    <div className="edit-actions">
                      <button type="submit" className="save-btn">Save</button>
                      <button type="button" onClick={() => setEditingProject(null)} className="cancel-btn">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p><strong>ID:</strong> {project.id}</p>
                    <p><strong>Description:</strong> {project.description}</p>
                    <p><strong>Path:</strong> {project.path}</p>
                    <p><strong>Component:</strong> {project.component}</p>
                    <p><strong>Display Order:</strong> {Number.isFinite(Number(project.displayOrder)) ? Number(project.displayOrder) : 'Not set'}</p>
                    <p><strong>Status:</strong> {project.published === false ? 'Draft' : 'Published'}</p>
                    <div className="project-actions">
                      <div className="order-controls" style={{ display: 'flex', gap: '4px', marginRight: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveProject(project._id, 'up', visibleProjects)}
                          disabled={index === 0}
                          className="order-btn"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: `1px solid ${theme.border}`,
                            backgroundColor: theme.surface,
                            color: theme.text,
                            cursor: index === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProject(project._id, 'down', visibleProjects)}
                          disabled={index === visibleProjects.length - 1}
                          className="order-btn"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: `1px solid ${theme.border}`,
                            backgroundColor: theme.surface,
                            color: theme.text,
                            cursor: index === visibleProjects.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          ↓
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setEditingProject({ ...project })} className="edit-btn">Edit</button>
                        <button onClick={() => handleDeleteProject(project._id)} className="delete-btn">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Admin;
