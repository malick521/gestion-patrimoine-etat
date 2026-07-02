import axiosInstance from './axiosConfig';
import { BienRequestDTO, BienResponseDTO, EtatBien } from '../types';

export const bienAPI = {

    obtenirTous: async (): Promise<BienResponseDTO[]> => {
        const response = await axiosInstance.get<BienResponseDTO[]>('/biens');
        return response.data;
    },

    obtenirParId: async (id: string): Promise<BienResponseDTO> => {
        const response = await axiosInstance.get<BienResponseDTO>(`/biens/${id}`);
        return response.data;
    },

    // ✅ JSON pur — plus de FormData ici
   creer: async (dto: BienRequestDTO): Promise<BienResponseDTO> => {
    const response = await axiosInstance.post<BienResponseDTO>('/biens', dto);
    return response.data;
},

    // ✅ Upload image séparé
  uploadImage: async (id: string, file: File): Promise<BienResponseDTO> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<BienResponseDTO>(
        `/biens/${id}/image`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    );
    return response.data;
},
    modifier: async (id: string, dto: BienRequestDTO): Promise<BienResponseDTO> => {
        const response = await axiosInstance.put<BienResponseDTO>(`/biens/${id}`, dto);
        return response.data;
    },

    modifierEtat: async (id: string, etat: EtatBien): Promise<BienResponseDTO> => {
        const response = await axiosInstance.patch<BienResponseDTO>(
            `/biens/${id}/etat`, null, { params: { etat } }
        );
        return response.data;
    },

    supprimer: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/biens/${id}`);
    },

    rechercher: async (keyword: string): Promise<BienResponseDTO[]> => {
        const response = await axiosInstance.get<BienResponseDTO[]>(
            '/biens/recherche', { params: { keyword } }
        );
        return response.data;
    },

    obtenirParEtat: async (etat: EtatBien): Promise<BienResponseDTO[]> => {
        const response = await axiosInstance.get<BienResponseDTO[]>(`/biens/etat/${etat}`);
        return response.data;
    }
};