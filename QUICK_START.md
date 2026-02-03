# Quick Start Guide - Compliance Management System

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- npm or yarn package manager

## Running the Application

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd c:\Users\vrajr\Desktop\COMPLIANCE\backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Step 2: Start the Frontend Development Server

Open a **new terminal** and run:

```bash
cd c:\Users\vrajr\Desktop\COMPLIANCE\frontend
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### Step 3: Access the Application

1. Open your browser and go to: `http://localhost:5173`
2. Login with your credentials
3. All pages should now have fully functional Create, Edit, View, and Delete buttons!

## Testing the Fixes

### Test CAPAs Page (Main Fix)
1. Navigate to **CAPA Management** page
2. Click **"New CAPA"** button
3. Fill in the form:
   - Title: "Test CAPA"
   - Type: Select "Corrective" or "Preventive"
   - Priority: Select priority level
   - Owner: Select from dropdown
   - Due Date: Pick a date
4. Click **"Create CAPA"**
5. Verify the CAPA appears in the table
6. Test View, Edit, and Delete buttons

### Test Other Pages
Repeat similar tests for:
- **Audits** - Schedule Audit button
- **Nonconformances** - Report NC button
- **Work Orders** - New Work Order button
- **Documents** - New Document button
- **Training** - Record Training button
- **Items** - Create Item button
- **Inventory** - Add Inventory button
- **Users** - Create User button

## Common Issues & Solutions

### Backend won't start
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Try again
python -m uvicorn main:app --reload
```

### Frontend won't start
```bash
# Install dependencies
cd frontend
npm install

# Try again
npm run dev
```

### Port already in use
- Backend: Change port in the command: `--port 8001`
- Frontend: It will automatically use the next available port

### Database issues
```bash
cd backend
python init_db_sync.py
```

## What's Been Fixed

✅ **CAPAs Page** - Complete overhaul with full CRUD functionality
✅ **All Create Buttons** - Working with proper forms
✅ **All Edit Buttons** - Working with pre-filled forms
✅ **All View Buttons** - Working with detail modals
✅ **All Delete Buttons** - Working with confirmation dialogs
✅ **All Forms** - Proper validation and error handling
✅ **All Dropdowns** - Connected to real data from API

## Need Help?

Check the detailed documentation in `FIXES_SUMMARY.md` for:
- Complete list of changes
- Technical implementation details
- API endpoints
- Form handling patterns
- Future enhancements

Enjoy your fully functional Compliance Management System! 🎉
