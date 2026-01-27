# Login Troubleshooting Guide

## Current Status

✅ **Frontend is loading correctly!**
- Login page displays properly
- Design looks great
- All assets loading

⚠️ **Login failing with "Incorrect username or password"**

## Why This Happens

The error occurs because the database needs to be properly initialized and seeded with the admin user.

## Solution

### Automatic Fix (Recommended)
The latest deployment includes a fix that:
1. Creates all database tables
2. Checks if data already exists
3. Seeds initial data only if needed
4. Prevents duplicate seeding errors

**Wait for the current deployment to complete** (~5 minutes)

### Manual Fix (If Needed)

If login still fails after deployment, you can manually reset the database:

1. **Go to Render Dashboard**
   - Find your service: `qms-erp-app`
   - Click on "Shell" tab

2. **Run these commands:**
```bash
# Initialize database
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"

# Seed data
python -c "import asyncio; from seed import seed_data; asyncio.run(seed_data())"

# Restart service
exit
```

3. **Or use the fix_database script:**
```bash
python fix_database.py
```

## Default Login Credentials

After database is seeded, use these credentials:

**Admin Account:**
- Username: `admin`
- Password: `Admin@123`

**Other Test Accounts:**
- QA Manager: `qa_manager` / `QaManager@123`
- QA Engineer: `qa_engineer` / `QaEngineer@123`
- Production Manager: `prod_manager` / `ProdManager@123`

## Verification Steps

### 1. Check Database Initialization
Visit: `https://your-app.onrender.com/api/users`

Should return a list of users (requires authentication, but will show 401 if backend is working)

### 2. Check Logs
In Render Dashboard:
- Go to "Logs" tab
- Look for:
  ```
  ✓ Database tables created successfully
  ✓ Data seeded successfully
  ```

### 3. Test Login
1. Go to login page
2. Enter: `admin` / `Admin@123`
3. Should redirect to dashboard

## Common Issues

### Issue 1: "Incorrect username or password"
**Cause**: Database not seeded
**Solution**: Wait for deployment or manually seed database

### Issue 2: "Network Error"
**Cause**: Backend not responding
**Solution**: 
- Check Render logs
- Verify service is running
- Check health endpoint: `/health`

### Issue 3: "CORS Error"
**Cause**: CORS misconfiguration
**Solution**: Already configured in main.py, should not occur

### Issue 4: Database Resets on Restart
**Cause**: Render free tier uses ephemeral storage
**Solution**: 
- Upgrade to paid plan for persistent disk
- Or accept that database resets (good for testing)

## Database Persistence

### Free Tier (Current)
- ⚠️ Database resets when service sleeps (after 15 min inactivity)
- ⚠️ Database resets on deployment
- ✅ Good for testing and development

### Paid Tier ($7/month)
- ✅ Persistent disk storage
- ✅ Database survives restarts
- ✅ Better for production

## Monitoring

### Check Service Health
```bash
curl https://your-app.onrender.com/health
```

Should return:
```json
{
  "status": "ok"
}
```

### Check Static Files
```bash
curl https://your-app.onrender.com/debug-static
```

Should show list of frontend files

### Check API
```bash
curl https://your-app.onrender.com/api
```

Should return API info

## Expected Deployment Timeline

1. **Push to GitHub**: Instant
2. **Render detects push**: ~30 seconds
3. **Docker build starts**: ~1 minute
4. **Frontend build**: ~2-3 minutes
5. **Backend setup**: ~1 minute
6. **Container start**: ~30 seconds
7. **Database init & seed**: ~10 seconds
8. **Service ready**: Total ~5-7 minutes

## Current Deployment Status

Check your Render dashboard for:
- ✅ Build logs
- ✅ Deployment status
- ✅ Runtime logs

## What to Expect

After the current deployment completes:

1. **Visit**: `https://qms-erp-app.onrender.com/`
2. **See**: Login page (already working!)
3. **Enter**: `admin` / `Admin@123`
4. **Result**: Should redirect to dashboard
5. **Success**: Full application access!

## If Login Still Fails

1. **Check Render Logs**
   - Look for database initialization messages
   - Check for any errors

2. **Try Manual Database Reset**
   - Use Render Shell
   - Run `python fix_database.py`

3. **Verify Credentials**
   - Username: `admin` (lowercase)
   - Password: `Admin@123` (exact case)

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or use incognito mode

5. **Check Network Tab**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try login
   - Check if `/api/auth/login` request succeeds

## Success Indicators

✅ Login page loads (DONE!)
✅ No console errors
✅ Login redirects to dashboard
✅ Dashboard shows data
✅ Navigation works
✅ All features accessible

## Next Steps

1. ⏳ Wait for current deployment (~5 minutes)
2. 🔄 Refresh the login page
3. 🔐 Try login with `admin` / `Admin@123`
4. 🎉 Access the full application!

## Support

If issues persist:
1. Check `TROUBLESHOOTING.md`
2. Review Render logs
3. Check browser console
4. Verify database was seeded

---

**Status**: Deployment in progress
**ETA**: ~5 minutes
**Expected Result**: Login should work after deployment completes
