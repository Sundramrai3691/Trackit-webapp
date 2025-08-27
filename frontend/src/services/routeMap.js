// BoltPatch: centralized routes; edit here if backend differs
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default {
  auth: {
    register: `${BASE}/api/v1/users/signUp`,
    login: `${BASE}/api/v1/users/login`,
    verify: `${BASE}/api/v1/users/verify-email`,
    refresh: `${BASE}/api/v1/users/auth/refreshAccessToken`,
    me: `${BASE}/api/v1/users/profile`,
    logout: `${BASE}/api/v1/users/logout`,
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
    item: (id) => `${BASE}/api/v2/items/${id}`
  },
  socket: BASE,
};
