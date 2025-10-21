# Vercel Environment Variables Setup

## Production Admin Login Setup

To fix the production login, you need to add these environment variables to your Vercel deployment:

### Required Environment Variables

Add these **exact** variables in your Vercel dashboard:

```
ADMIN_USERNAME=shadowpatriot9
ADMIN_PASSWORD_HASH=$2a$10$RUSRxtzFumfdjEnD1Ye3Zu5zG9RCvWKTgiLpjs.d7qB4Jd9HpP.hG
JWT_SECRET=685a4fa2045c167cc0836f120bd743eca7b25074864811f747e24bbfc5c04731ae79502b9ef98e720ff9a3f9f9dfccc86a5080c8940c5e6dfe34385220adf1df
REFRESH_TOKEN_SECRET=replace_with_a_unique_refresh_secret
```

### How to Add to Vercel:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: Click on your personal site project
3. **Go to Settings**: Click the "Settings" tab
4. **Navigate to Environment Variables**: Click "Environment Variables" in the sidebar
5. **Add each variable**:
   - Click "Add New"
   - Enter the **Name** (e.g., `ADMIN_USERNAME`)
   - Enter the **Value** (e.g., `shadowpatriot9`)
   - Select **Production** environment
   - Click "Save"
   - Repeat for all 4 variables

6. **Redeploy**: 
   - Go to "Deployments" tab
   - Click "..." next to latest deployment
   - Click "Redeploy"
   - OR just push a new commit to trigger auto-deployment

### Production Login Credentials:
- **Username**: `shadowpatriot9`  
- **Password**: `16196823`

### Notes:
- The password hash corresponds to password `16196823`
- JWT_SECRET is a secure random key for signing access tokens
- REFRESH_TOKEN_SECRET signs the long-lived refresh tokens used by the admin panel
- After adding variables, you MUST redeploy for changes to take effect
- The API will fall back to development mode if environment variables are missing

### Troubleshooting:
- If login still fails, check Vercel function logs in the dashboard
 - Make sure all 4 environment variables are set correctly
- Ensure you've redeployed after adding the variables
- Confirm the public projects feed (`/api/projects`) is accessible without authentication
