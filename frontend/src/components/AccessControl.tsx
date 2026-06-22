import React from 'react';
import { UserRole } from '../context/AuthContext'; 

export type PermissionAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';

// On inclut bien 'users' dans la liste des ressources autorisées
export type Resource = 
  | 'categories' 
  | 'ministeres' 
  | 'biens' 
  | 'mouvements' 
  | 'maintenances' 
  | 'affectations' 
  | 'users';

type PermissionsMatrix = Record<UserRole, Record<Resource, PermissionAction[]>>;

export const ROLE_PERMISSIONS: PermissionsMatrix = {
  ADMIN: {
    categories:   ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    ministeres:   ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    biens:        ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    mouvements:   ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    maintenances: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    affectations: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    users:        ['READ', 'CREATE', 'UPDATE', 'DELETE'],
  },
  GESTIONNAIRE: {
    categories:   ['READ'],
    ministeres:   ['READ'],
    biens:        ['READ', 'CREATE', 'UPDATE'],
    mouvements:   ['READ', 'CREATE'],
    maintenances: ['READ', 'CREATE', 'UPDATE'],
    affectations: ['READ', 'CREATE'],
    users:        ['READ'], 
  },
  AUDITEUR: {
    categories:   ['READ'],
    ministeres:   ['READ'],
    biens:        ['READ'],
    mouvements:   ['READ'],
    maintenances: ['READ'],
    affectations: ['READ'],
    users:        ['READ'], 
  },
  CONSULTANT: {
    categories:   ['READ'],
    ministeres:   ['READ'],
    biens:        ['READ'],
    mouvements:   [],
    maintenances: [],
    affectations: [],
    users:        [], 
  }
};

export const hasPermission = (
  userRole?: string | UserRole | null,
  resource?: Resource,
  action?: PermissionAction
): boolean => {
  if (!userRole || !resource || !action) return false;

  try {
    const normalizedRole = String(userRole).trim().toUpperCase() as UserRole;
    
    const rolePermissions = ROLE_PERMISSIONS[normalizedRole];
    if (!rolePermissions) return false;

    const resourceActions = rolePermissions[resource];
    if (!resourceActions) return false;

    return resourceActions.includes(action);
  } catch (error) {
    console.error(`Erreur d'évaluation des droits pour le rôle : ${userRole}`, error);
    return false;
  }
};

interface AccessDeniedModalProps {
  actionLabel: string;
  onClose: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({ actionLabel, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-red-100">
        <div className="bg-red-50 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3 shadow-inner">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Habilitation insuffisante</h3>
        </div>
        <div className="p-6 text-center text-sm text-slate-600">
          <p>Votre profil actuel ne vous autorise pas à <span className="font-semibold text-slate-900 underline decoration-red-400">{actionLabel}</span>.</p>
          <p className="mt-2 text-xs text-slate-400">Rapprochez-vous d'un Administrateur de la plateforme pour faire évoluer vos privilèges.</p>
        </div>
        <div className="bg-slate-50 px-6 py-3.5 flex justify-center border-t border-slate-100">
          <button onClick={onClose} className="w-full rounded-xl bg-[#00236f] py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#1e3fc2] transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};