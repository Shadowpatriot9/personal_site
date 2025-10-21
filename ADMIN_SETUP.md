# Admin Panel Setup

## Overview
Your personal site now includes an admin panel that allows you to manage projects directly from the web interface. The admin panel is accessible by clicking the "GS" button on the home page.

## Features
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Project Management**: Add, edit, and delete projects
- **Real-time Updates**: Changes are immediately reflected on the site
- **Responsive Design**: Works on desktop and mobile devices
- **Public Feed API**: Read-only `/api/projects` endpoint for showcasing projects without exposing admin privileges

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Generate Password Hash and Environment Variables
```bash
node setup-admin.js
```

This script will:
- Generate a secure password hash for your chosen password
- Create a random JWT secret
- Display the environment variables you need to set

### 3. Set Environment Variables in Vercel
Go to your Vercel dashboard and add these environment variables:

- `ADMIN_USERNAME`: shadowpatriot9
- `ADMIN_PASSWORD_HASH`: [generated hash from setup script]
- `JWT_SECRET`: [generated secret from setup script]
- `REFRESH_TOKEN_SECRET`: [generated refresh secret from setup script]
- `MONGO_URI`: [your MongoDB connection string]

### 4. Deploy
After setting the environment variables, redeploy your project on Vercel.

## Usage

### Accessing the Admin Panel
1. Go to your site (https://mgds.me/)
2. Click the "GS" button in the header
3. You'll be redirected to the admin login page
4. Enter your credentials:
   - Username: `shadowpatriot9`
   - Password: [the password you chose during setup]

### Managing Projects
Once logged in, you can:

**Add New Projects:**
- Fill out the form with project details
- Click "Add Project"

**Edit Existing Projects:**
- Click the "Edit" button on any project
- Modify the details
- Click "Save" to update

**Delete Projects:**
- Click the "Delete" button on any project
- Confirm the deletion

### Project Fields
- **ID**: Unique identifier (e.g., "s9", "muse")
- **Title**: Display name (e.g., "S9", "Muse")
- **Description**: Brief description (e.g., "Shadow Home Server")
- **Path**: URL path (e.g., "/projects/s9")
- **Component**: React component name (e.g., "S9")

## Security Features
- **JWT Authentication**: Secure token-based authentication
- **Refresh Tokens**: Automatic token renewal with dedicated refresh secret
- **Password Hashing**: Passwords are hashed using bcrypt
- **Token Expiration**: JWT tokens expire after 24 hours
- **Protected Routes**: All admin operations require authentication

## File Structure
```
src/
├── Admin.js                 # Admin panel component
├── styles/
│   └── styles_admin.css     # Admin panel styles
api/
├── admin/
│   ├── login.js            # Authentication endpoint
│   ├── projects.js         # Project CRUD operations
│   └── projects/
│       └── [id].js         # Individual project operations
├── projects.js             # Public read-only projects feed
```

## Troubleshooting

### Login Issues
- Ensure environment variables are set correctly
- Check that the password hash was generated properly
- Verify MongoDB connection string

### Project Management Issues
- Check browser console for error messages
- Ensure JWT token is valid (try logging out and back in)
- Verify MongoDB is accessible

### Deployment Issues
- Make sure all environment variables are set in Vercel
- Check that the API routes are properly configured
- Verify the project structure matches the expected layout

## Notes
- The admin panel is only accessible to authenticated users
- All changes are stored in your MongoDB database
- The JWT token is stored in localStorage for session persistence
- Logout clears all authentication data 