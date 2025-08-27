# TrackIt Frontend

React frontend for the TrackIt lost and found application.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit VITE_API_BASE if backend runs on non-default port

# Start development server
npm run dev
```

## Features

- **Modern React Stack**: Vite, React Router, Tailwind CSS
- **Real-time Updates**: Socket.io integration with JWT auth handshake
- **3D Hero Component**: Spline integration with lazy loading and error boundaries
- **Dark Mode**: Full dark mode support with theme toggle
- **State Management**: Zustand for global state
- **Form Handling**: React Hook Form with Yup validation
- **Responsive Design**: Mobile-first approach with Tailwind
- **Animations**: Framer Motion for smooth transitions
- **Glass UI**: Modern glassmorphism design elements

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route components  
├── services/      # API and external service integrations
├── hooks/         # Custom React hooks
├── store/         # Zustand store
└── utils/         # Helper functions
```

## Environment Variables

- `VITE_API_BASE`: Backend API base URL (default: http://localhost:4000)

## BoltPatch: Enhanced Features

### Authentication Flow
- **Register**: `/auth/signup` - Email verification required
- **Verify**: `/auth/verify?token=...` - Auto-login on successful verification
- **Login**: `/auth/login` - JWT token storage and refresh support
- **Protected Routes**: Automatic redirect to login for unauthenticated users

### Image Upload
- **Field Name**: `images` (supports up to 6 images)
- **Format**: multipart/form-data
- **Storage**: Cloudinary integration

### Real-time Features
- **Socket Authentication**: JWT token passed via `socket.handshake.auth.token`
- **Notifications**: Real-time updates for item CRUD operations
- **Events**: `newItemPosted`, `itemUpdated`, `itemDeleted`

### Theme Support
- **Dark Mode**: Toggle via ThemeToggle component
- **Persistence**: Theme preference stored in localStorage
- **System Preference**: Respects user's system dark mode setting

## Quick Start Verification

1. **Start Backend** (Terminal 1):
   ```bash
   cd src
   npm install
   npm run dev
   ```
   Expected: "Server running on port 4000" and socket connection logs

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
   Expected: Frontend available at http://localhost:5173

3. **Run Smoke Tests** (Optional):
   ```bash
   cd frontend
   node scripts/smokeTest.js
   ```

## Manual Testing Checklist

- [ ] **Home Page**: Loads with Spline hero, theme toggle works
- [ ] **Registration**: Create user → Check email for verification link
- [ ] **Email Verification**: Click link → Auto-login if tokens returned
- [ ] **Login**: Credentials → localStorage contains tokens
- [ ] **Image Upload**: Create report with images → Backend stores Cloudinary URLs
- [ ] **Real-time**: Two browser windows → Create item → Other receives notification
- [ ] **Dark Mode**: Toggle works and persists across sessions
- [ ] **Protected Routes**: Access without token → Redirects to login

## Configuration Notes

- **Spline Scene**: Default scene URL in `SplineHero.jsx` - replace with your own
- **API Routes**: Centralized in `services/routeMap.js`
- **Image Field**: Backend expects `images` field name (changed from `ImageTrackList`)
- **Socket Auth**: Automatic token attachment for authenticated real-time features

## TODOs

- [ ] Set CLOUDINARY environment variables in backend
- [ ] Replace Spline scene URL with your custom 3D scene
- [ ] Configure EMAIL_FROM and SMTP settings for email verification
- [ ] Test email verification flow end-to-end
