import axiosInstance from './axiosConfig';
import { MaintenanceRequestDTO, MaintenanceResponseDTO } from '../types';

export const maintenanceAPI = {
  creer: async (dto: MaintenanceRequestDTO): Promise<MaintenanceResponseDTO> => {
    const res = await axiosInstance.post<MaintenanceResponseDTO>('/maintenances', dto);
    return res.data;
  },
  obtenirTous: async (): Promise<MaintenanceResponseDTO[]> => {
    const res = await axiosInstance.get<MaintenanceResponseDTO[]>('/maintenances');
    return res.data;
  },
  obtenirParId: async (id: string): Promise<MaintenanceResponseDTO> => {
    const res = await axiosInstance.get<MaintenanceResponseDTO>(`/maintenances/${id}`);
    return res.data;
  },
  terminer: async (id: string): Promise<MaintenanceResponseDTO> => {
    const res = await axiosInstance.patch<MaintenanceResponseDTO>(`/maintenances/${id}/terminer`);
    return res.data;
  },
  annuler: async (id: string): Promise<MaintenanceResponseDTO> => {
    const res = await axiosInstance.patch<MaintenanceResponseDTO>(`/maintenances/${id}/annuler`);
    return res.data;
  },
  supprimer: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/maintenances/${id}`);
  }
};