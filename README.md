# Compliance Management System

A comprehensive compliance management system built with React (Frontend) and FastAPI (Backend).

## Features

- **User Authentication & Authorization**: Secure login system with role-based access control (Admin, Vendor, User)
- **Admin Dashboard**: Complete administrative control panel with settings management
- **Google Analytics Integration**: Track and monitor website analytics
- **MongoDB Atlas Monitoring**: Real-time database monitoring and status tracking
- **Render Deployment Integration**: Monitor deployment status directly from admin panel
- **Episode Management**: Manage podcast episodes with promotional images and guest information
- **About Us Page**: Rich text editor for content management
- **Infinite Scroll**: Optimized episode loading with configurable batch sizes
- **Responsive Design**: Modern, premium UI with glassmorphism and smooth animations

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and optimized builds
- **React Router** for navigation
- **React GA4** for Google Analytics
- **Axios** for API communication
- Modern CSS with custom design system

### Backend
- **FastAPI** (Python)
- **MongoDB** with Motor (async driver)
- **JWT** for authentication
- **Pydantic** for data validation
- **Python-multipart** for file uploads

## Project Structure

```
COMPLIANCE/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── AuthContext.tsx
│   │   ├── index.css
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── backend/            # FastAPI backend application
│   ├── routers/
│   │   ├── dashboard.py
│   │   ├── training.py
│   │   └── ...
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
├── DOCS/              # Documentation files
└── README.md

```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB Atlas account
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

The backend will run on `http://localhost:8001`

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key
RENDER_API_KEY=your_render_api_key
RENDER_SERVICE_ID=your_render_service_id
MONGODB_ATLAS_PUBLIC_KEY=your_atlas_public_key
MONGODB_ATLAS_PRIVATE_KEY=your_atlas_private_key
MONGODB_ATLAS_PROJECT_ID=your_atlas_project_id
```

## Features in Detail

### Admin Panel
- **Settings Management**: Configure site-wide settings including Google Analytics, episode loading, and more
- **Database Monitoring**: Real-time MongoDB Atlas cluster status
- **Deployment Status**: Monitor Render deployment health
- **Content Management**: Manage episodes, guests, and about us content

### User Roles
- **Admin**: Full access to all features and settings
- **Vendor**: Limited access to vendor-specific dashboard
- **User**: Standard user access to public content

### Performance Optimizations
- Code splitting with lazy loading
- Optimized chunk splitting in build configuration
- Infinite scroll for efficient content loading
- Image optimization and compression

## Development

### Running Tests
```bash
# Backend tests
python test_backend.py
python test_auth.py

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
# Deploy using your preferred method (Render, Heroku, etc.)
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please create an issue in the GitHub repository.

## Acknowledgments

- Built with modern web technologies
- Designed for scalability and performance
- Focused on user experience and security
