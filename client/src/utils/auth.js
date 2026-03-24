// ─────────────────────────────────────────────────────────────────────────────
// utils/auth.js
//
// Customer token key: "UserToken"   (capital U — keep as-is, already working)
// Admin token key:    "token"       (different key — no clash)
//
// WHY WE STOPPED RENAMING:
// Renaming "UserToken" → "userToken" caused both keys to exist simultaneously
// because not all files were replaced at the same moment. This broke auth
// across the whole app. Simplest fix: keep "UserToken" everywhere.
// ─────────────────────────────────────────────────────────────────────────────

export const USER_TOKEN_KEY = "UserToken";

/** Get the logged-in customer's JWT */
export const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);

/** Save the customer JWT after login */
export const setUserToken = (token) => localStorage.setItem(USER_TOKEN_KEY, token);

/** Remove the customer JWT on logout */
export const clearUserToken = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
  // Also clean up the renamed key if it exists from a previous migration attempt
  localStorage.removeItem("userToken");
};

/** Returns Authorization header object — use with axios */
export const getAuthHeaders = () => ({
  Authorization: `Bearer ${getUserToken()}`,
});

/**
 * Decode the JWT payload to get the logged-in user's ID.
 * Does NOT verify the signature — just reads the payload.
 * Returns null if token is missing or malformed.
 */
export const getLoggedInUserId = () => {
  try {
    const token = getUserToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || payload.userId || null;
  } catch {
    return null;
  }
};

/** Check if a customer is currently logged in */
export const isLoggedIn = () => !!getUserToken();