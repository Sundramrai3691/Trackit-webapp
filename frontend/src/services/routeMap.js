// BoltPatch: Updated routeMap to match backend routes exactly
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default {
  auth: {
    login: `${BASE}/api/v1/users/login`,
    register: `${BASE}/api/v1/users/signUp`,
    verifyEmail: `${BASE}/api/v1/users/verify-email`,
    me: `${BASE}/api/v1/users/profile`,
    logout: `${BASE}/api/v1/users/logout`,
    refreshToken: `${BASE}/api/v1/users/auth/refreshAccessToken`,
    forgotPassword: `${BASE}/api/v1/users/forgot-password`,
    resetPassword: `${BASE}/api/v1/users/password-reset`,
  },
  items: {
    list: `${BASE}/api/v2`,
    lost: `${BASE}/api/v2/lost-items`,
    found: `${BASE}/api/v2/found-items`,
    lostByCategory: (category) => `${BASE}/api/v2/lost-items/${category}`,
    foundByCategory: (category) => `${BASE}/api/v2/found-items/${category}`,
    create: `${BASE}/api/v1/users/postItems`,
    delete: `${BASE}/api/v1/users/profile/delete`,
  },
  socket: BASE,
};
