import axiosInstance from './axiosConfig';
import { CategorieRequestDTO, CategorieResponseDTO } from '../types';

export const categorieAPI = {
  obtenirTous: async (): Promise<CategorieResponseDTO[]> => {
    const res = await axiosInstance.get<CategorieResponseDTO[]>('/categories');
    return res.data;
  },
  
  creer: async (dto: CategorieRequestDTO): Promise<CategorieResponseDTO> => {
    const res = await axiosInstance.post<CategorieResponseDTO>('/categories', dto);
    return res.data;
  },

  // 🟢 الدالة الجديدة للتعديل (PUT)
  modifier: async (id: string, dto: CategorieRequestDTO): Promise<CategorieResponseDTO> => {
    const res = await axiosInstance.put<CategorieResponseDTO>(`/categories/${id}`, dto);
    return res.data;
  },

  supprimer: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  }
};