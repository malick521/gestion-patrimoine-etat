import axiosInstance from './axiosConfig';
import { LoginRequestDTO, LoginResponseDTO, UserRequestDTO, UserResponseDTO } from '../types';

export const authAPI = {
  login: async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const response = await axiosInstance.post<LoginResponseDTO>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (credentials: UserRequestDTO): Promise<UserResponseDTO> => {
    const response = await axiosInstance.post<UserResponseDTO>('/auth/register', credentials);
    return response.data;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};