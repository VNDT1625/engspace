import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AUTH_EVENTS, getProfile } from "../api";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshProfile: () => Promise.resolve(),
});

const STORAGE_KEYS = {
  token: "authToken",
  user: "authUser",
};

const readStoredAuth = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.token) || sessionStorage.getItem(STORAGE_KEYS.token);
    const userRaw = localStorage.getItem(STORAGE_KEYS.user) || sessionStorage.getItem(STORAGE_KEYS.user);
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const writeStoredAuth = ({ token, user, remember }) => {
  try {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.token, token);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      sessionStorage.removeItem(STORAGE_KEYS.token);
      sessionStorage.removeItem(STORAGE_KEYS.user);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.token, token);
      sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  } catch {
    // storage unavailable
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.token);
    sessionStorage.removeItem(STORAGE_KEYS.user);
  } catch {
    //
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const stored = readStoredAuth();
    if (!stored.token) {
      setLoading(false);
      return;
    }
    setToken(stored.token);
    if (stored.user) {
      setUser(stored.user);
      setLoading(false);
      return;
    }
    try {
      const { data } = await getProfile();
      setUser(data.user);
    } catch {
      clearStoredAuth();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(({ token: nextToken, user: nextUser }, remember = true) => {
    if (!nextToken || !nextUser) return;
    setUser(nextUser);
    setToken(nextToken);
    writeStoredAuth({ token: nextToken, user: nextUser, remember });
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleForcedLogout = () => logout();
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleForcedLogout);
    return () => {
      window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleForcedLogout);
    };
  }, [logout]);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await getProfile();
      if (data?.user) {
        setUser(data.user);
        const remember = Boolean(localStorage.getItem(STORAGE_KEYS.token));
        writeStoredAuth({ token: token || readStoredAuth().token, user: data.user, remember });
      }
      return data?.user;
    } catch (error) {
      return Promise.reject(error);
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      refreshProfile,
    }),
    [user, token, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

