import axiosInstance from './axiosConfig';
import { MinistereRequestDTO, MinistereResponseDTO } from '../types';

export const ministereAPI = {
  creer: async (dto: MinistereRequestDTO): Promise<MinistereResponseDTO> => {
    const res = await axiosInstance.post<MinistereResponseDTO>('/ministeres', dto);
    return res.data;
  },
  obtenirTous: async (): Promise<MinistereResponseDTO[]> => {
    const res = await axiosInstance.get<MinistereResponseDTO[]>('/ministeres');
    return res.data;
  },
  obtenirParId: async (id: string): Promise<MinistereResponseDTO> => {
    const res = await axiosInstance.get<MinistereResponseDTO>(`/ministeres/${id}`);
    return res.data;
  },
  modifier: async (id: string, dto: MinistereRequestDTO): Promise<MinistereResponseDTO> => {
    const res = await axiosInstance.put<MinistereResponseDTO>(`/ministeres/${id}`, dto);
    return res.data;
  },
  // 🟢 إضافة دالة الحذف الفعلي
  supprimer: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/ministeres/${id}`);
  }
};