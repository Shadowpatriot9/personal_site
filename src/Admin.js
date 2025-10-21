import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PerformanceMonitor from './components/PerformanceMonitor';
import { useTheme } from './contexts/ThemeContext';
import { ProjectCatalogProvider } from './contexts/ProjectCatalogContext';
import ProjectsPanel from './components/admin/ProjectsPanel';
import styles from './styles/styles_admin.css';

const sortProjectsByOrder = (items) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const normalizeProject = (project, fallbackOrder = 0) => ({
  ...project,
  order: typeof project.order === 'number' ? project.order : fallbackOrder,
  published: typeof project.published === 'boolean' ? project.published : true,
});

const prepareProjectsForState = (items = []) =>
  sortProjectsByOrder(items.map((project, index) => normalizeProject(project, index)));

function Admin() {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

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
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminToken');
    console.log('✅ Logout successful');
  };

  const getApiBase = () => process.env.REACT_APP_API_BASE || window.location.origin;

  const isLocalEnvironment = useCallback((authToken) => (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    process.env.NODE_ENV === 'development' ||
    token === 'dev-token' ||
    authToken === 'dev-token'
  ), [token]);

  const loadProjects = useCallback(async (authToken) => {
    setProjectsLoading(true);
    const localMode = isLocalEnvironment(authToken);

    try {
      if (localMode) {
        const now = new Date().toISOString();
        const mockProjects = prepareProjectsForState([
          {
            _id: '1',
            id: 's9',
            title: 'S9',
            description: 'Shadow Home Server',
            path: '/projects/s9',
            component: 'S9',
            published: true,
            order: 0,
            createdAt: now,
            updatedAt: now,
          },
          {
            _id: '2',
            id: 'muse',
            title: 'Muse',
            description: 'Automated Audio Equalizer',
            path: '/projects/muse',
            component: 'Muse',
            published: false,
            order: 1,
            createdAt: now,
            updatedAt: now,
          },
          {
            _id: '3',
            id: 'el',
            title: 'EyeLearn',
            description: 'Academia AR/VR Headset',
            path: '/projects/EL',
            component: 'EL',
            published: true,
            order: 2,
            createdAt: now,
            updatedAt: now,
          },
          {
            _id: '4',
            id: 'nfi',
            title: 'NFI',
            description: 'Rocket Propulsion System',
            path: '/projects/NFI',
            component: 'NFI',
            published: true,
            order: 3,
            createdAt: now,
            updatedAt: now,
          },
          {
            _id: '5',
            id: 'naton',
            title: 'Naton',
            description: 'Element Converter',
            path: '/projects/Naton',
            component: 'Naton',
            published: false,
            order: 4,
            createdAt: now,
            updatedAt: now,
          },
          {
            _id: '6',
            id: 'sos',
            title: 'sOS',
            description: 'Shadow Operating System',
            path: '/projects/sos',
            component: 'Sos',
            published: true,
            order: 5,
            createdAt: now,
            updatedAt: now,
          },
          {
            _id: '7',
            id: 'sim',
            title: 'S_im',
            description: 'Shadow Simulator',
            path: '/projects/sim',
            component: 'Sim',
            published: true,
            order: 6,
            createdAt: now,
            updatedAt: now,
          },
        ]);
        setProjects(mockProjects);
        return;
      }

      const apiEndpoint = `${getApiBase()}/api/admin/projects`;
      console.log('Loading projects from:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${authToken || token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(prepareProjectsForState(data.projects || []));
      } else if (response.status === 401) {
        handleLogout();
      } else {
        console.error('Failed to load projects:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  }, [isLocalEnvironment, token]);

  const handleCreateProject = async (projectData) => {
    const order = Number.isFinite(projectData.order) ? Number(projectData.order) : projects.length;
    const payload = {
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      path: projectData.path,
      component: projectData.component,
      published: !!projectData.published,
      order,
    };

    const timestamp = new Date().toISOString();
    const localMode = isLocalEnvironment();

    if (localMode) {
      const newProject = normalizeProject({
        ...payload,
        _id: Date.now().toString(),
        createdAt: timestamp,
        updatedAt: timestamp,
      }, order);

      setProjects((prev) => prepareProjectsForState([...prev, newProject]));
      alert('Project added successfully! (Development mode)');
      return;
    }

    try {
      const response = await fetch(`${getApiBase()}/api/admin/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.project) {
          setProjects((prev) => prepareProjectsForState([...prev, data.project]));
        } else {
          await loadProjects();
        }
        alert('Project added successfully!');
      } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to add project');
      }
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project');
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    const localMode = isLocalEnvironment();
    const previousProjects = prepareProjectsForState(projects.map((project) => ({ ...project })));
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates._id;

    if (Object.prototype.hasOwnProperty.call(sanitizedUpdates, 'order')) {
      sanitizedUpdates.order = Number.isFinite(sanitizedUpdates.order)
        ? Number(sanitizedUpdates.order)
        : undefined;
    }

    const optimisticProjects = sortProjectsByOrder(projects.map((project) => {
      if (project._id !== projectId) {
        return project;
      }

      const nextOrder = sanitizedUpdates.order ?? project.order ?? 0;
      return normalizeProject({
        ...project,
        ...sanitizedUpdates,
        updatedAt: new Date().toISOString(),
        order: nextOrder,
      }, nextOrder);
    }));

    setProjects(optimisticProjects);

    if (localMode) {
      alert('Project updated successfully! (Development mode)');
      return;
    }

    try {
      const response = await fetch(`${getApiBase()}/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedUpdates),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.project) {
          setProjects((prev) => sortProjectsByOrder(prev.map((project) => (
            project._id === projectId
              ? normalizeProject(data.project, data.project.order ?? 0)
              : project
          ))));
        } else {
          await loadProjects();
        }
        alert('Project updated successfully!');
      } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setProjects(previousProjects);
      alert('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    const localMode = isLocalEnvironment();
    const previousProjects = prepareProjectsForState(projects.map((project) => ({ ...project })));
    setProjects((prev) => prev.filter((project) => project._id !== projectId));

    if (localMode) {
      alert('Project deleted successfully! (Development mode)');
      return;
    }

    try {
      const response = await fetch(`${getApiBase()}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Project deleted successfully!');
      } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setProjects(previousProjects);
      alert('Failed to delete project');
    }
  };

  const handleTogglePublish = async (projectId, nextPublished) => {
    await handleUpdateProject(projectId, { published: nextPublished });
  };

  const handleReorderProjects = async (nextProjects) => {
    const localMode = isLocalEnvironment();
    const normalized = sortProjectsByOrder(nextProjects.map((project, index) =>
      normalizeProject(project, typeof project.order === 'number' ? project.order : index)
    ).map((project, index) => ({ ...project, order: index })));
    const previousProjects = prepareProjectsForState(projects.map((project) => ({ ...project })));

    setProjects(normalized);

    if (localMode) {
      alert('Project order updated (Development mode)');
      return;
    }

    try {
      const responses = await Promise.all(normalized.map((project) =>
        fetch(`${getApiBase()}/api/admin/projects/${project._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ order: project.order }),
        })
      ));

      const failedResponse = responses.find((response) => !response.ok);
      if (failedResponse) {
        const errorMessage = await failedResponse.text();
        throw new Error(errorMessage || 'Failed to update project order');
      }
    } catch (error) {
      console.error('Error updating project order:', error);
      setProjects(previousProjects);
      alert('Failed to update project order');
    }
  };

  const catalogValue = useMemo(() => ({
    projects,
    setProjects,
    refresh: loadProjects,
    loading: projectsLoading,
  }), [projects, projectsLoading, loadProjects]);

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

        <ProjectCatalogProvider value={catalogValue}>
          <ProjectsPanel
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onTogglePublish={handleTogglePublish}
            onReorder={handleReorderProjects}
          />
        </ProjectCatalogProvider>
      </main>
    </div>
  );
}

export default Admin; 