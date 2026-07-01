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

    creer: async (dto: BienRequestDTO, imageFile?: File | null): Promise<BienResponseDTO> => {
      const formData = new FormData();

      formData.append(
        "bien",
        new Blob([JSON.stringify(dto)], { type: "application/json" })
      );

      if (imageFile) {
        formData.append("file", imageFile);
      }

      const response = await axiosInstance.post<BienResponseDTO>('/biens', formData, {
        headers: {
          'Content-Type': undefined, // 👈 force axios à laisser le navigateur générer le bon Content-Type + boundary
        },
      });

      return response.data;
    },

    modifier: async (id: string, dto: BienRequestDTO): Promise<BienResponseDTO> => {
      const response = await axiosInstance.put<BienResponseDTO>(`/biens/${id}`, dto);
      return response.data;
    },

    modifierEtat: async (id: string, etat: EtatBien): Promise<BienResponseDTO> => {
      const response = await axiosInstance.patch<BienResponseDTO>(`/biens/${id}/etat`, null, {
        params: { etat },
      });
      return response.data;
    },

    supprimer: async (id: string): Promise<void> => {
      await axiosInstance.delete(`/biens/${id}`);
    },

    // 1. الدالة الأولى الناقصة: للبحث عن الممتلكات (Recherche)
    rechercher: async (keyword: string): Promise<BienResponseDTO[]> => {
      const response = await axiosInstance.get<BienResponseDTO[]>('/biens/recherche', {
        params: { keyword }
      });
      return response.data;
    },

    // 2. الدالة الثانية الناقصة: جلب الممتلكات حسب الحالة (Filtrage par état)
    obtenirParEtat: async (etat: EtatBien): Promise<BienResponseDTO[]> => {
      const response = await axiosInstance.get<BienResponseDTO[]>(`/biens/etat/${etat}`);
      return response.data;
    }
  };