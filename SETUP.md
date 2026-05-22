# HealBasra - Setup & Deployment Instructions

## Quick Start

### Prerequisites
- Node.js 18+ (check with `node --version`)
- Git (for version control)
- A GitHub account (to push code)
- Vercel account (for deployment) - optional but recommended

### 1. Local Development Setup

```bash
# Clone or navigate to project directory
cd project

# Install dependencies
npm install

# Create environment file (if not exists)
# The .env file is already configured with Supabase credentials

# Start development server
npm run dev

# Open http://localhost:5173 in browser
```

### 2. Testing the Application

**Create Test Accounts:**

1. **Patient Account**
   - Go to http://localhost:5173/auth
   - Click "Register"
   - Select "Patient" role
   - Fill in: Email, Password, Full Name, Phone
   - Click "Create Account"
   - You'll be redirected to Patient Dashboard

2. **Doctor Account**
   - Go to http://localhost:5173/auth
   - Click "Register"
   - Select "Doctor" role
   - Fill in: Email, Password, Full Name (as "Dr. ..."), Phone
   - Click "Create Account"
   - You'll be redirected to Doctor Dashboard

3. **Admin Account** (Database setup required)
   - Create a regular account first, then:
   - Open Supabase dashboard
   - Go to SQL Editor
   - Run: `UPDATE profiles SET role = 'admin' WHERE email = 'youremail@example.com';`
   - Refresh page or logout/login

**Test User Flows:**

Patient:
- Browse doctors at `/doctors`
- View departments at `/departments`
- View map at `/map`
- Click doctor card → "Book Appointment"
- Follow 3-step booking (date → time → confirm)
- Go to Dashboard → view appointments
- Add symptoms notes

Doctor:
- Go to Dashboard
- View Appointments tab → confirm/reject bookings
- Go to Schedule tab → add working days
- Go to Medical Records → write patient summaries
- Send reports to patients

Admin:
- Go to http://localhost:5173/admin
- View "All Doctors" → add/edit/remove doctors
- View "Pending Approval" → approve/reject doctors
- View "Departments" → manage department list

### 3. Build for Production

```bash
# TypeScript type checking
npm run typecheck

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Deployment to Vercel

### Step 1: Prepare Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"

# Push to GitHub (if not already done)
git push origin main
```

### Step 2: Deploy on Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select "Vite" as framework (auto-detected)
5. Click "Deploy"

### Step 3: Configure Environment Variables

On Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://pjlnybprsaliqiibrzve.supabase.co`
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (full key from .env)
3. Redeploy the project

### Step 4: Set Up Automatic Deployments

In Vercel Dashboard → Settings → Git Integration:
- Repository: Select your repo
- Deploy on every push to `main` branch
- (Optional) Set domain name

## Alternative Deployment Options

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

Or via dashboard at [netlify.com](https://netlify.com):
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables
5. Deploy

### Self-Hosted (VPS/Server)

1. Build the project: `npm run build`
2. Upload `dist/` folder to server
3. Configure web server (Nginx example):

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/healbasra/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

## Environment Variables Reference

```env
# Supabase - Required for database connectivity
VITE_SUPABASE_URL=https://pjlnybprsaliqiibrzve.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are already configured in `.env` and `.env.local` (if it exists).

## Database Setup (Already Complete)

The database is already set up with:
- ✅ All tables created
- ✅ RLS policies configured
- ✅ Demo data inserted
- ✅ Migrations applied

**If needed to reset/reinitialize:**
1. Open Supabase SQL Editor
2. Go to `supabase/migrations/` folder
3. Run migrations in order (or contact support)

## Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 3000
# Or kill the process using port 5173
lsof -ti:5173 | xargs kill -9
```

### Build Fails
```bash
# Clear node_modules and package-lock
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Can't Connect to Database
- Verify Supabase credentials in `.env`
- Check Supabase project is active in dashboard
- Verify network connectivity

### Routes Not Working After Deployment
- Ensure SPA fallback is configured
- On Vercel: automatically handled
- On Netlify: Add `_redirects` file with: `/* /index.html 200`

### Environment Variables Not Loading
- On Vercel: Redeploy after adding env vars
- Verify variable names exactly match `.env`
- In local dev: Restart `npm run dev` after changing `.env`

## Performance Tips

- Use Chrome DevTools Network tab to check load times
- Monitor Vercel Analytics in dashboard
- Check Supabase logs for slow queries
- Consider enabling Vercel Edge Caching for static assets

## Monitoring

### Vercel
- Deployments tab: See all versions
- Analytics: Performance metrics
- Logs: Real-time server logs

### Supabase
- Monitoring: Database stats
- Database tab: Query performance
- Auth: User registration trends

## Security Checklist Before Going Live

- [ ] Environment variables set correctly
- [ ] HTTPS enabled
- [ ] RLS policies verified in Supabase
- [ ] No console errors in production build
- [ ] All authentication flows tested
- [ ] Admin access restricted properly
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] CORS properly configured if needed

## Domain Setup (After Deployment)

1. **Vercel:** 
   - Project Settings → Domains
   - Add custom domain
   - Follow DNS configuration

2. **Netlify:**
   - Site Settings → Domain Management
   - Add custom domain

3. **Self-hosted:**
   - Point domain DNS to your server IP
   - Configure SSL certificate (Let's Encrypt)

## Post-Deployment Tasks

1. **Verify everything works:**
   - Test user registration
   - Test doctor booking
   - Test admin panel
   - Test responsive design

2. **Set up monitoring:**
   - Enable Vercel analytics
   - Set up error notifications
   - Monitor Supabase usage

3. **Create admin account:**
   - Use seed script or SQL query
   - Test admin panel access

4. **Announce/launch:**
   - Share production URL
   - Create user documentation
   - Set up support channels

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev
- **Tailwind Docs:** https://tailwindcss.com/docs

## Database Backup

Supabase automatically backs up your data. To export:
1. Supabase Dashboard → Project Settings
2. Database → Backups
3. Download backup or request manual backup

## Next Steps

1. ✅ Complete setup instructions above
2. ✅ Test locally with sample accounts
3. ✅ Deploy to Vercel/Netlify
4. ✅ Monitor first 24 hours
5. ✅ Gather user feedback
6. ✅ Iterate and improve

---

**Setup Version:** 1.0
**Last Updated:** May 14, 2026
**Status:** Ready for Production Deployment
