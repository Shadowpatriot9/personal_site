# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
- **Start development server**: `npm start` (React dev server on port 3000)
- **Build for production**: `npm run build` (creates optimized build in `build/`)
- **Run tests**: `npm test` (Jest test runner)
- **Setup admin panel**: `node setup-admin.js` (generates password hash and JWT secret)

### Testing & Quality
- **Test admin functionality**: `node test-admin.js`

### Deployment
- Deploys automatically to Vercel on push to main branch
- Build output: `build/` directory
- API routes: `api/` directory (serverless functions)

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 with React Router DOM for navigation
- **Backend**: Serverless API functions (Vercel/Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Deployment**: Vercel with static build optimization
- **Analytics**: Vercel Analytics integrated

### Application Structure

**Core Components:**
- `App.js` - Main routing configuration with all project routes, wrapped with ThemeProvider
- `Main.js` - Home page with project grid, animations, splash screen, and user interaction logging
- `Admin.js` - Admin panel with project management, analytics dashboard, performance monitor, and ChatGPT integration
- `Input.js` - Input component (referenced but purpose unclear from codebase)

**Project Pages:**
All project components follow a consistent pattern in `src/projects/`:
- Individual project pages (S9, Muse, EL, NFI, Naton, Sos, Sim)
- `template.js` - Template for creating new project pages
- Each project has its own route defined in `App.js`

**Components:**
- `src/components/AnalyticsDashboard.js` - Real-time analytics dashboard with visitor metrics
- `src/components/PerformanceMonitor.js` - Core Web Vitals and performance monitoring
- `src/components/ThemeSwitcher.js` - Theme toggle component
- `src/contexts/ThemeContext.js` - Theme context provider for dynamic theming
- `src/utils/logger.js` - Centralized logging utility for user interactions and analytics

**Styling:**
- Main styles: `src/styles/styles_page.css`
- Mobile responsive: `src/styles/styles_mobile.css`  
- Sub-page styles: `src/styles/styles_sub.module.css`
- Admin panel: `src/styles/styles_admin.css`

### Key Features

**Admin Panel:**
- JWT-based authentication with development fallback
- Full CRUD operations for projects
- Real-time analytics dashboard with visitor metrics and page view tracking
- Performance monitoring dashboard with Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
- ChatGPT AI assistant integration for development help
- Development mode with mock data when MongoDB unavailable
- Comprehensive logging of all admin interactions
- Access via clicking "GS" button on homepage

**Project Management:**
- Dynamic project routing system
- Template-based project page creation
- Consistent navigation and footer across all pages
- Projects displayed in grid layout on homepage

**Advanced Features:**
- **Dynamic Theming**: Multiple color schemes with theme persistence
- **Analytics Integration**: Real-time visitor tracking and page view analytics
- **Performance Monitoring**: Core Web Vitals tracking and error reporting
- **AI Integration**: ChatGPT assistant in admin panel for development help
- **Comprehensive Logging**: User interactions, performance metrics, and error tracking
- **Theme Switching**: User-selectable themes with context provider architecture

**Deployment Configuration:**
- Vercel static build optimization
- API routes handled as serverless functions (`api/` directory)
- MongoDB connection caching for performance
- Environment-based configuration with canonical API base URLs
- Analytics tracking integrated with Vercel Analytics (ID: PZ9X7E3YVX)
- Performance monitoring and error tracking in production

## Development Workflow

### Adding New Projects
1. Create new component in `src/projects/` using `template.js`
2. Add route to `App.js` routes array
3. Add import statement to `App.js`
4. Add project card to `Main.js` projects grid
5. Update admin panel to include new project (if using dynamic management)

### Admin Panel Development
- Development credentials: `shadowpatriot9` / `16196823`
- Production requires environment variables setup via `setup-admin.js`
- Admin panel works offline in development with mock project data

### API Endpoints
- `/api/admin/login` - Admin authentication endpoint
- `/api/admin/chatgpt` - ChatGPT AI assistant integration
- `/api/admin/projects` - CRUD operations for project management
- `/api/saveData` - General data storage endpoint
- `/api/analytics` - Analytics data collection (if implemented)

### Environment Configuration
- Development: Uses `.env.development` with fallback authentication
- Production: Requires `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, `MONGO_URI`, `OPENAI_API_KEY`
- Optional: `REACT_APP_API_BASE` for canonical API base URL configuration

### Database Schema
- **Projects**: `id`, `title`, `description`, `path`, `component`, `_id` (MongoDB ObjectId)
- **Analytics**: User interactions, page views, performance metrics (via logger utility)
- **Logs**: Comprehensive logging of user actions, errors, and system events
- Data models in `api/saveData.js` for general data storage
- MongoDB collections managed through Mongoose ODM

## Important Notes

- The site owner is Grayden Scovil, a developer from Colorado
- Live site: https://mgds.me/
- Uses Vercel Analytics with tracking ID: PZ9X7E3YVX
- Admin panel accessible by clicking the "GS" header button
- All project pages maintain consistent header/footer structure
- Splash screen animation on homepage with 500ms fade delay
- Mobile-responsive design with separate CSS file

## Recent Updates & Features

### Performance Monitoring (Latest)
- **Core Web Vitals**: Real-time tracking of LCP, FID, CLS, FCP, and TTFB
- **Memory Usage**: JavaScript heap size monitoring in supported browsers
- **Error Tracking**: Automatic capture of JavaScript errors and unhandled promise rejections
- **Navigation Timing**: Page load performance metrics with performance thresholds
- **Integration**: Fully integrated into admin panel with theme-aware UI

### Analytics & Logging
- **Centralized Logger**: `src/utils/logger.js` for all user interactions and system events
- **Page View Tracking**: Automatic logging of page visits and navigation
- **User Interaction Logging**: Clicks, theme changes, and admin actions
- **Analytics Dashboard**: Real-time visitor metrics and engagement data

### AI Integration
- **ChatGPT Assistant**: Integrated into admin panel for development help
- **Demo Mode**: Fallback responses when OpenAI API is unavailable
- **Conversation Logging**: All AI interactions logged for analysis

### Theme System
- **Dynamic Theming**: Multiple color schemes with persistence
- **Theme Context**: React context provider for theme management
- **Theme Switcher**: Component for user theme selection
- **CSS Variables**: Modern CSS custom properties for theme switching
