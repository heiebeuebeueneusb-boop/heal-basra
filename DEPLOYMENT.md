# HealBasra Deployment Guide

## Overview
HealBasra is a modern medical booking platform built with React, TypeScript, Tailwind CSS, and Supabase. This guide covers deployment to production.

## Prerequisites
- Node.js 18+ installed
- Git and GitHub account
- Vercel account (for hosting)
- Supabase project (database already configured)

## Environment Setup

### 1. Database (Supabase)
The Supabase database is already provisioned with all necessary tables and RLS policies:
- `profiles` - User profiles (patient/doctor/admin)
- `doctors` - Doctor information and clinic details
- `schedules` - Doctor working hours
- `schedule_exceptions` - Off days and vacations
- `appointments` - Patient bookings
- `medical_records` - Doctor-created medical reports

**Supabase Credentials** (from `.env`):
```
VITE_SUPABASE_URL=https://pjlnybprsaliqiibrzve.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Preview production build
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is optimized for Vite apps and provides automatic deployments on git push.

#### Step 1: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in
3. Click "Add New → Project"
4. Import your Git repository
5. Select "Vite" as framework
6. Click "Deploy"

#### Step 2: Configure Environment Variables
In Vercel dashboard → Project Settings → Environment Variables:

```
VITE_SUPABASE_URL = https://pjlnybprsaliqiibrzve.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 3: Configure Vercel for GitHub Deployments
1. Go to Vercel → Dashboard → Settings → Git Integration
2. Select your GitHub repository
3. Enable "Automatic Deployments" for main branch
4. Save

#### Automatic Deployments
After GitHub integration is set up, any push to `main` branch will automatically deploy to production via the GitHub Actions workflow.

**Manual Deployment:**
```bash
npm install -g vercel
vercel --prod
```

### Option 2: Netlify

1. Connect your GitHub repository to [netlify.com](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

### Option 3: Self-Hosted

1. Build the project: `npm run build`
2. Upload `dist/` directory to your server
3. Configure your web server (Nginx, Apache) to serve SPA:
   - Redirect all requests to `index.html` except for static assets
4. Set environment variables via build process

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name healbasra.iq;

    root /var/www/healbasra/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Production Checklist

- [ ] All environment variables configured
- [ ] TypeScript type checking passes (`npm run typecheck`)
- [ ] Build completes successfully (`npm run build`)
- [ ] No console errors in browser DevTools
- [ ] All routes work correctly
- [ ] Authentication flows work (register, login, dashboard)
- [ ] Doctor profile page loads
- [ ] Booking system functional
- [ ] Admin panel accessible with admin role
- [ ] Toast notifications display correctly
- [ ] Mobile responsive on small screens
- [ ] Map loads and displays doctors
- [ ] Database queries returning correct data

## Performance Optimizations

The build is already optimized with:
- Code splitting by route
- CSS minification
- JS/CSS compression
- Image optimization ready (use responsive images)
- Lazy loading for non-critical components

**Current Build Size:**
- CSS: 39.61 KB (gzipped: 6.94 KB)
- JS: 449.90 KB (gzipped: 122.69 KB)

## Monitoring & Logs

### Vercel Dashboard
- Deployments tab: View all deployments and rollbacks
- Analytics: Monitor performance metrics
- Logs: Real-time server logs

### Supabase Dashboard
- SQL Editor: Query database directly
- Auth: Monitor user registrations and logins
- Database: View logs and performance

## Rollback Procedure

**On Vercel:**
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." menu → "Redeploy"

## Scaling Considerations

- **Database**: Supabase auto-scales; monitor usage in dashboard
- **Frontend**: Vercel handles auto-scaling
- **Real-time features**: Supabase supports WebSockets for real-time updates

## Security

✓ All sensitive data in environment variables
✓ Row Level Security (RLS) policies on all tables
✓ HTTPS enforced on production
✓ TypeScript for type safety
✓ No hardcoded API keys

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Loading
- Verify variable names match `.env` file exactly
- In Vercel, redeploy after adding env vars
- Check "Environment Variables" in project settings

### Database Connection Issues
- Verify Supabase URL and ANON_KEY are correct
- Check Supabase project is active in dashboard
- Verify RLS policies allow your role

### Routes Not Working
- Ensure SPA configuration in web server
- All non-asset requests should serve `index.html`
- Check browser console for 404 errors

## Support

For issues, check:
1. [Vercel Documentation](https://vercel.com/docs)
2. [Supabase Documentation](https://supabase.com/docs)
3. [Vite Documentation](https://vitejs.dev)
4. [React Documentation](https://react.dev)

---

**Deployed Application:**
- Production URL: (set after deployment)
- Database: Supabase Cloud
- Hosting: Vercel
- Repository: GitHub

**Version:** 1.0.0
**Last Updated:** May 14, 2026
