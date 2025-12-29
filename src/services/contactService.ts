import { Contact } from '../interfaces';
import { BaseService, ApiResponse } from './BaseService';

// Create instance of BaseService
const baseService = new BaseService();

// Define the contact API response structure
export interface ContactApiResponse {
  contact_id?: number;
  title: string;
  message: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

// Response structure for contacts with pagination
export interface ContactApiResponseWithPagination {
  success: boolean;
  message?: string;
  data?: ContactApiResponse[];
  error?: string;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Get all contacts with optional filtering and pagination
export const getAllContacts = async (filters?: {
  page?: number;
  limit?: number;
}): Promise<ContactApiResponseWithPagination> => {
  try {
    const queryParams: Record<string, string | number> = {};
    if (filters?.page) queryParams.page = filters.page;
    if (filters?.limit) queryParams.limit = filters.limit;
    
    const response = await fetch(`${baseService['baseUrl']}/contacts?${new URLSearchParams(queryParams as Record<string, string>).toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...baseService['getAuthHeaders'](),
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ContactApiResponseWithPagination = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch contacts',
    };
  }
};

// Get a specific contact by ID
export const getContactById = async (id: number): Promise<ApiResponse<ContactApiResponse>> => {
  return await baseService.getById<ContactApiResponse>('contacts', id);
};

// Update a contact
export const updateContact = async (
  id: number, 
  contactData: Partial<Contact>
): Promise<ApiResponse<ContactApiResponse>> => {
  return await baseService.update<ContactApiResponse>('contacts', id, contactData);
};

// Delete a contact
export const deleteContact = async (id: number): Promise<ApiResponse<any>> => {
  return await baseService.delete('contacts', id);
};

// Create a new contact (for completeness, though this is typically a public endpoint)
export const createContact = async (
  contactData: Omit<Contact, 'contact_id'>
): Promise<ApiResponse<ContactApiResponse>> => {
  return await baseService.create<ContactApiResponse>('contacts', contactData);
};