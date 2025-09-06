import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/styles_admin.css';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    id: '',
    title: '',
    description: '',
    path: '',
    component: ''
  });
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
    setEditingProject(null);
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminToken');
    console.log('✅ Logout successful');
  };

  const loadProjects = async (authToken) => {
    // Check if we're in development or if token is dev-token
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              process.env.NODE_ENV === 'development' ||
                              authToken === 'dev-token';
    
    // Development mode - load mock projects
    if (isLocalDevelopment) {
      const mockProjects = [
        {
          _id: '1',
          id: 's9',
          title: 'S9',
          description: 'Shadow Home Server',
          path: '/projects/s9',
          component: 'S9'
        },
        {
          _id: '2',
          id: 'muse',
          title: 'Muse',
          description: 'Automated Audio Equalizer',
          path: '/projects/muse',
          component: 'Muse'
        },
        {
          _id: '3',
          id: 'el',
          title: 'EyeLearn',
          description: 'Academia AR/VR Headset',
          path: '/projects/EL',
          component: 'EL'
        },
        {
          _id: '4',
          id: 'nfi',
          title: 'NFI',
          description: 'Rocket Propulsion System',
          path: '/projects/NFI',
          component: 'NFI'
        },
        {
          _id: '5',
          id: 'naton',
          title: 'Naton',
          description: 'Element Converter',
          path: '/projects/Naton',
          component: 'Naton'
        },
        {
          _id: '6',
          id: 'sos',
          title: 'sOS',
          description: 'Shadow Operating System',
          path: '/projects/sos',
          component: 'Sos'
        },
        {
          _id: '7',
          id: 'sim',
          title: 'S_im',
          description: 'Shadow Simulator',
          path: '/projects/sim',
          component: 'Sim'
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

    // Check if we're in development
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              process.env.NODE_ENV === 'development' ||
                              token === 'dev-token';

    // Development mode - add to local state
    if (isLocalDevelopment) {
      const newProjectWithId = {
        ...newProject,
        _id: Date.now().toString()
      };
      setProjects([newProjectWithId, ...projects]);
      setNewProject({ id: '', title: '', description: '', path: '', component: '' });
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
        setNewProject({ id: '', title: '', description: '', path: '', component: '' });
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

    // Check if we're in development
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              process.env.NODE_ENV === 'development' ||
                              token === 'dev-token';

    // Development mode - update local state
    if (isLocalDevelopment) {
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

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {

      // Check if we're in development
      const isLocalDevelopment = window.location.hostname === 'localhost' || 
                                window.location.hostname === '127.0.0.1' ||
                                process.env.NODE_ENV === 'development' ||
                                token === 'dev-token';

      // Development mode - remove from local state
      if (isLocalDevelopment) {
        setProjects(projects.filter(p => p._id !== projectId));
        alert('Project deleted successfully! (Development mode)');
        return;
      }

      // Production mode
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
          loadProjects();
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
        <header className="admin-header">
          <Link to="/">
            <button className="gs-btn">GS</button>
          </Link>
          <h1>Admin Login</h1>
          {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || process.env.NODE_ENV === 'development') && (
            <div style={{ 
              color: '#ffc107', 
              fontSize: '0.9rem', 
              textAlign: 'center', 
              padding: '10px', 
              border: '1px solid #ffc107', 
              borderRadius: '5px', 
              marginBottom: '20px',
              backgroundColor: 'rgba(255, 193, 7, 0.1)' 
            }}>
              <strong>Development Mode</strong><br />
              Username: shadowpatriot9<br />
              Password: 16196823
            </div>
          )}
        </header>

        <div className="login-form">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
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
            <div style={{ color: '#ffc107', fontSize: '0.8rem' }}>
              Development Mode
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className={styles.admin_main} id="admin_main">
        {/* ChatGPT AI Assistant */}
        <section className="chatgpt-section" style={{ marginBottom: '2rem', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>🤖 AI Assistant (ChatGPT)</h2>
          <form onSubmit={handleChatGPT} style={{ marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ask ChatGPT:</label>
              <textarea
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Enter your question or prompt here..."
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  resize: 'vertical',
                  fontSize: '14px'
                }}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={chatLoading}
              style={{
                backgroundColor: chatLoading ? '#ccc' : '#007cba',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: chatLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {chatLoading ? '🔄 Thinking...' : '🚀 Ask ChatGPT'}
            </button>
          </form>
          
          {chatResponse && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              <strong style={{ color: '#007cba' }}>🤖 ChatGPT Response:</strong>
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
            <button type="submit" className="add-btn">Add Project</button>
          </form>
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
                    <div className="project-actions">
                      <button onClick={() => setEditingProject(project)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteProject(project._id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Admin; 