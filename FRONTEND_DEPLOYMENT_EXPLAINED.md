# Frontend Deployment Architecture

## How It Works

Your QMS-ERP application uses a **Single Container Deployment** where both frontend and backend are served from one Docker container.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Docker Container (Port 8000)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Stage 1: Frontend Build (Node.js)                │ │
│  │  - npm install (all dependencies)                 │ │
│  │  - npm run build (TypeScript → JavaScript)        │ │
│  │  - Output: /app/frontend/dist/                    │ │
│  │    ├── index.html                                 │ │
│  │    ├── assets/                                    │ │
│  │    │   ├── index-abc123.js                        │ │
│  │    │   └── index-def456.css                       │ │
│  └───────────────────────────────────────────────────┘ │
│                        ↓                                │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Stage 2: Backend Runtime (Python)                │ │
│  │                                                   │ │
│  │  FastAPI Server (Uvicorn)                        │ │
│  │  ├── /api/* → API endpoints                      │ │
│  │  ├── /health → Health check                      │ │
│  │  ├── /assets/* → Static files (JS, CSS, images)  │ │
│  │  └── /* → index.html (React SPA)                 │ │
│  │                                                   │ │
│  │  Static Files: /app/static/                      │ │
│  │  (Copied from Stage 1 build)                     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. User Visits Root URL
```
User → https://qms-erp-app.onrender.com/
       ↓
FastAPI checks: Is this an API route? No
       ↓
Serves: /app/static/index.html
       ↓
Browser loads React app
```

### 2. React App Loads Assets
```
Browser requests: /assets/index-abc123.js
       ↓
FastAPI serves: /app/static/assets/index-abc123.js
       ↓
React app initializes
```

### 3. API Calls
```
React app calls: /api/auth/login
       ↓
FastAPI routes to: auth_router
       ↓
Returns: JSON response
```

### 4. React Router Navigation
```
User clicks: Dashboard link
       ↓
React Router: Changes URL to /dashboard
       ↓
Browser requests: /dashboard
       ↓
FastAPI serves: /app/static/index.html (SPA routing)
       ↓
React Router: Renders Dashboard component
```

## Why This Approach?

### Advantages
✅ **Single Deployment**: One container, one service, simpler management
✅ **No CORS Issues**: Frontend and backend on same origin
✅ **Cost Effective**: Only one service to pay for on Render
✅ **Faster**: No network latency between frontend and backend
✅ **Simpler**: One URL, one SSL certificate, one domain

### How It's Different from Separate Deployments

**Traditional Approach** (2 services):
```
Frontend Service (Render Static Site)
  ↓ API calls over network
Backend Service (Render Web Service)
```

**Our Approach** (1 service):
```
Single Service
├── Backend serves API
└── Backend serves Frontend static files
```

## File Structure in Container

```
/app/
├── main.py                 # FastAPI app
├── routers/               # API routes
├── models/                # Database models
├── static/                # Frontend build (from Stage 1)
│   ├── index.html        # React entry point
│   └── assets/           # JS, CSS, images
│       ├── index-abc.js
│       └── index-def.css
├── qms_erp.db            # SQLite database
└── uploads/              # User uploads
```

## Debugging

### Check if Frontend is Built
Visit: `https://your-app.onrender.com/debug-static`

This will show:
```json
{
  "static_dir_exists": true,
  "static_dir_path": "/app/static",
  "files": [
    "/app/static/index.html",
    "/app/static/assets/index-abc123.js",
    "/app/static/assets/index-def456.css"
  ]
}
```

### Check Health
Visit: `https://your-app.onrender.com/health`

Should return:
```json
{
  "status": "ok"
}
```

### Check API
Visit: `https://your-app.onrender.com/api`

Should return:
```json
{
  "status": "healthy",
  "app": "Medical Device QMS-ERP",
  "version": "1.0.0"
}
```

## Common Issues

### Black Screen
**Cause**: Frontend not loading
**Check**: 
1. Visit `/debug-static` to verify files exist
2. Check browser console for errors
3. Check if `/assets/` files are loading

**Solution**: 
- Ensure Docker build completed successfully
- Check Render build logs for frontend build errors

### API Calls Fail
**Cause**: CORS or routing issues
**Check**:
1. Browser network tab
2. Check if calls go to `/api/*`

**Solution**:
- Verify API routes are prefixed with `/api`
- Check CORS settings in main.py

### 404 on Refresh
**Cause**: SPA routing not configured
**Solution**: Already handled - all non-API routes serve index.html

## Environment Variables

The application uses these environment variables:

```env
DATABASE_URL=sqlite+aiosqlite:///./qms_erp.db
SECRET_KEY=<auto-generated>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
PORT=8000
```

## Deployment Process

1. **Push to GitHub**
   ```bash
   git push origin master
   ```

2. **Render Detects Push**
   - Webhook triggers build

3. **Docker Build**
   - Stage 1: Build frontend (npm run build)
   - Stage 2: Setup backend + copy frontend

4. **Container Starts**
   - Initialize database
   - Seed data
   - Start FastAPI server

5. **Application Ready**
   - Frontend served at `/`
   - API available at `/api/*`

## Monitoring

### Render Dashboard
- Build logs
- Runtime logs
- Metrics (CPU, Memory)
- Events

### Application Logs
Look for:
```
[1/3] Initializing database...
✓ Database initialized successfully

[2/3] Seeding initial data...
✓ Data seeded successfully

[3/3] Starting FastAPI server...
INFO: Uvicorn running on http://0.0.0.0:8000
```

## Performance

### First Load
- Frontend: ~500KB (gzipped)
- Load time: 1-2 seconds

### Subsequent Loads
- Cached assets
- Load time: <500ms

### API Response
- Average: 50-100ms
- Database queries: 10-50ms

## Scaling

### Free Tier
- 512 MB RAM
- Shared CPU
- Sleeps after 15 min

### Paid Tier ($7/month)
- Always on
- More RAM/CPU
- Persistent disk

## Security

✅ HTTPS enforced
✅ JWT authentication
✅ Password hashing
✅ CORS configured
✅ SQL injection prevention
✅ XSS protection

## Summary

Your application is a **monolithic deployment** where:
- Frontend is **built during Docker build**
- Frontend is **served by FastAPI**
- Everything runs in **one container**
- Accessible at **one URL**

This is the **recommended approach** for small to medium applications because it's:
- Simpler to deploy
- Cheaper to run
- Easier to maintain
- Faster (no network latency)

---

**Status**: ✅ Deployed and Running
**URL**: https://qms-erp-app.onrender.com
**Architecture**: Single Container (Frontend + Backend)
