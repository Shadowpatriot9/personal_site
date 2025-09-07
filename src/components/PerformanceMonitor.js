import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

const PerformanceMonitor = () => {
  const { theme } = useTheme();
  const [performance, setPerformance] = useState({
    core: {
      lcp: null,  // Largest Contentful Paint
      fid: null,  // First Input Delay
      cls: null,  // Cumulative Layout Shift
      fcp: null,  // First Contentful Paint
      ttfb: null, // Time to First Byte
    },
    navigation: {
      loadTime: null,
      domReady: null,
      resourcesLoaded: null,
    },
    memory: {
      usedJSHeapSize: null,
      totalJSHeapSize: null,
      jsHeapSizeLimit: null,
    },
    errors: [],
    warnings: []
  });

  useEffect(() => {
    // Measure Core Web Vitals
    const measureCoreWebVitals = () => {
      // Performance Navigation Timing
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        const ttfb = timing.responseStart - timing.navigationStart;

        setPerformance(prev => ({
          ...prev,
          navigation: {
            loadTime,
            domReady,
            resourcesLoaded: timing.loadEventEnd - timing.domContentLoadedEventEnd,
          },
          core: {
            ...prev.core,
            ttfb,
          }
        }));

        // Log performance data
        logger.performance('page-load', loadTime, 'ms');
        logger.performance('dom-ready', domReady, 'ms');
        logger.performance('ttfb', ttfb, 'ms');
      }

      // Memory Usage (if available)
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        setPerformance(prev => ({
          ...prev,
          memory: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          }
        }));
      }
    };

    // Web Vitals using PerformanceObserver (if available)
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setPerformance(prev => ({
            ...prev,
            core: { ...prev.core, lcp: lastEntry.startTime }
          }));
          logger.performance('lcp', lastEntry.startTime, 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            setPerformance(prev => ({
              ...prev,
              core: { ...prev.core, fid: entry.processingStart - entry.startTime }
            }));
            logger.performance('fid', entry.processingStart - entry.startTime, 'ms');
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          setPerformance(prev => ({
            ...prev,
            core: { ...prev.core, cls: clsValue }
          }));
          logger.performance('cls', clsValue, 'score');
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              setPerformance(prev => ({
                ...prev,
                core: { ...prev.core, fcp: entry.startTime }
              }));
              logger.performance('fcp', entry.startTime, 'ms');
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }

    // Error tracking
    const handleError = (event) => {
      const error = {
        message: event.error?.message || event.message,
        stack: event.error?.stack || 'No stack trace',
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };
      
      setPerformance(prev => ({
        ...prev,
        errors: [...prev.errors.slice(-9), error] // Keep last 10 errors
      }));
      
      logger.error('javascript-error', event.error || event, { url: window.location.href });
    };

    const handleUnhandledRejection = (event) => {
      const error = {
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack || 'No stack trace',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        type: 'promise-rejection'
      };
      
      setPerformance(prev => ({
        ...prev,
        errors: [...prev.errors.slice(-9), error]
      }));
      
      logger.error('promise-rejection', event.reason, { url: window.location.href });
    };

    // Run measurements
    setTimeout(measureCoreWebVitals, 1000); // Give page time to load
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (ms) => {
    if (ms === null || ms === undefined) return 'N/A';
    return `${Math.round(ms)}ms`;
  };

  const getPerformanceStatus = (metric, value) => {
    if (value === null || value === undefined) return 'unknown';
    
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      case 'fcp':
        return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
      case 'ttfb':
        return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
      case 'loadTime':
        return value <= 2000 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      default:
        return 'unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return theme.success;
      case 'needs-improvement': return theme.warning;
      case 'poor': return theme.danger;
      default: return theme.textSecondary;
    }
  };

  const MetricCard = ({ title, value, unit = 'ms', metric, description }) => {
    const status = getPerformanceStatus(metric, value);
    const color = getStatusColor(status);
    
    return (
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: color,
          marginBottom: '4px' 
        }}>
          {value !== null ? (unit === 'ms' ? formatTime(value) : 
                            unit === 'bytes' ? formatBytes(value) : 
                            typeof value === 'number' ? value.toFixed(3) : value) : 'N/A'}
        </div>
        <div style={{ 
          fontSize: '10px', 
          color: theme.textSecondary,
          textTransform: 'uppercase',
          fontWeight: '500'
        }}>
          {status.replace('-', ' ')}
        </div>
        {description && (
          <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '4px' }}>
            {description}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
    }}>
      <h3 style={{
        color: theme.text,
        marginTop: 0,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        ⚡ Performance Monitor
      </h3>

      {/* Core Web Vitals */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: theme.text, fontSize: '14px', marginBottom: '12px' }}>
          Core Web Vitals
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}>
          <MetricCard 
            title="LCP" 
            value={performance.core.lcp} 
            metric="lcp"
            description="Largest Contentful Paint"
          />
          <MetricCard 
            title="FID" 
            value={performance.core.fid} 
            metric="fid"
            description="First Input Delay"
          />
          <MetricCard 
            title="CLS" 
            value={performance.core.cls} 
            unit="score" 
            metric="cls"
            description="Cumulative Layout Shift"
          />
          <MetricCard 
            title="FCP" 
            value={performance.core.fcp} 
            metric="fcp"
            description="First Contentful Paint"
          />
        </div>
      </div>

      {/* Navigation Timing */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: theme.text, fontSize: '14px', marginBottom: '12px' }}>
          Navigation Timing
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}>
          <MetricCard 
            title="Load Time" 
            value={performance.navigation.loadTime} 
            metric="loadTime"
            description="Total page load"
          />
          <MetricCard 
            title="DOM Ready" 
            value={performance.navigation.domReady} 
            description="DOM content loaded"
          />
          <MetricCard 
            title="TTFB" 
            value={performance.core.ttfb} 
            metric="ttfb"
            description="Time to First Byte"
          />
        </div>
      </div>

      {/* Memory Usage */}
      {performance.memory.usedJSHeapSize && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: theme.text, fontSize: '14px', marginBottom: '12px' }}>
            Memory Usage
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            <MetricCard 
              title="Used Heap" 
              value={performance.memory.usedJSHeapSize} 
              unit="bytes"
              description="JavaScript memory used"
            />
            <MetricCard 
              title="Total Heap" 
              value={performance.memory.totalJSHeapSize} 
              unit="bytes"
              description="Total allocated memory"
            />
          </div>
        </div>
      )}

      {/* Error Summary */}
      {performance.errors.length > 0 && (
        <div>
          <h4 style={{ color: theme.danger, fontSize: '14px', marginBottom: '12px' }}>
            Recent Errors ({performance.errors.length})
          </h4>
          <div style={{
            background: theme.background,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            {performance.errors.slice(-5).map((error, index) => (
              <div key={index} style={{
                padding: '8px 12px',
                borderBottom: index < performance.errors.length - 1 ? `1px solid ${theme.border}` : 'none',
              }}>
                <div style={{ fontSize: '12px', color: theme.danger, fontWeight: '600' }}>
                  {error.message}
                </div>
                <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                  {new Date(error.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
