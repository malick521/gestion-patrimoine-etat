import axiosInstance from './axiosConfig';
import { AuditLogResponseDTO } from '../types';

export const auditLogAPI = {
  obtenirTous: async (): Promise<AuditLogResponseDTO[]> => {
    const res = await axiosInstance.get<AuditLogResponseDTO[]>('/audit-logs');
    return res.data;
  },
  obtenirParId: async (id: string): Promise<AuditLogResponseDTO> => {
    const res = await axiosInstance.get<AuditLogResponseDTO>(`/audit-logs/${id}`);
    return res.data;
  },
  obtenirParUser: async (userId: string): Promise<AuditLogResponseDTO[]> => {
    const res = await axiosInstance.get<AuditLogResponseDTO[]>(`/audit-logs/user/${userId}`);
    return res.data;
  },
  obtenirParEntite: async (entite: string): Promise<AuditLogResponseDTO[]> => {
    const res = await axiosInstance.get<AuditLogResponseDTO[]>(`/audit-logs/entite/${entite}`);
    return res.data;
  },
  obtenirParPeriode: async (debut: string, fin: string): Promise<AuditLogResponseDTO[]> => {
    const res = await axiosInstance.get<AuditLogResponseDTO[]>('/audit-logs/periode', {
      params: { debut, fin }
    });
    return res.data;
  }
};