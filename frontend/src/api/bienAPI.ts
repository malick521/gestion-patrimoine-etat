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

      // 1. Ajouter les données du formulaire (DTO) en tant que Blob JSON
      formData.append(
        "bien", // ⚠️ Ce nom doit correspondre exactement à ce que le backend attend (ex: @RequestPart("bien"))
        new Blob([JSON.stringify(dto)], {
          type: "application/json",
        })
      );

      // 2. Ajouter le fichier image s'il a été sélectionné
      if (imageFile) {
        // ⚠️ "file" ou "image" : assurez-vous que le nom correspond à votre backend
        formData.append("file", imageFile); 
      }

      // 3. Envoyer la requête
      const response = await axiosInstance.post<BienResponseDTO>('/biens', formData, {
        headers: {
          // Axios définit généralement le Content-Type automatiquement avec FormData,
          // mais c'est une bonne pratique de s'assurer qu'il gère le multipart
          'Content-Type': 'multipart/form-data',
        },
      })
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