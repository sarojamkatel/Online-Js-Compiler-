export class ApiResponse<T> {
  message: string = "Success";
  success: boolean;
  data: T | null;
  /**
   * Creates an instance of ApiResponse.
   *
   * @param {string} message - The message to include in the response.
   * @param {T} [data] - Optional data to include in the response.
   */
  constructor(message: string, data: T | null = null) {
    this.message = message;
    this.data = data;
    this.success = true;
  }
}
