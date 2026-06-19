import axiosInstance from './axiosConfig';
import { AffectationRequestDTO, AffectationResponseDTO, StatutAffectation } from '../types';

export const affectationAPI = {
  affecter: async (dto: AffectationRequestDTO): Promise<AffectationResponseDTO> => {
    const res = await axiosInstance.post<AffectationResponseDTO>('/affectations', dto);
    return res.data;
  },
  obtenirTous: async (): Promise<AffectationResponseDTO[]> => {
    const res = await axiosInstance.get<AffectationResponseDTO[]>('/affectations');
    return res.data;
  },
  obtenirParId: async (id: string): Promise<AffectationResponseDTO> => {
    const res = await axiosInstance.get<AffectationResponseDTO>(`/affectations/${id}`);
    return res.data;
  },
  obtenirParBien: async (bienId: string): Promise<AffectationResponseDTO[]> => {
    const res = await axiosInstance.get<AffectationResponseDTO[]>(`/affectations/bien/${bienId}`);
    return res.data;
  },
  obtenirParMinistere: async (ministereId: string): Promise<AffectationResponseDTO[]> => {
    const res = await axiosInstance.get<AffectationResponseDTO[]>(`/affectations/ministere/${ministereId}`);
    return res.data;
  },
  obtenirParStatut: async (statut: StatutAffectation): Promise<AffectationResponseDTO[]> => {
    const res = await axiosInstance.get<AffectationResponseDTO[]>(`/affectations/statut/${statut}`);
    return res.data;
  },
  cloturer: async (id: string): Promise<AffectationResponseDTO> => {
    const res = await axiosInstance.patch<AffectationResponseDTO>(`/affectations/${id}/cloturer`);
    return res.data;
  },
  supprimer: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/affectations/${id}`);
  }
};