export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export class BaseService {
  protected baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      import.meta.env.VITE_API_BASE_URL ||
      "https://football-predict-api-m89a.onrender.com/api";
  }

  /**
   * Get auth headers with token from localStorage
   */
  protected getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Generic method to fetch all records from an endpoint
   */
  public async getAll<T>(
    endpoint: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...additionalHeaders,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, text: ${errorText}`
        );
      }

      const result: ApiResponse<T[]> = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : `Failed to fetch ${endpoint}`,
      };
    }
  }

  /**
   * Generic method to fetch a single record by ID
   */
  public async getById<T>(
    endpoint: string,
    id: number | string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...this.getAuthHeaders(),
          ...additionalHeaders,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : `Failed to fetch ${endpoint}/${id}`,
      };
    }
  }

  /**
   * Generic method to create a new record
   */
  public async create<T>(
    endpoint: string,
    data: Partial<T>,
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/${endpoint}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...additionalHeaders,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, text: ${errorText}`
        );
      }

      const result: ApiResponse<T> = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }

  /**
   * Generic method to update a record by ID
   */
  public async update<T>(
    endpoint: string,
    id: number | string,
    data: Partial<T>,
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...additionalHeaders,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : `Failed to update ${endpoint}/${id}`,
      };
    }
  }

  /**
   * Generic method to delete a record by ID
   */
  public async delete(
    endpoint: string,
    id: number | string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...additionalHeaders,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<void> = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : `Failed to delete ${endpoint}/${id}`,
      };
    }
  }

  /**
   * Generic method to fetch with query parameters
   */
  public async getByQuery<T>(
    endpoint: string,
    queryParams: Record<string, string | number | boolean> = {},
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T[]>> {
    try {
      let url = `${this.baseUrl}/${endpoint}`;

      // Add query parameters if provided
      if (Object.keys(queryParams).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...additionalHeaders,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T[]> = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : `Failed to fetch ${endpoint}`,
      };
    }
  }

  /**
   * Generic method to upload a file
   */
  public async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          ...additionalHeaders,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, text: ${errorText}`
        );
      }

      const result: ApiResponse<T> = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }
}
