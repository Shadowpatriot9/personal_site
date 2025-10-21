import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PerformanceMonitor from './components/PerformanceMonitor';
import { useTheme } from './contexts/ThemeContext';
import {
  PROJECT_STATUS_OPTIONS,
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_ROUTE_PATTERN,
  DEFAULT_PROJECT_STATUS,
  DEFAULT_PROJECT_CATEGORY
} from './constants/projectMetadata';
import styles from './styles/styles_admin.css';

const getStatusColor = (status, theme) => {
  switch (status) {
    case 'Active':
      return theme.success;
    case 'Completed':
      return '#4caf50';
    case 'In Progress':
      return theme.warning;
    case 'Paused':
      return '#ff9800';
    case 'Discontinued':
      return theme.danger;
    default:
      return theme.textSecondary;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Active':
      return '🟢';
    case 'Completed':
      return '✅';
    case 'In Progress':
      return '🔄';
    case 'Paused':
      return '⏸️';
    case 'Discontinued':
      return '❌';
    default:
      return '⚫';
  }
};

const formatDateForInput = (isoString) => {
  if (!isoString) {
    return '';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
};

const formatDateForDisplay = (isoString) => {
  if (!isoString) {
    return '—';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString();
};

const sanitizeArrayValues = (values = [], { transform, dedupeKey }) => {
  const array = Array.isArray(values)
    ? values
    : typeof values === 'string'
      ? values.split(',')
      : [];

  const seen = new Set();
  const result = [];

  array.forEach((item) => {
    if (typeof item !== 'string') {
      return;
    }
    const trimmed = item.trim();
    if (!trimmed) {
      return;
    }
    const value = transform(trimmed);
    const key = dedupeKey(value);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(value);
  });

  return result;
};

const createDefaultProject = () => ({
  id: '',
  title: '',
  description: '',
  path: '',
  component: '',
  category: DEFAULT_PROJECT_CATEGORY,
  status: DEFAULT_PROJECT_STATUS,
  technology: [],
  tags: [],
  dateCreated: new Date().toISOString(),
  route: '',
  thumbnail: ''
});

const transformProjectFromApi = (project = {}) => {
  if (!project) {
    return createDefaultProject();
  }

  const technology = sanitizeArrayValues(project.technology, {
    transform: (value) => value,
    dedupeKey: (value) => value.toLowerCase()
  });

  const tags = sanitizeArrayValues(project.tags, {
    transform: (value) => value.toLowerCase(),
    dedupeKey: (value) => value.toLowerCase()
  });

  const normalisedStatus = PROJECT_STATUS_OPTIONS.includes(project.status)
    ? project.status
    : DEFAULT_PROJECT_STATUS;

  return {
    ...project,
    technology,
    tags,
    status: normalisedStatus,
    category: project.category || DEFAULT_PROJECT_CATEGORY,
    dateCreated: project.dateCreated ? new Date(project.dateCreated).toISOString() : new Date().toISOString(),
    route: project.route || project.path || '',
    path: project.path || project.route || '',
    thumbnail: typeof project.thumbnail === 'string' ? project.thumbnail.trim() : ''
  };
};

const cloneProjectForEditing = (project) => {
  const normalised = transformProjectFromApi(project);
  return {
    ...normalised,
    technology: [...normalised.technology],
    tags: [...normalised.tags]
  };
};

const findDuplicateValue = (values = [], normalise = (value) => value) => {
  const seen = new Set();
  for (const rawValue of values) {
    if (typeof rawValue !== 'string') {
      continue;
    }
    const key = normalise(rawValue.trim());
    if (!key) {
      continue;
    }
    if (seen.has(key)) {
      return rawValue.trim();
    }
    seen.add(key);
  }
  return null;
};

const ChipEditor = ({
  label,
  items,
  onChange,
  placeholder,
  theme,
  normaliseValue = (value) => value.trim(),
  dedupeKey = (value) => value.toLowerCase(),
  helperText,
  inputAriaLabel
}) => {
  const [chipInput, setChipInput] = useState('');

  const addChip = () => {
    const rawValue = chipInput.trim();
    if (!rawValue) {
      return;
    }
    const normalisedValue = normaliseValue(rawValue);
    if (!normalisedValue) {
      setChipInput('');
      return;
    }
    const key = dedupeKey(normalisedValue);
    if (items.some((item) => dedupeKey(item) === key)) {
      setChipInput('');
      return;
    }
    onChange([...items, normalisedValue]);
    setChipInput('');
  };

  const removeChipAt = (index) => {
    const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
    onChange(nextItems);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addChip();
    } else if (event.key === 'Backspace' && !chipInput && items.length) {
      event.preventDefault();
      removeChipAt(items.length - 1);
    }
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div
        style={{
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          padding: '6px',
          backgroundColor: theme.cardBg,
          minHeight: '44px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: theme.primary + '20',
                color: theme.primary,
                padding: '4px 8px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => removeChipAt(index)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.primary,
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={chipInput}
            onChange={(event) => setChipInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={inputAriaLabel || label}
            style={{
              flex: '1 0 160px',
              minWidth: '140px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: theme.text
            }}
          />
        </div>
      </div>
      {helperText && (
        <small style={{ color: theme.textSecondary, display: 'block', marginTop: '4px' }}>
          {helperText}
        </small>
      )}
    </div>
  );
};

const validateProjectForm = (project) => {
  const errors = [];
  const trimmed = (value) => (typeof value === 'string' ? value.trim() : '');

  const requiredFields = [
    ['id', 'ID'],
    ['title', 'Title'],
    ['description', 'Description'],
    ['component', 'Component'],
    ['category', 'Category'],
    ['status', 'Status'],
    ['route', 'Route']
  ];

  requiredFields.forEach(([key, label]) => {
    if (!trimmed(project[key])) {
      errors.push(`${label} is required`);
    }
  });

  const routeValue = trimmed(project.route);
  if (routeValue) {
    if (!PROJECT_ROUTE_PATTERN.test(routeValue)) {
      errors.push('Route must start with "/" and contain only letters, numbers, slashes, underscores, or hyphens');
    }
  }

  if (!PROJECT_STATUS_OPTIONS.includes(project.status)) {
    errors.push(`Status must be one of: ${PROJECT_STATUS_OPTIONS.join(', ')}`);
  }

  const technologyList = Array.isArray(project.technology) ? project.technology : [];
  if (technologyList.length === 0) {
    errors.push('Add at least one technology');
  }
  const duplicateTech = findDuplicateValue(technologyList, (value) => value.trim().toLowerCase());
  if (duplicateTech) {
    errors.push(`Duplicate technology found: ${duplicateTech}`);
  }

  const tagList = Array.isArray(project.tags) ? project.tags : [];
  if (tagList.length === 0) {
    errors.push('Add at least one tag');
  }
  const duplicateTag = findDuplicateValue(tagList, (value) => value.trim().toLowerCase());
  if (duplicateTag) {
    errors.push(`Duplicate tag found: ${duplicateTag}`);
  }

  const date = project.dateCreated ? new Date(project.dateCreated) : null;
  if (!project.dateCreated || Number.isNaN(date?.getTime())) {
    errors.push('Date Created must be a valid date');
  }

  return errors;
};

const prepareProjectForSubmission = (project) => {
  const trimmed = (value) => (typeof value === 'string' ? value.trim() : '');
  const isoDate = project.dateCreated ? new Date(project.dateCreated).toISOString() : new Date().toISOString();

  const technology = sanitizeArrayValues(project.technology, {
    transform: (value) => value,
    dedupeKey: (value) => value.toLowerCase()
  });

  const tags = sanitizeArrayValues(project.tags, {
    transform: (value) => value.toLowerCase(),
    dedupeKey: (value) => value.toLowerCase()
  });

  return {
    id: trimmed(project.id),
    title: trimmed(project.title),
    description: trimmed(project.description),
    path: trimmed(project.path) || trimmed(project.route),
    component: trimmed(project.component),
    category: trimmed(project.category) || DEFAULT_PROJECT_CATEGORY,
    status: PROJECT_STATUS_OPTIONS.includes(project.status) ? project.status : DEFAULT_PROJECT_STATUS,
    technology,
    tags,
    dateCreated: isoDate,
    route: trimmed(project.route),
    thumbnail: trimmed(project.thumbnail || '')
  };
};
import { useProjects } from './contexts/ProjectsContext';
import styles from './styles/styles_admin.css';

class SessionExpiredError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'SessionExpiredError';
    this.status = status;
  }
}

function Admin() {
  const { theme } = useTheme();
  const { refresh: refreshProjectCatalog, syncProjects } = useProjects();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newProject, setNewProject] = useState(() => createDefaultProject());
  const [newProjectErrors, setNewProjectErrors] = useState([]);
  const [editProjectErrors, setEditProjectErrors] = useState([]);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('');

  const persistToken = useCallback((value) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (value) {
        sessionStorage.setItem('adminToken', value);
      } else {
        sessionStorage.removeItem('adminToken');
      }
    } catch (storageError) {
      console.warn('Unable to access sessionStorage for admin token persistence', storageError);
    }
  }, []);

  const clearAuthState = useCallback(() => {
    setIsAuthenticated(false);
    setToken('');
    setProjects([]);
    setEditingProject(null);
    persistToken(null);
  }, [persistToken]);

  const handleSessionExpired = useCallback((message) => {
    clearAuthState();
    setUsername('');
    setPassword('');
    setSessionStatus(message || 'Your session has expired. Please log in again.');
  }, [clearAuthState]);

  const fetchWithAuth = useCallback(async (input, config = {}, overrideToken) => {
    const isBrowser = typeof window !== 'undefined';
    let storedToken = '';

    if (isBrowser) {
      try {
        storedToken = sessionStorage.getItem('adminToken') || '';
      } catch (storageError) {
        console.warn('Unable to read sessionStorage for admin token', storageError);
      }
    }

    const activeToken = overrideToken || token || storedToken;

    if (!activeToken) {
      const missingTokenMessage = 'Your session has expired. Please log in again.';
      handleSessionExpired(missingTokenMessage);
      throw new SessionExpiredError(missingTokenMessage, 401);
    }

    const headers = new Headers(config.headers || {});
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }

    const requestConfig = { ...config, headers };
    const response = await fetch(input, requestConfig);

    if (response.status === 401 || response.status === 403) {
      let message = 'Your session has expired. Please log in again.';

      try {
        const errorData = await response.clone().json();
        if (errorData && typeof errorData === 'object' && errorData.error) {
          message = errorData.error;
        }
      } catch (jsonError) {
        try {
          const errorText = await response.clone().text();
          if (errorText) {
            message = errorText;
          }
        } catch (textError) {
          // Ignore parsing errors and use default message
        }
      }

      handleSessionExpired(message);
      throw new SessionExpiredError(message, response.status);
    }

    return response;
  }, [token, handleSessionExpired]);

  const loadProjects = useCallback(async (authTokenOverride) => {
    const isBrowser = typeof window !== 'undefined';
    const activeToken = authTokenOverride || token;
    const isLocalDevelopment = isBrowser && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development' ||
      activeToken === 'dev-token'
    );

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

    if (!isBrowser) {
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const apiEndpoint = `${API_BASE}/api/admin/projects`;
      console.log('Loading projects from:', apiEndpoint);

      const response = await fetchWithAuth(apiEndpoint, {}, authTokenOverride);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to load projects', response.status, errorText);
      }
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        return;
      }
      console.error('Error loading projects:', error);
    }
  }, [fetchWithAuth, token]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedToken = sessionStorage.getItem('adminToken');

    if (savedToken) {
      console.log('🔄 Restoring authentication from sessionStorage');
      setIsAuthenticated(true);
      setToken(savedToken);
      setSessionStatus('');
      loadProjects(savedToken);
    } else {
      console.log('🔓 No saved authentication found');
    }
  }, [loadProjects]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSessionStatus('');

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

        persistToken(data.token);
        console.log('sessionStorage token persisted');

        setSessionStatus('');
        console.log('Session status cleared');

        console.log('📁 Loading projects...');
        await loadProjects(data.token);

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
          persistToken('dev-token');
          setSessionStatus('');
          await loadProjects('dev-token');
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
        persistToken('dev-token');
        setSessionStatus('');
        await loadProjects('dev-token');
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

  const handleLogout = useCallback(() => {
    console.log('🚪 Logging out...');
    clearAuthState();
    setUsername('');
    setPassword('');
    setProjects([]);
    setEditingProject(null);
    setNewProject(createDefaultProject());
    setNewProjectErrors([]);
    setEditProjectErrors([]);
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminToken');
    setSessionStatus('');
    console.log('✅ Logout successful');
  }, [clearAuthState]);
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
          component: 'S9',
          category: 'Hardware',
          status: 'Active',
          technology: ['Server', 'Networking', 'Linux'],
          tags: ['server', 'networking', 'nas', 'ubuntu', 'homelab'],
          dateCreated: '2024-10-01T00:00:00.000Z',
          route: '/projects/s9',
          thumbnail: ''
        },
        {
          _id: '2',
          id: 'muse',
          title: 'Muse',
          description: 'Automated Audio Equalizer',
          path: '/projects/Muse',
          component: 'Muse',
          category: 'Hardware',
          status: 'Discontinued',
          technology: ['Audio', 'Electronics'],
          tags: ['audio', 'music', 'equalizer', 'electronics'],
          dateCreated: '2018-03-01T00:00:00.000Z',
          route: '/projects/Muse',
          thumbnail: ''
        },
        {
          _id: '3',
          id: 'el',
          title: 'EyeLearn',
          description: 'Academia AR/VR Headset',
          path: '/projects/EL',
          component: 'EL',
          category: 'Hardware',
          status: 'Paused',
          technology: ['AR/VR', 'Education'],
          tags: ['ar', 'vr', 'education', 'headset', 'learning'],
          dateCreated: '2021-09-01T00:00:00.000Z',
          route: '/projects/EL',
          thumbnail: ''
        },
        {
          _id: '4',
          id: 'nfi',
          title: 'NFI',
          description: 'Rocket Propulsion System',
          path: '/projects/NFI',
          component: 'NFI',
          category: 'Hardware',
          status: 'Completed',
          technology: ['Aerospace', 'Engineering'],
          tags: ['rocket', 'propulsion', 'aerospace', 'engineering'],
          dateCreated: '2022-03-01T00:00:00.000Z',
          route: '/projects/NFI',
          thumbnail: ''
        },
        {
          _id: '5',
          id: 'naton',
          title: 'Naton',
          description: 'Element Converter',
          path: '/projects/Naton',
          component: 'Naton',
          category: 'Hardware',
          status: 'Completed',
          technology: ['Chemistry', 'Physics'],
          tags: ['chemistry', 'physics', 'converter', 'elements'],
          dateCreated: '2020-01-15T00:00:00.000Z',
          route: '/projects/Naton',
          thumbnail: ''
        },
        {
          _id: '6',
          id: 'sos',
          title: 'sOS',
          description: 'Shadow Operating System',
          path: '/projects/sos',
          component: 'Sos',
          category: 'Software',
          status: 'In Progress',
          technology: ['Operating System', 'Low-level'],
          tags: ['os', 'system', 'low-level', 'kernel'],
          dateCreated: '2023-06-15T00:00:00.000Z',
          route: '/projects/sos',
          thumbnail: ''
        },
        {
          _id: '7',
          id: 'sim',
          title: 'S_im',
          description: 'Shadow Simulator',
          path: '/projects/sim',
          component: 'Sim',
          category: 'Software',
          status: 'In Progress',
          technology: ['Simulation', 'Software'],
          tags: ['simulation', 'software', 'development'],
          dateCreated: '2024-01-01T00:00:00.000Z',
          route: '/projects/sim',
          thumbnail: ''
        }
      ];
      setProjects(mockProjects.map(transformProjectFromApi));
      setProjects(mockProjects);
      refreshProjectCatalog();
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
        const safeProjects = Array.isArray(data.projects)
          ? data.projects.map(transformProjectFromApi)
          : [];
        setProjects(safeProjects);
        setProjects(data.projects);
        syncProjects(data.projects);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const updateNewProject = (partial) => {
    setNewProject((prev) => ({ ...prev, ...partial }));
  };

  const updateEditingProject = (partial) => {
    setEditingProject((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const handleAddProject = async (e) => {
    e.preventDefault();

    const validationMessages = validateProjectForm(newProject);
    if (validationMessages.length > 0) {
      setNewProjectErrors(validationMessages);
      return;
    }

    let submission;
    try {
      submission = prepareProjectForSubmission(newProject);
    } catch (error) {
      setNewProjectErrors([error.message]);
      return;
    }

    setNewProjectErrors([]);

    // Check if we're in development
    const isLocalDevelopment = window.location.hostname === 'localhost' ||
                              window.location.hostname === '127.0.0.1' ||
                              process.env.NODE_ENV === 'development' ||
                              token === 'dev-token';

    // Development mode - add to local state
    if (isLocalDevelopment) {
      const newProjectWithId = transformProjectFromApi({ ...submission, _id: Date.now().toString() });
      setProjects([newProjectWithId, ...projects]);
      setNewProject(createDefaultProject());
      const newProjectWithId = {
        ...newProject,
        _id: Date.now().toString()
      };
      const updatedProjects = [newProjectWithId, ...projects];
      setProjects(updatedProjects);
      syncProjects(updatedProjects);
      setNewProject({ id: '', title: '', description: '', path: '', component: '' });
      alert('Project added successfully! (Development mode)');
      return;
    }

    // Production mode
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const apiEndpoint = `${API_BASE}/api/admin/projects`;
      console.log('Adding project to:', apiEndpoint);

      const response = await fetchWithAuth(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission),
      });

      if (response.ok) {
        setNewProject(createDefaultProject());
        setNewProjectErrors([]);
        loadProjects();
        alert('Project added successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add project' }));
        const errorMessage = errorData.error || 'Failed to add project';
        setNewProjectErrors([errorMessage]);
        alert(`Failed to add project: ${errorMessage}`);
        setNewProject({ id: '', title: '', description: '', path: '', component: '' });
        await loadProjects();
        alert('Project added successfully!');
      } else {
        const errorDetails = await response.text().catch(() => 'Failed to add project');
        console.error('Failed to add project:', response.status, errorDetails);
        alert('Failed to add project');
      }
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        return;
      }
      console.error('Error adding project:', error);
      setNewProjectErrors([error.message || 'Unexpected error while adding project']);
      alert('Failed to add project');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    if (!editingProject) {
      return;
    }

    const validationMessages = validateProjectForm(editingProject);
    if (validationMessages.length > 0) {
      setEditProjectErrors(validationMessages);
      return;
    }

    let submission;
    try {
      submission = prepareProjectForSubmission(editingProject);
    } catch (error) {
      setEditProjectErrors([error.message]);
      return;
    }

    setEditProjectErrors([]);

    // Check if we're in development
    const isLocalDevelopment = window.location.hostname === 'localhost' ||
                              window.location.hostname === '127.0.0.1' ||
                              process.env.NODE_ENV === 'development' ||
                              token === 'dev-token';

    // Development mode - update local state
    if (isLocalDevelopment) {
      const updatedProjectForState = transformProjectFromApi({ ...submission, _id: editingProject._id });
      setProjects(projects.map((project) =>
        project._id === editingProject._id ? updatedProjectForState : project
      ));
      const updatedProjects = projects.map(p =>
        p._id === editingProject._id ? editingProject : p
      );
      setProjects(updatedProjects);
      syncProjects(updatedProjects);
      setEditingProject(null);
      setEditProjectErrors([]);
      alert('Project updated successfully! (Development mode)');
      return;
    }

    // Production mode
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
      const apiEndpoint = `${API_BASE}/api/admin/projects/${editingProject._id}`;
      console.log('Updating project at:', apiEndpoint);

      const response = await fetchWithAuth(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission),
      });

      if (response.ok) {
        setEditingProject(null);
        setEditProjectErrors([]);
        loadProjects();
        alert('Project updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update project' }));
        const errorMessage = errorData.error || 'Failed to update project';
        setEditProjectErrors([errorMessage]);
        alert(`Failed to update project: ${errorMessage}`);
        await loadProjects();
        alert('Project updated successfully!');
      } else {
        const errorDetails = await response.text().catch(() => 'Failed to update project');
        console.error('Failed to update project:', response.status, errorDetails);
        alert('Failed to update project');
      }
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        return;
      }
      console.error('Error updating project:', error);
      setEditProjectErrors([error.message || 'Unexpected error while updating project']);
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
        if (editingProject && editingProject._id === projectId) {
          setEditingProject(null);
        }
        setEditProjectErrors([]);
        const updatedProjects = projects.filter(p => p._id !== projectId);
        setProjects(updatedProjects);
        syncProjects(updatedProjects);
        alert('Project deleted successfully! (Development mode)');
        return;
      }

      // Production mode
      try {
        const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;
        const apiEndpoint = `${API_BASE}/api/admin/projects/${projectId}`;
        console.log('Deleting project at:', apiEndpoint);

        const response = await fetchWithAuth(apiEndpoint, {
          method: 'DELETE'
        });

        if (response.ok) {
          loadProjects();
          if (editingProject && editingProject._id === projectId) {
            setEditingProject(null);
          }
          setEditProjectErrors([]);
          await loadProjects();
          alert('Project deleted successfully!');
        } else {
          const errorDetails = await response.text().catch(() => 'Failed to delete project');
          console.error('Failed to delete project:', response.status, errorDetails);
          alert('Failed to delete project');
        }
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          return;
        }
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

      const response = await fetchWithAuth(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      if (error instanceof SessionExpiredError) {
        setChatResponse('Session expired. Please log in again.');
        return;
      }
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
          {sessionStatus && (
            <div
              className="session-status"
              role="alert"
              aria-live="assertive"
              style={{
                color: theme.danger,
                border: `1px solid ${theme.danger}`,
                backgroundColor: `${theme.danger}20`,
                padding: '12px',
                borderRadius: '6px',
                marginTop: '12px',
                marginBottom: '12px'
              }}
            >
              {sessionStatus}
            </div>
          )}
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
          {newProjectErrors.length > 0 && (
            <div
              role="alert"
              style={{
                border: `1px solid ${theme.danger}`,
                backgroundColor: `${theme.danger}15`,
                color: theme.danger,
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px'
              }}
            >
              <strong style={{ display: 'block', marginBottom: '6px' }}>Please resolve the following:</strong>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {newProjectErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <form onSubmit={handleAddProject} className="project-form">
            <div className="form-row">
              <div className="form-group">
                <label>ID:</label>
                <input
                  type="text"
                  value={newProject.id}
                  onChange={(e) => updateNewProject({ id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Route:</label>
                <input
                  type="text"
                  value={newProject.route}
                  placeholder="/projects/my-project"
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewProject((prev) => {
                      const next = { ...prev, route: value };
                      if (!prev.path || prev.path === prev.route) {
                        next.path = value;
                      }
                      return next;
                    });
                  }}
                  required
                />
                <small style={{ display: 'block', color: theme.textSecondary, marginTop: '4px' }}>
                  Must start with “/” and use letters, numbers, slashes, underscores, or hyphens.
                </small>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => updateNewProject({ title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select
                  value={newProject.category}
                  onChange={(e) => updateNewProject({ category: e.target.value })}
                  required
                >
                  {PROJECT_CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={newProject.status}
                  onChange={(e) => updateNewProject({ status: e.target.value })}
                  required
                >
                  {PROJECT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date Created:</label>
                <input
                  type="date"
                  value={formatDateForInput(newProject.dateCreated)}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateNewProject({ dateCreated: value ? new Date(value).toISOString() : '' });
                  }}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={newProject.description}
                onChange={(e) => updateNewProject({ description: e.target.value })}
                rows={2}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  backgroundColor: theme.cardBg,
                  color: theme.text,
                  resize: 'vertical'
                }}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Path:</label>
                <input
                  type="text"
                  value={newProject.path}
                  onChange={(e) => updateNewProject({ path: e.target.value })}
                  placeholder="Defaults to route if left empty"
                />
              </div>
              <div className="form-group">
                <label>Component:</label>
                <input
                  type="text"
                  value={newProject.component}
                  onChange={(e) => updateNewProject({ component: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Thumbnail URL (optional):</label>
              <input
                type="url"
                value={newProject.thumbnail}
                onChange={(e) => updateNewProject({ thumbnail: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            <ChipEditor
              label="Technology"
              items={newProject.technology}
              onChange={(items) => updateNewProject({ technology: items })}
              placeholder="Press Enter to add a technology"
              theme={theme}
              helperText="List the key technologies that will display on the project card."
              inputAriaLabel="Add technology"
            />
            <ChipEditor
              label="Tags"
              items={newProject.tags}
              onChange={(items) => updateNewProject({ tags: items })}
              placeholder="Press Enter to add a tag"
              theme={theme}
              normaliseValue={(value) => value.trim().toLowerCase()}
              dedupeKey={(value) => value.toLowerCase()}
              helperText="Tags are saved in lowercase and power search and filtering."
              inputAriaLabel="Add tag"
            />
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
                    {editProjectErrors.length > 0 && (
                      <div
                        role="alert"
                        style={{
                          border: `1px solid ${theme.danger}`,
                          backgroundColor: `${theme.danger}15`,
                          color: theme.danger,
                          padding: '12px',
                          borderRadius: '6px',
                          marginBottom: '16px'
                        }}
                      >
                        <strong style={{ display: 'block', marginBottom: '6px' }}>Please resolve the following:</strong>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {editProjectErrors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="form-row">
                      <div className="form-group">
                        <label>ID:</label>
                        <input
                          type="text"
                          value={editingProject.id}
                          onChange={(e) => updateEditingProject({ id: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Route:</label>
                        <input
                          type="text"
                          value={editingProject.route}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEditingProject((prev) => {
                              if (!prev) {
                                return prev;
                              }
                              const next = { ...prev, route: value };
                              if (!prev.path || prev.path === prev.route) {
                                next.path = value;
                              }
                              return next;
                            });
                          }}
                          required
                        />
                        <small style={{ display: 'block', color: theme.textSecondary, marginTop: '4px' }}>
                          Must start with “/” and use letters, numbers, slashes, underscores, or hyphens.
                        </small>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Title:</label>
                        <input
                          type="text"
                          value={editingProject.title}
                          onChange={(e) => updateEditingProject({ title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Category:</label>
                        <select
                          value={editingProject.category}
                          onChange={(e) => updateEditingProject({ category: e.target.value })}
                          required
                        >
                          {PROJECT_CATEGORY_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Status:</label>
                        <select
                          value={editingProject.status}
                          onChange={(e) => updateEditingProject({ status: e.target.value })}
                          required
                        >
                          {PROJECT_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Date Created:</label>
                        <input
                          type="date"
                          value={formatDateForInput(editingProject.dateCreated)}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateEditingProject({ dateCreated: value ? new Date(value).toISOString() : '' });
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description:</label>
                      <textarea
                        value={editingProject.description}
                        onChange={(e) => updateEditingProject({ description: e.target.value })}
                        rows={2}
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          backgroundColor: theme.cardBg,
                          color: theme.text,
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Path:</label>
                        <input
                          type="text"
                          value={editingProject.path}
                          onChange={(e) => updateEditingProject({ path: e.target.value })}
                          placeholder="Defaults to route if left empty"
                        />
                      </div>
                      <div className="form-group">
                        <label>Component:</label>
                        <input
                          type="text"
                          value={editingProject.component}
                          onChange={(e) => updateEditingProject({ component: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Thumbnail URL (optional):</label>
                      <input
                        type="url"
                        value={editingProject.thumbnail}
                        onChange={(e) => updateEditingProject({ thumbnail: e.target.value })}
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>
                    <ChipEditor
                      label="Technology"
                      items={editingProject.technology}
                      onChange={(items) => updateEditingProject({ technology: items })}
                      placeholder="Press Enter to update technology"
                      theme={theme}
                      helperText="These appear on the public project grid."
                      inputAriaLabel="Edit technology"
                    />
                    <ChipEditor
                      label="Tags"
                      items={editingProject.tags}
                      onChange={(items) => updateEditingProject({ tags: items })}
                      placeholder="Press Enter to update tag"
                      theme={theme}
                      normaliseValue={(value) => value.trim().toLowerCase()}
                      dedupeKey={(value) => value.toLowerCase()}
                      helperText="Tags remain lowercase for consistent filtering."
                      inputAriaLabel="Edit tag"
                    />
                    <div className="edit-actions">
                      <button type="submit" className="save-btn">Save</button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProject(null);
                          setEditProjectErrors([]);
                        }}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="project-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div>
                        <div style={{
                          display: 'inline-block',
                          background: theme.secondary,
                          color: theme.textSecondary,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 500,
                          marginBottom: '8px'
                        }}>
                          {project.category}
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: theme.text }}>{project.title}</h3>
                        <p style={{ margin: 0, color: theme.textSecondary }}>{project.description}</p>
                      </div>
                      <div style={{
                        background: getStatusColor(project.status, theme),
                        color: '#fff',
                        padding: '6px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 600
                      }}>
                        <span>{getStatusIcon(project.status)}</span>
                        {project.status}
                      </div>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '8px',
                      marginTop: '16px',
                      color: theme.text
                    }}>
                      <div><strong>ID:</strong> {project.id}</div>
                      <div><strong>Route:</strong> {project.route || '—'}</div>
                      <div><strong>Path:</strong> {project.path || '—'}</div>
                      <div><strong>Component:</strong> {project.component || '—'}</div>
                      <div><strong>Date Created:</strong> {formatDateForDisplay(project.dateCreated)}</div>
                      <div><strong>Thumbnail:</strong> {project.thumbnail ? 'Provided' : 'Not set'}</div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <strong>Technology:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {project.technology && project.technology.length > 0 ? (
                          project.technology.map((tech, index) => (
                            <span
                              key={`${project._id}-tech-${index}`}
                              style={{
                                background: theme.primary + '20',
                                color: theme.primary,
                                padding: '4px 8px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 500
                              }}
                            >
                              {tech}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: theme.textSecondary }}>No technology listed</span>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <strong>Tags:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {project.tags && project.tags.length > 0 ? (
                          project.tags.map((tag, index) => (
                            <span
                              key={`${project._id}-tag-${index}`}
                              style={{
                                background: theme.surface,
                                border: `1px solid ${theme.border}`,
                                color: theme.textSecondary,
                                padding: '3px 8px',
                                borderRadius: '999px',
                                fontSize: '12px'
                              }}
                            >
                              #{tag}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: theme.textSecondary }}>No tags added</span>
                        )}
                      </div>
                    </div>
                    {project.thumbnail && (
                      <div style={{ marginTop: '12px' }}>
                        <strong>Thumbnail preview:</strong>
                        <div style={{ marginTop: '8px' }}>
                          <img
                            src={project.thumbnail}
                            alt={`${project.title} thumbnail`}
                            style={{
                              maxWidth: '200px',
                              borderRadius: '8px',
                              border: `1px solid ${theme.border}`,
                              boxShadow: `0 2px 6px ${theme.shadow}`
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="project-actions">
                      <button
                        onClick={() => {
                          setEditProjectErrors([]);
                          setEditingProject(cloneProjectForEditing(project));
                        }}
                        className="edit-btn"
                      >
                        Edit
                      </button>
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