import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import { ThemeProvider } from './contexts/ThemeContext';
import { ProjectsProvider } from './contexts/ProjectsContext';

import Main from './Main';
import Admin from './Admin';
import Input from './Input';

const projectPages = [
  { path: '/projects/s9', Component: lazy(() => import('./projects/s9')) },
  { path: '/projects/muse', Component: lazy(() => import('./projects/muse')) },
  { path: '/projects/EL', Component: lazy(() => import('./projects/EL')) },
  { path: '/projects/NFI', Component: lazy(() => import('./projects/NFI')) },
  { path: '/projects/Naton', Component: lazy(() => import('./projects/Naton')) },
  { path: '/projects/sos', Component: lazy(() => import('./projects/sos')) },
  { path: '/projects/sim', Component: lazy(() => import('./projects/sim')) },
];

const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'SF Pro, -apple-system, sans-serif',
      fontSize: '1.2rem',
      color: 'var(--color-text)',
      backgroundColor: 'var(--color-background)',
    }}
  >
    <div
      style={{
        textAlign: 'center',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div style={{ marginBottom: '10px' }}>⚡ Loading…</div>
      <div style={{ fontSize: '0.9rem', color: 'var(--color-textSecondary)' }}>
        Please wait while we load the page.
      </div>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname]);

  return null;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Main />} />
    {projectPages.map(({ path, Component }) => (
      <Route
        key={path}
        path={path}
        element={(
          <Suspense fallback={<PageLoader />}>
            <Component />
          </Suspense>
        )}
      />
    ))}
    <Route path="/Input" element={<Input />} />
    <Route path="/admin" element={<Admin />} />
  </Routes>
);

function App() {
  return (
    <ThemeProvider>
      <ProjectsProvider>
        <ScrollToTop />
        <Analytics />
        <AppRoutes />
      </ProjectsProvider>
    </ThemeProvider>
  );
}

export default App;
