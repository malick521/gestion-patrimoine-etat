import React, { useEffect, useState, useCallback } from 'react';
import { affectationAPI } from '../../api/affectationAPI';
import axiosInstance from '../../api/axiosConfig'; // Importation de l'instance pour les autres appels
import { AffectationResponseDTO, AffectationRequestDTO } from '../../types';
import Badge from '../../components/ui/Badge';
import { Plus, X, Handshake, FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Interfaces légères pour alimenter les listes déroulantes
interface MiniBien {
  id: string;
  designation: string;
  codeInventaire?: string;
  etat?: string; 
}

interface MiniMinistere {
  id: string;
  nom: string;
  code?: string;
}

// Déclaration locale des APIs manquantes pour récupérer vos vraies données
const bienAPI = {
  obtenirTous: async (): Promise<MiniBien[]> => {
    const res = await axiosInstance.get<MiniBien[]>('/biens'); // Ajustez le endpoint selon votre backend (ex: /api/biens ou /biens)
    return res.data;
  }
};

const ministereAPI = {
  obtenirTous: async (): Promise<MiniMinistere[]> => {
    const res = await axiosInstance.get<MiniMinistere[]>('/ministeres'); // Ajustez le endpoint selon votre backend
    return res.data;
  }
};

export const AffectationsPage: React.FC = () => {
  const [affs, setAffs] = useState<AffectationResponseDTO[]>([]);
  const [biensDisponibles, setBiensDisponibles] = useState<MiniBien[]>([]);
  const [ministeres, setMinisteres] = useState<MiniMinistere[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDamageable: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, isDamageable: false });

  const [formData, setFormData] = useState<AffectationRequestDTO>({
    bienId: '',
    ministereId: '',
    dateDebut: '',
    motif: '',
    observations: ''
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const loadAffectations = useCallback(() => {
    affectationAPI.obtenirTous()
      .then(setAffs)
      .catch(() => showToast("Erreur lors du chargement des données", "error"));
  }, [showToast]);

  // Chargement des listes de références réelles depuis la base de données
  const loadFormReferences = useCallback(async () => {
    try {
      const [vraisBiens, vraisMinisteres] = await Promise.all([
        bienAPI.obtenirTous(),
        ministereAPI.obtenirTous()
      ]);

      // Optionnel : Filtrer côté client pour n'afficher que les biens qui ne sont ni réformés ni en maintenance si nécessaire
      setBiensDisponibles(vraisBiens);
      setMinisteres(vraisMinisteres);
    } catch (error) {
      console.error("Erreur de chargement des référentiels", error);
      showToast("Erreur lors de la récupération des listes de biens et ministères réels.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    loadAffectations();
    loadFormReferences();
  }, [loadAffectations, loadFormReferences]);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, isDamageable = false) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, isDamageable });
  };

  const handleCloture = (id: string) => {
    triggerConfirm(
      "Clôturer l'affectation",
      "Voulez-vous acter la clôture définitive de cette mise à disposition ? Le statut passera à CLOTUREE.",
      async () => {
        try {
          await affectationAPI.cloturer(id);
          showToast("L'affectation a été clôturée avec succès.");
          loadAffectations();
        } catch {
          showToast("Impossible de clôturer l'affectation.", "error");
        }
      }
    );
  };

  const handleSupprimer = (id: string) => {
    triggerConfirm(
      "Suppression définitive",
      "Attention, voulez-vous vraiment supprimer cette affectation ? Cette action est irréversible sur la base de données.",
      async () => {
        try {
          await affectationAPI.supprimer(id);
          showToast("Affectation supprimée définitivement.", "info");
          loadAffectations();
        } catch {
          showToast("Erreur lors de la suppression.", "error");
        }
      },
      true
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await affectationAPI.affecter(formData);
      setIsModalOpen(false);
      showToast("Nouvelle mise à disposition enregistrée !");
      loadAffectations();
      setFormData({ bienId: '', ministereId: '', dateDebut: '', motif: '', observations: '' });
    } catch (error: any) {
      console.error(error);
      const messageErreur = error.response?.data?.message || "Erreur de validation. Le bien sélectionné est peut-être déjà affecté.";
      showToast(messageErreur, "error");
    }
  };

  const getBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'ACTIVE': return 'success';
      case 'CLOTUREE': return 'info';
      case 'SUSPENDUE': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen relative">
      
      {/* Notifications Toasts Flottants */}
      <div className="fixed top-5 right-5 z-50 space-y-3 w-80">
        {toasts.map((t) => (
          <div key={t.id} className={`p-4 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
            {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>

      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registre des Mises à Disposition (Affectations)</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Affectation
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left font-bold text-gray-700">
            <tr>
              <th className="px-6 py-4">Bien Public</th>
              <th className="px-6 py-4">Bénéficiaire</th>
              <th className="px-6 py-4">Date Prise Effet</th>
              <th className="px-6 py-4">Statut Légal</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {affs.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{a.bienDesignation || a.bienId}</td>
                <td className="px-6 py-4 text-gray-600">{a.ministereNom || a.ministereId}</td>
                <td className="px-6 py-4 text-gray-600">{a.dateDebut}</td>
                <td className="px-6 py-4">
                  <Badge variant={getBadgeVariant(String(a.statut))}>{String(a.statut)}</Badge>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {String(a.statut) === 'ACTIVE' && (
                    <button 
                      onClick={() => handleCloture(a.id)} 
                      className="text-xs bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white px-3 py-1.5 rounded-lg border border-amber-200 transition font-semibold"
                    >
                      Clôturer
                    </button>
                  )}
                  <button 
                    onClick={() => handleSupprimer(a.id)} 
                    className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg border border-rose-200 transition font-semibold"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {affs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucune affectation trouvée dans le système.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de création */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-6 border-b border-gray-100 flex items-start justify-between relative">
              <div className="flex gap-4">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 mt-1">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E293B]">Créer une Affectation</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Mettre à disposition un bien public ou l'affecter à un ministère spécifique.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bien concerné</label>
                  <select 
                    required 
                    value={formData.bienId} 
                    onChange={e => setFormData({...formData, bienId: e.target.value})} 
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                  >
                    <option value="">Sélectionner le matériel...</option>
                    {biensDisponibles.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.designation} {b.codeInventaire ? `(${b.codeInventaire})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ministère Bénéficiaire</label>
                  <select 
                    required 
                    value={formData.ministereId} 
                    onChange={e => setFormData({...formData, ministereId: e.target.value})} 
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                  >
                    <option value="">Sélectionner le cessionnaire...</option>
                    {ministeres.map(m => (
                      <option key={m.id} value={m.id}>{m.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date de prise d'effet</label>
                <input 
                  required 
                  type="date" 
                  value={formData.dateDebut} 
                  onChange={e => setFormData({...formData, dateDebut: e.target.value})} 
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Motif de l'opération</label>
                <input 
                  required 
                  type="text" 
                  placeholder="ex: Réaffectation de service, Fin de déploiement..." 
                  value={formData.motif} 
                  onChange={e => setFormData({...formData, motif: e.target.value})} 
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observations additionnelles</label>
                <textarea 
                  rows={3}
                  placeholder="Références PV, état du bien lors du transfert..." 
                  value={formData.observations || ''} 
                  onChange={e => setFormData({...formData, observations: e.target.value})} 
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none" 
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#111827] hover:bg-slate-800 rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Valider l'opération
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${confirmDialog.isDamageable ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{confirmDialog.title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${
                  confirmDialog.isDamageable ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#111827] hover:bg-slate-800'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AffectationsPage;