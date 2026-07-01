  import axiosInstance from './axiosConfig';
  import { MouvementRequestDTO, MouvementResponseDTO } from '../types';

  export const mouvementAPI = {
    creer: async (dto: MouvementRequestDTO): Promise<MouvementResponseDTO> => {
      const res = await axiosInstance.post<MouvementResponseDTO>('/mouvements', dto);
      return res.data;
    },
    obtenirTous: async (): Promise<MouvementResponseDTO[]> => {
      const res = await axiosInstance.get<MouvementResponseDTO[]>('/mouvements');
      return res.data;
    },
    obtenirParBien: async (bienId: string): Promise<MouvementResponseDTO[]> => {
      const res = await axiosInstance.get<MouvementResponseDTO[]>(`/mouvements/bien/${bienId}`);
      return res.data;
    }
  };