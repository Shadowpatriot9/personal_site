import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProjectsProvider } from './contexts/ProjectsContext';

import Main from './Main';
import Admin from './Admin';
import Input from './Input';

// Lazy load project components for better performance
const S9 = React.lazy(() => import('./projects/s9'));
const Muse = React.lazy(() => import('./projects/muse'));
const EL = React.lazy(() => import('./projects/EL'));
const NFI = React.lazy(() => import('./projects/NFI'));
const Naton = React.lazy(() => import('./projects/Naton'));
const Sos = React.lazy(() => import('./projects/sos'));
const Sim = React.lazy(() => import('./projects/sim'));

// Loading component for lazy-loaded components
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'SF Pro, -apple-system, sans-serif',
    fontSize: '1.2rem',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-background)'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{ marginBottom: '10px' }}>⚡ Loading...</div>
      <div style={{ fontSize: '0.9rem', color: 'var(--color-textSecondary)' }}>
        Please wait while we load the page
      </div>
    </div>
  </div>
);

// **template** import name_of_page_ from './projects/**/**';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0,0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <ProjectsProvider>
        <div>
      {/* Global Font Family */}
      {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link href="https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@100..1000&display=swap" rel="stylesheet" /> */}

      {/* Vercel Analytics */}
      <Analytics id="PZ9X7E3YVX" />

      <ScrollToTop />

      {/* Main to Sub Page Setup */}  
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/projects/s9" element={
            <Suspense fallback={<PageLoader />}>
              <S9 />
            </Suspense>
          } />
          <Route path="/projects/muse" element={
            <Suspense fallback={<PageLoader />}>
              <Muse />
            </Suspense>
          } />
          <Route path="/projects/EL" element={
            <Suspense fallback={<PageLoader />}>
              <EL />
            </Suspense>
          } />
          <Route path="/projects/NFI" element={
            <Suspense fallback={<PageLoader />}>
              <NFI />
            </Suspense>
          } />
          <Route path="/projects/Naton" element={
            <Suspense fallback={<PageLoader />}>
              <Naton />
            </Suspense>
          } />
          <Route path="/projects/sos" element={
            <Suspense fallback={<PageLoader />}>
              <Sos />
            </Suspense>
          } />
          <Route path="/projects/sim" element={
            <Suspense fallback={<PageLoader />}>
              <Sim />
            </Suspense>
          } />
          <Route path="/Input" element={<Input />} />
          <Route path="/admin" element={<Admin />} />

          {/* **template** <Route path="/projects/**" element={<name_of_page_ />} /> */}

        </Routes>
        </div>
    </ProjectsProvider>
    </ThemeProvider>
  );
}

export default App;
