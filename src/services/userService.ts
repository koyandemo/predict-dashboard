import { User } from "../interfaces";
import { BaseService, ApiResponse } from "./BaseService";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// Create instance of BaseService
const baseService = new BaseService();

// User interface is imported from ../interfaces

// Get all users
export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  return await baseService.getAll<User>('users', getAuthHeaders());
};

// Get a specific user by ID
export const getUserById = async (id: number): Promise<ApiResponse<User>> => {
  return await baseService.getById<User>('users', id, getAuthHeaders());
};

// Create a new user
export const createUser = async (userData: {
  name: string;
  email: string;
  provider: 'google' | 'facebook' | 'twitter' | 'email';
  password?: string;
  type: 'user' | 'admin' | 'seed';
}): Promise<ApiResponse<User>> => {
  return await baseService.create<User>('users', userData, getAuthHeaders());
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
  return await baseService.update<User>('users', id, userData, getAuthHeaders());
};

// Delete a user
export const deleteUser = async (id: number): Promise<ApiResponse<void>> => {
  return await baseService.delete('users', id, getAuthHeaders());
};

// Get user predictions
export const getUserPredictions = async (userId: number): Promise<ApiResponse<any[]>> => {
  return await baseService.getByQuery<any[]>(`predictions`, { user_id: userId }, getAuthHeaders());
};

// Get user comments
export const getUserComments = async (userId: number): Promise<ApiResponse<any[]>> => {
  return await baseService.getByQuery<any[]>(`comments`, { user_id: userId }, getAuthHeaders());
};

// Get predictions count
export const getPredictionsCount = async (): Promise<number> => {
  try {
    const result = await baseService.getAll<any>('predictions', getAuthHeaders());
    return result.success && result.data ? result.data.length : 0;
  } catch (error) {
    console.error("Error fetching predictions count:", error);
    return 0;
  }
};