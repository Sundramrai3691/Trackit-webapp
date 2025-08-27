# TrackIt – Full Stack (Node.js backend + React frontend)

This package contains your original **backend** (unpacked from the zip) and a new **React** frontend (Vite).

## Structure

```
TrackIt/
├── backend/    # your uploaded backend (unmodified)
└── frontend/   # generated React app (Vite)
```

## Quick Start

### 1) Backend

```bash
cd src
npm install
npm run dev
# Backend expected on port 4000
```

If your backend uses a different command or port, update it accordingly.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend reads the API base URL from `.env`:

```
VITE_API_BASE=http://localhost:4000
```

Change it if your backend runs elsewhere.

### 3) Verification (BoltPatch)

```bash
# Run smoke tests to verify API endpoints
cd frontend
node scripts/smokeTest.js
```

## Auto-detected Endpoints

The system uses these main endpoints:

- **Authentication**: `/api/v1/users/login`, `/api/v1/users/signUp`, `/api/v1/users/profile`
- **Items**: `/api/v2/lost-items`, `/api/v2/found-items`, `/api/v1/users/postItems`
- **Real-time**: Socket.io on same port with JWT authentication

## BoltPatch: Key Features Implemented

- ✅ **Token Refresh**: Automatic JWT refresh with axios interceptors
- ✅ **Socket Authentication**: JWT-based socket.io authentication
- ✅ **Image Upload**: Multipart form data → Cloudinary integration
- ✅ **Real-time Notifications**: Socket events for item CRUD operations
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Smoke Tests**: Automated endpoint verification script

## Notes

- Token support: if `localStorage.token` is set, it will be sent as `Authorization: Bearer <token>`.
- Refresh tokens are stored in `localStorage.refreshToken` and used automatically.
- Add forms or CRUD UIs by editing/adding components in `src/`.
- Image uploads expect `ImageTrackList` field name (max 2 files).
- Socket.io provides real-time updates for item creation, updates, and deletions.
