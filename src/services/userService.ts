import { User } from "../interfaces";
import { BaseService, ApiResponse } from "./BaseService";

// Create instance of BaseService
const baseService = new BaseService();

// User interface is imported from ../interfaces

// Get all users
export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  return await baseService.getAll<User>('users');
};

// Get a specific user by ID
export const getUserById = async (id: number): Promise<ApiResponse<User>> => {
  return await baseService.getById<User>('users', id);
};

// Create a new user
export const createUser = async (userData: {
  name: string;
  email: string;
  provider: 'google' | 'facebook' | 'twitter' | 'email';
  password?: string;
  type: 'user' | 'admin' | 'seed';
}): Promise<ApiResponse<User>> => {
  return await baseService.create<User>('users', userData);
};

// Update a user
export const updateUser = async (
  id: number,
  userData: {
    name?: string;
    email?: string;
    provider?: 'google' | 'facebook' | 'twitter' | 'email';
    password?: string;
    type?: 'user' | 'admin' | 'seed';
  }
): Promise<ApiResponse<User>> => {
  return await baseService.update<User>('users', id, userData);
};

// Delete a user
export const deleteUser = async (id: number): Promise<ApiResponse<void>> => {
  return await baseService.delete('users', id);
};

// Get users by type
export const getUsersByType = async (type: 'user' | 'admin' | 'seed'): Promise<ApiResponse<User[]>> => {
  try {
    // Get all users and filter by type on the client side since the API doesn't support filtering by query params
    const response = await getAllUsers();
    
    if (response.success && response.data) {
      const filteredUsers = response.data.filter(user => user.type === type);
      return {
        success: true,
        data: filteredUsers
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to fetch users'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users'
    };
  }
};

// Get user predictions
export const getUserPredictions = async (userId: number): Promise<ApiResponse<any[]>> => {
  return await baseService.getByQuery<any[]>(`predictions`, { user_id: userId });
};

// Get user comments
export const getUserComments = async (userId: number): Promise<ApiResponse<any[]>> => {
  return await baseService.getByQuery<any[]>(`comments`, { user_id: userId });
};

// Get predictions count
export const getPredictionsCount = async (): Promise<number> => {
  try {
    const result = await baseService.getAll<any>('predictions');
    return result.success && result.data ? result.data.length : 0;
  } catch (error) {
    return 0;
  }
};