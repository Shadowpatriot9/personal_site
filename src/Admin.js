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

    if (!username || !password) {
      alert('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    // Detect if we're in development (localhost)
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              process.env.NODE_ENV === 'development';

    console.log('🔍 Environment:', {
      hostname: window.location.hostname,
      NODE_ENV: process.env.NODE_ENV,
      isLocalDevelopment
    });

    // Try API authentication first (works in both dev and prod)
    try {
      console.log('🔐 Attempting API login...');
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API login successful');
        setIsAuthenticated(true);
        setToken(data.token);
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminToken', data.token);
        loadProjects(data.token);
        setIsLoading(false);
        return;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        console.error('❌ API login failed:', errorData);
        
        // If API fails and we're in development, try fallback
        if (isLocalDevelopment && username === 'shadowpatriot9' && password === '16196823') {
          console.log('🔧 API failed, using development fallback');
          setIsAuthenticated(true);
          setToken('dev-token');
          localStorage.setItem('adminAuthenticated', 'true');
          localStorage.setItem('adminToken', 'dev-token');
          loadProjects('dev-token');
          setIsLoading(false);
          return;
        }
        
        alert(`Login failed: ${errorData.error || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('❌ Network error during API login:', error);
      
      // Network error fallback for development
      if (isLocalDevelopment && username === 'shadowpatriot9' && password === '16196823') {
        console.log('🔧 Network error, using development fallback');
        setIsAuthenticated(true);
        setToken('dev-token');
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminToken', 'dev-token');
        loadProjects('dev-token');
        setIsLoading(false);
        return;
      }
      
      alert('❌ Login failed: Unable to connect to server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
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
      const response = await fetch('/api/admin/projects', {
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
      const response = await fetch('/api/admin/projects', {
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
      const response = await fetch(`/api/admin/projects/${editingProject._id}`, {
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
        const response = await fetch(`/api/admin/projects/${projectId}`, {
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