# QMS-ERP Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Option 1: Automated Start (Recommended)
Simply double-click `START_APP.bat` in the project root folder. This will:
1. Set up the database with admin user
2. Start the backend server
3. Start the frontend development server
4. Open the application in your browser

### Option 2: Manual Start

#### Step 1: Setup Database
```cmd
cd backend
python fix_database.py
```

#### Step 2: Start Backend (Keep this terminal open)
```cmd
cd backend
python main.py
```

#### Step 3: Start Frontend (Open new terminal)
```cmd
cd frontend
npm install
npm run dev
```

## 🔐 Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `Admin@123`

**Other Test Accounts:**
- QA Manager: `qa_manager` / `QaManager@123`
- QA Engineer: `qa_engineer` / `QaEngineer@123`
- Production Manager: `prod_manager` / `ProdManager@123`

## 🌐 Access URLs

- **Frontend Application:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Interactive API:** http://localhost:8000/redoc

## ✨ Design Improvements

### What's New
1. **Premium Login Page**
   - Cinematic split-screen design
   - Animated gradient background
   - Compliance badges (ISO 13485, FDA 21 CFR)
   - Feature carousel

2. **Enhanced Dashboard**
   - Department overview cards
   - Performance analytics chart
   - KPI statistics
   - Recent activity feed
   - Action items table

3. **Modern UI Components**
   - Glassmorphism effects
   - Smooth animations
   - Hover effects
   - Focus states
   - Loading spinners
   - Empty states

4. **Improved Navigation**
   - Dark sidebar with icons
   - Expandable menu groups
   - Active state indicators
   - Smooth transitions

5. **Better Forms**
   - Input icons
   - Focus effects
   - Validation states
   - Responsive layouts

6. **Data Tables**
   - Hover effects
   - Action buttons
   - Status badges
   - Responsive design

## 📱 Features by Module

### Core
- **Dashboard:** Overview of all departments and KPIs

### Commercial
- **Marketing:** Enquiries, quotations, orders
- **Purchase:** Vendors, POs, ratings
- **Stores:** Material management, inventory

### Operations
- **Production:** Work orders, scheduling
- **Maintenance:** Preventive & breakdown
- **Service:** Installation & servicing

### Quality Management
- **Design & Dev:** Planning, verification, transfer
- **QA & Compliance:** Audits, NC, CAPA, risk
- **Testing:** Calibration, validation, reports

### Organization
- **HR:** Employees, competence, training
- **Documentation:** Internal & external docs
- **Settings:** System configuration

## 🎨 Design System

### Colors
- **Primary:** Blue (#2563eb) - Main actions
- **Success:** Green (#10b981) - Positive states
- **Warning:** Orange (#f59e0b) - Caution states
- **Error:** Red (#ef4444) - Critical states
- **Info:** Blue (#3b82f6) - Informational

### Typography
- **Headings:** Outfit font, 600-700 weight
- **Body:** Outfit font, 400-500 weight
- **Code:** Monospace for IDs and codes

### Components
- **Cards:** Rounded corners, subtle shadows
- **Buttons:** Gradient backgrounds, hover lift
- **Badges:** Rounded pills with colors
- **Inputs:** Focus rings, icon support
- **Tables:** Hover rows, sticky headers

## 🔧 Troubleshooting

### "Not Found" Error on Login
**Solution:** Run the database setup script
```cmd
cd backend
python fix_database.py
```

### Backend Won't Start
**Check:**
1. Python is installed (3.9+)
2. Dependencies installed: `pip install -r requirements.txt`
3. Port 8000 is not in use

### Frontend Won't Start
**Check:**
1. Node.js is installed (16+)
2. Dependencies installed: `npm install`
3. Port 5173 is not in use

### Styles Not Loading
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check browser console for errors

### Database Issues
**Solution:** Delete the database and recreate
```cmd
cd backend
del qms_erp.db
python fix_database.py
```

## 📊 System Requirements

### Minimum
- **OS:** Windows 10/11
- **RAM:** 4GB
- **Storage:** 500MB
- **Browser:** Chrome 90+, Firefox 88+, Edge 90+

### Recommended
- **OS:** Windows 11
- **RAM:** 8GB+
- **Storage:** 1GB
- **Browser:** Latest Chrome/Edge

## 🔒 Security Features

- JWT token authentication
- Password hashing (bcrypt)
- CORS protection
- SQL injection prevention
- XSS protection
- CSRF tokens

## 📈 Performance

- Fast page loads (<1s)
- Smooth animations (60fps)
- Optimized API calls
- Lazy loading
- Caching with React Query

## 🎯 Best Practices

### For Users
1. Use strong passwords
2. Log out when done
3. Keep browser updated
4. Report issues promptly

### For Developers
1. Follow component patterns
2. Use TypeScript types
3. Write clean code
4. Test before committing
5. Document changes

## 📚 Documentation

- **API Docs:** http://localhost:8000/docs
- **Design Guide:** DESIGN_IMPROVEMENTS.md
- **Troubleshooting:** TROUBLESHOOTING.md
- **Git Guide:** GIT_GUIDE.md

## 🆘 Getting Help

### Common Issues
1. **Login fails:** Check credentials, run fix_database.py
2. **Page blank:** Check browser console, verify backend running
3. **Slow loading:** Check network tab, verify API responses
4. **Styles broken:** Clear cache, hard refresh

### Debug Tools
- **Browser DevTools:** F12
- **React DevTools:** Browser extension
- **Network Tab:** Check API calls
- **Console:** Check for errors

## 🎉 Next Steps

1. ✅ Login with admin credentials
2. ✅ Explore the dashboard
3. ✅ Navigate through modules
4. ✅ Create test records
5. ✅ Customize as needed

## 📞 Support

For issues or questions:
1. Check TROUBLESHOOTING.md
2. Review browser console
3. Check API documentation
4. Verify database setup

---

**Enjoy your enhanced QMS-ERP system! 🚀**
