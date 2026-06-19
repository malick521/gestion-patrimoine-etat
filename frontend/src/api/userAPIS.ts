import axiosInstance from './axiosConfig';
import { UserRequestDTO, UserResponseDTO } from '../types';

export const userAPI = {
  creer: async (dto: UserRequestDTO): Promise<UserResponseDTO> => {
    const res = await axiosInstance.post<UserResponseDTO>('/auth/register', dto);
    return res.data;
  },
  obtenirTous: async (): Promise<UserResponseDTO[]> => {
    const res = await axiosInstance.get<UserResponseDTO[]>('/users');
    return res.data;
  },
  modifierStatut: async (id: string, actif: boolean): Promise<UserResponseDTO> => {
    const res = await axiosInstance.patch<UserResponseDTO>(`/users/${id}/statut`, null, {
      params: { actif }
    });
    return res.data;
  }
};