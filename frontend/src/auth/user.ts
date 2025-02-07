import axios from "axios";
import Prism from "prismjs";
import { getAccessToken } from "../editor/fileOperations";
import { IUserFile, IUserId, PaginationMeta } from "../interface/user";

let currentPage = 1;
const usersPerPage = 10;

/**
 * Fetches and displays all users with pagination.
 * @param {number} [page=1] - The page number to fetch.
 */
export async function showAllUsersFunction(page = 1) {
  const accessToken = getAccessToken();
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL
      }/users?page=${page}&limit=${usersPerPage}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const { data: users, meta } = response.data;
    updateUserUI(users, meta);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Updates the UI to display the list of users and pagination controls.
 * @param {IUserId[]} users - The list of users to display.
 * @param {PaginationMeta} meta - Metadata for pagination.
 */
async function updateUserUI(users: IUserId[], meta: PaginationMeta) {
  const showUsersUI = document.getElementById("showUsersUI");

  if (showUsersUI) {
    showUsersUI.innerHTML = `
    <p >All Users</p>
        <ul class="pb-14">
          ${users
            .map(
              (user) => `
            <li class="ulUsers" data-user-id="${user.userId}">User ID: ${user.userId}, Name: ${user.name}, Email: ${user.email}
            <span class="delete-btn" data-user-id="${user.userId}">Delete</span>
            </li>
          `
            )
            .join("")}
        </ul>
              <div class="pagination pb-1 absolute bottom-5 left-20">
        ${
          meta.page > 1
            ? `<button id="prevPage" class="bg-blue-400 px-2 py-1 rounded-md">Previous</button>`
            : ""
        }
        <span>Page ${meta.page} of ${meta.totalPages}</span>
        ${
          meta.page < meta.totalPages
            ? `<button id="nextPage" class="bg-blue-400 px-2 py-1 rounded-md">Next</button>`
            : ""
        }
      </div>
      `;

    // Add event listeners to each list item
    const userItems = showUsersUI.querySelectorAll(".ulUsers");
    userItems.forEach((item) => {
      item.addEventListener("click", async () => {
        const userId = (item as HTMLLIElement).getAttribute("data-user-id");
        if (userId) {
          try {
            const userFile = await fetchUserFile(userId);
            displayUserFile(userFile);
          } catch (error) {
            console.error("Error fetching user file:", error);
          }
        }
      });
    });

    // Add event listeners to delete buttons
    const deleteButtons = showUsersUI.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        const userId = button.getAttribute("data-user-id");
        event.stopPropagation();
        if (userId) {
          const isConfirmed = window.confirm(
            "Are you sure you want to delete this user?"
          );

          if (isConfirmed) {
            try {
              await deleteUser(userId);
              showAllUsersFunction(currentPage);
            } catch (error) {
              alert("you cannot delete to self or admin");
              console.error("Error deleting user file:", error);
            }
          }
        }
      });
    });

    // Pagination controls
    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");
    if (prevButton) {
      prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          showAllUsersFunction(currentPage);
        }
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", () => {
        if (currentPage < meta.totalPages) {
          currentPage++;
          showAllUsersFunction(currentPage);
        }
      });
    }
  }
}

/**
 * Fetches the file data for a specific user.
 * @param {string} userId - The ID of the user whose file is to be fetched.
 * @returns {Promise<IUserFile>} The user's file data.
 * @throws {Error} If the file fetch request fails.
 */
async function fetchUserFile(userId: string) {
  const accessToken = getAccessToken();
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/files/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user file:", error);
    throw error;
  }
}

/**
 * Escapes HTML special characters in a string to prevent XSS attacks.
 * @param {string} unsafe - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Displays the content of a user's file.
 * @param {IUserFile} userFile - The user's file data to display.
 */
function displayUserFile(userFile: IUserFile) {
  const showUsersUI = document.getElementById("showUsersUI");

  if (showUsersUI) {
    const fileContents = userFile.data
      .map(
        (file) =>
          `<div>
          <h3 class = "pt-1"> file-name: ${file.fileName}</h3>
          <pre><code class="language-js pt-1"> file-code: ${escapeHtml(
            file.fileData
          )}</code></pre>
        </div>`
      )
      .join("");
    if (fileContents) {
      showUsersUI.innerHTML = `
          <p>User File Content:</p>
          ${fileContents}
          `;
    } else {
      showUsersUI.innerHTML = `<p>User File Content:</p><p>Users have no files </p>`;
    }

    Prism.highlightAll();
  }
}

/**
 * Deletes a user by their ID.
 * @param {string} userId - The ID of the user to delete.
 * @throws {Error} If the delete request fails.
 */
async function deleteUser(userId: string) {
  const accessToken = getAccessToken();
  try {
    await axios.delete(`${import.meta.env.VITE_BASE_URL}/users/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    throw error;
  }
}
