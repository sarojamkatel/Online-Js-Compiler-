import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { CHECK_STATUS_NUM } from "../constants";
import { getAccessToken } from "../editor/fileOperations";
import { HTTPSSTATUS } from "../enums/httpStatus";
import { logOutFunction } from "./login";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
});
let authCheckInterval: NodeJS.Timeout | null = null;

/**
 * Initializes authentication status check on window load.
 * If the user is logged in, starts periodic authentication status checks.
 */
window.addEventListener("load", async () => {
  const isLoggedIn = await checkAuthStatus();
  if (isLoggedIn) {
    authCheckInterval = startAuthStatusCheck();
  }
});

/**
 * Logs out the user and alerts that the session has expired.
 * This function should be called when a session expires.
 */
const sessionExpiredLogout = () => {
  alert("Your session has expired. Please log in again.");
  logOutFunction();
};

/**
 * Refreshes the access token using the refresh token stored in localStorage.
 * @returns {Promise<string>} The new access token.
 * @throws {Error} If no refresh token is available or if the refresh request fails.
 */
const refreshToken = async (): Promise<string> => {
  const userCredentials = JSON.parse(
    sessionStorage.getItem("userCredentials") || "{}"
  );
  const [, refreshToken] = userCredentials;

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/refresh-token`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    const newAccessToken = response.data.accessToken;

    return newAccessToken;
  } catch (error) {
    throw error;
  }
};

// Request interceptor to add the access token to the headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userCredentials = JSON.parse(
      sessionStorage.getItem("userCredentials") || "{}"
    );
    const [accessToken] = userCredentials;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle token expiration and retry requests
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshToken();
        const userCredentials = JSON.parse(
          sessionStorage.getItem("userCredentials") || "{}"
        );
        userCredentials[0] = newAccessToken;

        sessionStorage.setItem(
          "userCredentials",
          JSON.stringify(userCredentials)
        );

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        sessionExpiredLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Checks the authentication status of the user by making a request to the /auth/status endpoint.
 * @returns {Promise<boolean>} True if the user is authenticated, false otherwise.
 */
async function checkAuthStatus() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return false;
  }
  try {
    await api.get("/auth/status", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return true;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === HTTPSSTATUS.Unauthorized
    ) {
      sessionExpiredLogout();
    }
    return false;
  }
}

/**
 * Starts periodic checks of authentication status.
 * @param {number} interval The interval time in milliseconds for checking authentication status (default is 5min).
 * @returns {NodeJS.Timeout} The interval ID.
 */
function startAuthStatusCheck(interval = CHECK_STATUS_NUM) {
  return setInterval(checkAuthStatus, interval);
}

/**
 * Initializes the authentication status check interval after user login.
 */
export function onUserLogin() {
  if (!authCheckInterval) {
    authCheckInterval = startAuthStatusCheck();
  }
}

/**
 * Clears the authentication status check interval after user logout.
 */
export function onUserLogout() {
  if (authCheckInterval) {
    clearInterval(authCheckInterval);
    authCheckInterval = null;
  }
}

export default api;
