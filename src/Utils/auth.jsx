export const setSession = (token, expiry) => {
  localStorage.setItem("adminToken", token);
  localStorage.setItem("tokenExpiry", expiry);
};

export const setAdminUser = (user) => {
  localStorage.setItem("adminUser", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("tokenExpiry");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("adminUser");
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("adminToken");
  const expiry = localStorage.getItem("tokenExpiry");

  if (!token || !expiry) return false;

  if (Date.now() > Number(expiry)) {
    clearSession();
    return false;
  }

  return true;
};
