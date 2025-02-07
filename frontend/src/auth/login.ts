import axios from "axios";
import { ERROR_TIME_OUT, LOGIN_TIME_OUT } from "../constants";
import {
  fetchFilesFromBackend,
  getAccessToken,
  initializeLocalStorage,
} from "../editor/fileOperations";
import {
  IErrorResponse,
  INewUser,
  IUser,
  IupdateUser,
} from "../interface/user";
import { afterLoginUI, showAllUsersBtn } from "../main";
import { AfterLoginFunction, loginBackFunction, removeLogin } from "./authUi";
import { onUserLogin, onUserLogout } from "./interceptor";

const loginError = document.getElementById(
  "loginError"
) as HTMLParagraphElement;
const passwordUpdateError = document.getElementById(
  "passwordUpdateError"
) as HTMLParagraphElement;

/**
 * Logs out the user by removing credentials from localStorage,
 * updating the UI, and initializing local storage.
 */
export async function logOutFunction() {
  sessionStorage.removeItem("userCredentials");
  AfterLoginFunction();
  await initializeLocalStorage();
  onUserLogout();
}

/**
 * Logs in a user by sending a POST request with user credentials.
 * If successful, stores the access and refresh tokens in localStorage
 * and updates the UI. Handles and displays login errors.
 * @param {IUser} user - The user credentials for login.
 */
export const loginUser = async (user: IUser) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/login`,
      user,
      {
        timeout: LOGIN_TIME_OUT,
      }
    );

    const addedUser = response.data;
    const { accessToken, refreshToken, name } = addedUser;

    const userArray = [accessToken, refreshToken, name];
    sessionStorage.setItem("userCredentials", JSON.stringify(userArray));

    AfterLoginFunction();
    removeLogin();
    fetchFilesFromBackend();
    onUserLogin();
  } catch (error: any) {
    const errorResponse = error.response?.data as IErrorResponse;
    if (error.code === "ECONNABORTED") {
      loginError.textContent = "Request timed out";
    } else {
      loginError.textContent = errorResponse?.message || "An error occurred";
    }
    setTimeout(() => {
      loginError.textContent = "";
    }, ERROR_TIME_OUT);
  }
};

/**
 * Registers a new user by sending a POST request with user details.
 * If successful, alerts the user and navigates back to the login screen.
 * @param {INewUser} newUser - The details of the new user to be registered.
 */
export const registerUser = async (newUser: INewUser) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/signup`,
      newUser,
      {
        timeout: 10000,
      }
    );
    const registeredUser = response.data;
    alert("you are succesfully signup ");
    loginBackFunction();
  } catch (error: any) {
    if (error.code === "ECONNABORTED") {
      console.error("Request timed out");
    } else {
      const errorResponse = error.response?.data as IErrorResponse;
      loginError.textContent = errorResponse?.message || "An error occurred";
      setTimeout(() => {
        loginError.textContent = "";
      }, ERROR_TIME_OUT);
    }
  }
};

/**
 * Updates the user's password by sending a PUT request with updated user details.
 * @param {IupdateUser} user - The updated user details.
 */

export async function updatePasswordFunction(user: IupdateUser) {
  const accessToken = getAccessToken();
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/users`,
      user,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    // Get the error message from the error field instead of message
    const errorMessage = error.response?.data?.error || "An error occurred";

    // Update the error display
    passwordUpdateError.textContent = errorMessage;
    passwordUpdateError.style.display = "block";

    setTimeout(() => {
      passwordUpdateError.textContent = "";
      passwordUpdateError.style.display = "none";
    }, ERROR_TIME_OUT);

    throw new Error(errorMessage);
  }
}
/**
 * Fetches user details after login and shows additional UI elements if the user is verified.
 * Handles errors and removes UI elements if there is an issue.
 */
export async function afterLoginShow() {
  const accessToken = getAccessToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/auth/me`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const result = response.data.message;
    if (result === "Verified") {
      afterLoginUI.appendChild(showAllUsersBtn);
    }
  } catch (error) {
    console.error("Error fetching admin  route:", error);
    if (afterLoginUI.contains(showAllUsersBtn)) {
      afterLoginUI.removeChild(showAllUsersBtn);
    }
    throw error;
  }
}
