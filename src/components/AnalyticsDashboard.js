import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

const AnalyticsDashboard = () => {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState({
    pageViews: [],
    interactions: [],
    performance: {},
    realTimeData: {
      activeUsers: 1,
      todayViews: 0,
      popularProjects: {},
      recentActivity: []
    }
  });
  const [refreshCount, setRefreshCount] = useState(0);

  // Simulate real-time data updates
  useEffect(() => {
    const updateAnalytics = () => {
      // Get all logged data
      const logs = logger.getLogs();
      const sessionData = getSessionAnalytics();
      
      // Process page views
      const pageViews = logs.filter(log => log.type === 'PAGE_VIEW');
      const today = new Date().toDateString();
      const todayViews = pageViews.filter(view => 
        new Date(view.timestamp).toDateString() === today
      ).length;

      // Process interactions to find popular projects
      const interactions = getInteractionData();
      const popularProjects = getPopularProjects(interactions);
      
      // Get recent activity
      const recentActivity = logs.slice(-10).reverse();

      setAnalytics({
        pageViews,
        interactions,
        performance: sessionData.performance,
        realTimeData: {
          activeUsers: Math.max(1, Math.floor(Math.random() * 5) + 1), // Simulate active users
          todayViews,
          popularProjects,
          recentActivity
        }
      });
      
      setRefreshCount(prev => prev + 1);
    };

    // Initial load
    updateAnalytics();

    // Update every 30 seconds
    const interval = setInterval(updateAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSessionAnalytics = () => {
    const startTime = sessionStorage.getItem('sessionStart') || Date.now();
    const sessionDuration = Date.now() - parseInt(startTime);
    
    return {
      sessionDuration,
      performance: {
        loadTime: performance.timing ? 
          performance.timing.loadEventEnd - performance.timing.navigationStart : null,
        domContentLoaded: performance.timing ?
          performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart : null
      }
    };
  };

  const getInteractionData = () => {
    const logs = logger.getLogs();
    return logs.filter(log => log.url && log.url.includes('interaction'));
  };

  const getPopularProjects = (interactions) => {
    const projectClicks = {};
    interactions.forEach(interaction => {
      // This is a simplified version - in reality you'd parse interaction data better
      const projectMatch = interaction.url?.match(/projects\/(\w+)/);
      if (projectMatch) {
        const project = projectMatch[1];
        projectClicks[project] = (projectClicks[project] || 0) + 1;
      }
    });
    return projectClicks;
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const StatCard = ({ icon, title, value, subtitle, color = theme.primary }) => (
    <div style={{
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      transition: 'transform 0.3s ease',
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: color,
        marginBottom: '4px' 
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: '14px', 
        color: theme.text,
        marginBottom: '2px',
        fontWeight: '500'
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ 
          fontSize: '12px', 
          color: theme.textSecondary 
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{
          color: theme.text,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          📊 Live Analytics Dashboard
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: theme.textSecondary,
          fontSize: '14px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: theme.success,
            animation: 'pulse 2s infinite',
          }} />
          Live • Updated {refreshCount} times
        </div>
      </div>

      {/* Real-time Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <StatCard
          icon="👥"
          title="Active Users"
          value={analytics.realTimeData.activeUsers}
          subtitle="Currently online"
          color={theme.success}
        />
        <StatCard
          icon="👀"
          title="Page Views"
          value={analytics.realTimeData.todayViews}
          subtitle="Today"
          color={theme.primary}
        />
        <StatCard
          icon="📱"
          title="Session Duration"
          value={formatDuration(getSessionAnalytics().sessionDuration)}
          subtitle="Current session"
          color={theme.warning}
        />
        <StatCard
          icon="⚡"
          title="Load Time"
          value={analytics.performance.loadTime ? 
            `${Math.round(analytics.performance.loadTime)}ms` : 'N/A'
          }
          subtitle="Page performance"
          color={analytics.performance.loadTime && analytics.performance.loadTime < 2000 ? 
            theme.success : theme.warning}
        />
      </div>

      {/* Popular Projects */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          color: theme.text,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          🔥 Most Viewed Projects
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
        }}>
          {Object.entries(analytics.realTimeData.popularProjects)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 4)
            .map(([project, views]) => (
              <div
                key={project}
                style={{
                  background: theme.secondary,
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: theme.primary,
                  marginBottom: '4px',
                }}>
                  {views}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: theme.text,
                  textTransform: 'uppercase',
                  fontWeight: '500',
                }}>
                  {project}
                </div>
              </div>
            ))
          }
          {Object.keys(analytics.realTimeData.popularProjects).length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: theme.textSecondary,
              padding: '20px',
            }}>
              📈 Start browsing projects to see popularity data
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <h3 style={{
          color: theme.text,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          🕐 Recent Activity
        </h3>
        <div style={{
          background: theme.background,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          {analytics.realTimeData.recentActivity.length > 0 ? (
            analytics.realTimeData.recentActivity.map((activity, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  borderBottom: index < analytics.realTimeData.recentActivity.length - 1 ? 
                    `1px solid ${theme.border}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{
                  fontSize: '16px',
                  minWidth: '20px',
                }}>
                  {activity.type === 'PAGE_VIEW' ? '👀' : 
                   activity.type === 'USER_INTERACTION' ? '🖱️' : 
                   activity.type === 'ERROR' ? '❌' : '📊'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    color: theme.text,
                    marginBottom: '2px',
                  }}>
                    {activity.type === 'PAGE_VIEW' ? `Viewed ${activity.page}` :
                     activity.type === 'USER_INTERACTION' ? `Clicked ${activity.element || 'element'}` :
                     activity.type === 'ERROR' ? `Error: ${activity.message}` :
                     'Activity logged'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.textSecondary,
                  }}>
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {activity.url && (
                  <div style={{
                    fontSize: '11px',
                    color: theme.textSecondary,
                    backgroundColor: theme.secondary,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {activity.url.split('/').pop() || 'homepage'}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: theme.textSecondary,
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
              <div>No recent activity</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Activity will appear as you navigate the site
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
