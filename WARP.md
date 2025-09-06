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
- `App.js` - Main routing configuration with all project routes
- `Main.js` - Home page with project grid, animations, and splash screen
- `Admin.js` - Admin panel for project management (CRUD operations)
- `Input.js` - Input component (referenced but purpose unclear from codebase)

**Project Pages:**
All project components follow a consistent pattern in `src/projects/`:
- Individual project pages (S9, Muse, EL, NFI, Naton, Sos, Sim)
- `template.js` - Template for creating new project pages
- Each project has its own route defined in `App.js`

**Styling:**
- Main styles: `src/styles/styles_page.css`
- Mobile responsive: `src/styles/styles_mobile.css`  
- Sub-page styles: `src/styles/styles_sub.module.css`
- Admin panel: `src/styles/styles_admin.css`

### Key Features

**Admin Panel:**
- JWT-based authentication with development fallback
- Full CRUD operations for projects
- Real-time project management
- Development mode with mock data when MongoDB unavailable
- Access via clicking "GS" button on homepage

**Project Management:**
- Dynamic project routing system
- Template-based project page creation
- Consistent navigation and footer across all pages
- Projects displayed in grid layout on homepage

**Deployment Configuration:**
- Vercel static build optimization
- API routes handled as serverless functions
- MongoDB connection caching for performance
- Environment-based configuration

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

### Environment Configuration
- Development: Uses `.env.development` with fallback authentication
- Production: Requires `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, `MONGO_URI`

### Database Schema
- Projects stored in MongoDB with fields: `id`, `title`, `description`, `path`, `component`
- Data model in `api/saveData.js` for general data storage

## Important Notes

- The site owner is Grayden Scovil, a developer from Colorado
- Live site: https://mgds.me/
- Uses Vercel Analytics with tracking ID: PZ9X7E3YVX
- Admin panel accessible by clicking the "GS" header button
- All project pages maintain consistent header/footer structure
- Splash screen animation on homepage with 500ms fade delay
- Mobile-responsive design with separate CSS file
