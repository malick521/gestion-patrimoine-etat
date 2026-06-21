import React from 'react';
import { AlertTriangle } from 'lucide-react';

// 🔐 MATRICE DES PERMISSIONS
export const hasPermission = (
  userRole: string, 
  // 👉 CORRECTION : Ajout de 'mouvements' dans la liste des ressources autorisées
  resource: 'categories' | 'ministeres' | 'biens' | 'mouvements'| 'maintenances'|'affectations',
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
): boolean => {
  // L'ADMIN a tous les droits partout
  if (userRole === 'ADMIN') return true;

  // LE GESTIONNAIRE a des droits spécifiques
  // LE GESTIONNAIRE a des droits opérationnels
  // LE GESTIONNAIRE a des droits spécifiques et opérationnels
  if (userRole === 'GESTIONNAIRE') {
    if (action === 'READ') return true;
    
    // Droits sur les Catégories
    if (resource === 'categories' && action === 'CREATE') return true;
    
    // Droits sur les Mouvements
    if (resource === 'mouvements' && action === 'CREATE') return true; 
    
    // Droits sur les Affectations
    if (resource === 'affectations' && (action === 'CREATE' || action === 'UPDATE')) return true;
    
    // 👉 LA CORRECTION EST ICI : Le Gestionnaire peut Créer et Modifier les Biens
    if (resource === 'biens' && (action === 'CREATE' || action === 'UPDATE')) return true;

    // Pour tout le reste (comme DELETE), c'est refusé
    return false;
  }

  // L'AUDITEUR et le CONSULTANT n'ont que des droits de lecture
  return action === 'READ';
};

// 🛑 MODALE D'ACCÈS REFUSÉ (Mutualisée pour toute l'application)
interface AccessDeniedModalProps {
  actionLabel: string;
  onClose: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({ actionLabel, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-150">
        <div className="mx-auto h-14 w-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Accès Refusé</h3>
        <p className="text-sm text-slate-500">
          Votre rôle actuel ne vous permet pas de <strong className="text-slate-700">{actionLabel}</strong>. Veuillez contacter un administrateur.
        </p>
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};