# TrackIt Frontend

React frontend for the TrackIt lost and found application.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit VITE_API_BASE if backend is on non-default port

# Start development server
npm run dev
```

## Features

- **Modern React Stack**: Vite, React Router, Tailwind CSS
- **Real-time Updates**: Socket.io integration for live notifications
- **3D Hero Component**: Spline integration with lazy loading
- **State Management**: Zustand for global state
- **Form Handling**: React Hook Form with Yup validation
- **Responsive Design**: Mobile-first approach with Tailwind
- **Animations**: Framer Motion for smooth transitions

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

## BoltPatch: Verification Steps

### Quick Start Verification

1. **Start Backend** (Terminal 1):

   ```bash
   cd backend  # or src/
   npm install
   npm run dev
   ```

   Expected: "Server running on port 4000" and socket connection logs

2. **Start Frontend** (Terminal 2):

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env if backend runs on different port
   npm run dev
   ```

   Expected: Frontend available at http://localhost:5173

3. **Run Smoke Tests** (Terminal 3):
   ```bash
   cd frontend
   node scripts/smokeTest.js
   ```
   Expected: All API endpoints respond correctly

### Manual Testing Checklist

- [ ] **Authentication Flow**: Register → Login → localStorage contains `token` and `refreshToken`
- [ ] **Image Upload**: Create report with 1-3 images → Backend logs show Cloudinary upload → Database stores image URLs
- [ ] **Real-time Notifications**: Open two browser windows → Create item in one → Other receives socket notification
- [ ] **CRUD Operations**: Edit/Delete items → Socket notifications broadcast to all clients
- [ ] **Token Refresh**: Remove token from localStorage → Access protected page → Axios interceptor attempts refresh → Redirects to login if refresh fails

### Configuration Notes

- **Spline 3D Scene**: Update the scene URL in `src/components/SplineHero.jsx` (line with `scene.splinecode`)
- **Image Upload**: Backend expects `ImageTrackList` field name for file uploads (max 2 images)
- **Socket Authentication**: Tokens are sent via `socket.handshake.auth.token` for authenticated real-time features
- **API Endpoints**: All routes are centralized in `src/services/routeMap.js`

## Notes

- The Spline scene URL in `SplineHero.jsx` needs to be replaced with your actual 3D scene
- Backend endpoints are centralized in `services/routeMap.js` for easy configuration
- Socket.io connects automatically and listens for real-time item updates
- Image uploads use multipart/form-data with `ImageTrackList` field name
- Token refresh is handled automatically by axios interceptors
