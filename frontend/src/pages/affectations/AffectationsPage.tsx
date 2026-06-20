import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { affectationAPI } from '../../api/affectationAPI';
import axiosInstance from '../../api/axiosConfig';
import { AffectationResponseDTO, AffectationRequestDTO } from '../../types';
import { 
  Handshake, Search, Filter, Eye, CheckCircle, Trash2, 
  Plus, Calendar, Building, FileText, User, Activity, 
  Settings, Clock, X, AlertTriangle, AlertCircle, CheckCircle2, Info, Building2, Download
} from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Interfaces légères pour alimenter les listes déroulantes
interface MiniBien { id: string; designation: string; codeInventaire?: string; etat?: string; }
interface MiniMinistere { id: string; nom: string; code?: string; }

const bienAPI = {
  obtenirTous: async (): Promise<MiniBien[]> => {
    const res = await axiosInstance.get<MiniBien[]>('/biens');
    return res.data;
  }
};
const ministereAPI = {
  obtenirTous: async (): Promise<MiniMinistere[]> => {
    const res = await axiosInstance.get<MiniMinistere[]>('/ministeres');
    return res.data;
  }
};

export const AffectationsPage: React.FC = () => {
  const [affectations, setAffectations] = useState<AffectationResponseDTO[]>([]);
  const [biensDisponibles, setBiensDisponibles] = useState<MiniBien[]>([]);
  const [ministeres, setMinisteres] = useState<MiniMinistere[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("TOUS");

  // UI States
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<AffectationResponseDTO | null>(null);

  // Alertes UI
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'info'}>({ show: false, message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState<{show: boolean, title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'success'}>({ show: false, title: '', message: '', onConfirm: () => {}, variant: 'warning' });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  }, []);

  const requestAction = (title: string, message: string, action: () => Promise<void>, variant: 'danger' | 'warning' | 'success' = 'warning') => {
    setConfirmDialog({
      show: true, title, message, variant,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, show: false }));
        await action();
      }
    });
  };

  const chargerDonnees = useCallback(async () => {
    try {
      setLoading(true);
      const [affData, biensData, minData] = await Promise.all([
        affectationAPI.obtenirTous(),
        bienAPI.obtenirTous(),
        ministereAPI.obtenirTous()
      ]);
      setAffectations(affData);
      setBiensDisponibles(biensData);
      setMinisteres(minData);
    } catch (err) {
      console.error("Erreur chargement", err);
      showNotification("Impossible de charger les données.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  const handleCreateAffectation = async (dto: AffectationRequestDTO) => {
    try {
      await affectationAPI.affecter(dto);
      setOpenForm(false);
      showNotification("Nouvelle mise à disposition enregistrée !", "success");
      chargerDonnees();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erreur lors de l'affectation. Le bien est peut-être déjà affecté.", "error");
    }
  };

  const handleCloture = (id: string) => {
    requestAction(
      "Clôturer l'affectation",
      "Voulez-vous acter la clôture définitive de cette mise à disposition ? Le statut passera à CLOTUREE.",
      async () => {
        try {
          await affectationAPI.cloturer(id);
          if (selectedDetail?.id === id) setSelectedDetail(null);
          showNotification("L'affectation a été clôturée avec succès.", "success");
          chargerDonnees();
        } catch {
          showNotification("Impossible de clôturer l'affectation.", "error");
        }
      },
      "success"
    );
  };

  const handleSupprimer = (id: string) => {
    requestAction(
      "Suppression définitive",
      "Attention, voulez-vous vraiment supprimer cette affectation ? Cette action est irréversible.",
      async () => {
        try {
          await affectationAPI.supprimer(id);
          if (selectedDetail?.id === id) setSelectedDetail(null);
          showNotification("Affectation supprimée définitivement.", "info");
          chargerDonnees();
        } catch {
          showNotification("Erreur lors de la suppression.", "error");
        }
      },
      "danger"
    );
  };

  const stats = useMemo(() => {
    const total = Array.isArray(affectations) ? affectations.length : 0;
    const actives = Array.isArray(affectations) ? affectations.filter(a => String(a.statut) === 'ACTIVE').length : 0;
    const cloturees = Array.isArray(affectations) ? affectations.filter(a => String(a.statut) === 'CLOTUREE').length : 0;
    // Compter les ministères uniques actifs
    const minUniques = new Set(Array.isArray(affectations) ? affectations.filter(a => String(a.statut) === 'ACTIVE').map(a => a.ministereId) : []).size;

    return { total, actives, cloturees, minUniques };
  }, [affectations]);

  const filteredAffectations = useMemo(() => {
    if (!Array.isArray(affectations)) return [];
    return affectations.filter(a => {
      const searchStr = `${a.bienDesignation || ''} ${a.ministereNom || ''} ${a.bienId || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "TOUS" || String(a.statut) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [affectations, searchQuery, statusFilter]);

  // 🟢 EXPORT PDF
  const exporterPDF = () => {
    const doc = new jsPDF('landscape'); 

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); 
    doc.text("Registre des Affectations (Mises à Disposition)", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateExtraction = new Date().toLocaleString('fr-FR');
    doc.text(`Date d'extraction : ${dateExtraction}`, 14, 30);
    doc.text(`Nombre d'affectations listées : ${filteredAffectations.length}`, 14, 36);

    const tableColumn = ["Bien Public", "Bénéficiaire", "Date Prise Effet", "Statut Légal", "Motif de l'opération"];
    const tableRows = filteredAffectations.map(a => [
      a.bienDesignation || a.bienId || "N/A",
      a.ministereNom || a.ministereId || "N/A",
      a.dateDebut ? new Date(a.dateDebut).toLocaleDateString("fr-FR") : 'Non définie',
      String(a.statut) || "N/A",
      a.motif || "Non spécifié"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' }, // Vert émeraude
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 75 },
        1: { cellWidth: 70 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 55 },
      }
    });

    doc.save(`Affectations_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-8 w-full bg-slate-50/50 min-h-screen relative">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mises à Disposition (Affectations)</h1>
            <p className="mt-1 text-sm text-slate-500">
              Registre des dotations en matériel et actifs immobiliers de l'État aux ministères.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exporterPDF}
              disabled={loading || filteredAffectations.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-slate-500" /> Exporter PDF
            </button>
            <button
              onClick={() => setOpenForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#059669] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#047857]"
            >
              <Plus className="h-4 w-4" /> Nouvelle Affectation
            </button>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Activity} label="Total Registre" value={stats.total.toString()} tone="primary" />
          <StatCard icon={Handshake} label="Affectations Actives" value={stats.actives.toString()} tone="success" />
          <StatCard icon={Clock} label="Dotations Clôturées" value={stats.cloturees.toString()} tone="info" />
          <StatCard icon={Building2} label="Ministères Équipés" value={stats.minUniques.toString()} tone="warning" />
        </div>

        {/* BARRE D'OUTILS ET TABLEAU */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
            <div className="relative min-w-0 flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par matériel, ministère..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-slate-900"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOTUREE">CLOTUREE</option>
                <option value="SUSPENDUE">SUSPENDUE</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50 font-bold text-gray-700">
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="px-6 py-3.5">Bien Public</th>
                  <th className="px-6 py-3.5">Bénéficiaire</th>
                  <th className="px-6 py-3.5">Date Prise Effet</th>
                  <th className="px-6 py-3.5 text-center">Statut Légal</th>
                  <th className="w-32 px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium animate-pulse">
                      Chargement des affectations...
                    </td>
                  </tr>
                ) : filteredAffectations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
                        <Handshake className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-600">Aucune affectation trouvée dans le système.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAffectations.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{a.bienDesignation || a.bienId}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {a.bienId?.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700">{a.ministereNom || a.ministereId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {a.dateDebut ? new Date(a.dateDebut).toLocaleDateString("fr-FR") : ''}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge statut={String(a.statut)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedDetail(a)}
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-blue-600 transition"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {String(a.statut) === 'ACTIVE' && (
                            <button
                              onClick={() => handleCloture(a.id)}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition"
                              title="Clôturer l'affectation"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleSupprimer(a.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS ET TOASTS */}
      {openForm && (
        <AffectationFormModal
          biens={biensDisponibles}
          ministeres={ministeres}
          onClose={() => setOpenForm(false)}
          onSave={handleCreateAffectation}
          onError={showNotification}
        />
      )}

      {selectedDetail && (
        <DetailsSlideOver
          a={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onCloturer={handleCloture}
        />
      )}

      <ConfirmModal 
        show={confirmDialog.show} 
        title={confirmDialog.title} 
        message={confirmDialog.message} 
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm} 
        onCancel={() => setConfirmDialog(prev => ({ ...prev, show: false }))} 
      />

      <NotificationToast 
        show={notification.show} 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification(prev => ({ ...prev, show: false }))} 
      />
    </div>
  );
};

/* ---------- SOUS-COMPOSANTS ---------- */

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  const tones: Record<string, string> = {
    primary: "bg-slate-900 text-white",
    info: "bg-blue-50 text-blue-600 border border-blue-100",
    warning: "bg-amber-50 text-amber-600 border border-amber-100",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  };
  return (
    <div className="rounded-2xl p-5 shadow-sm bg-white border border-gray-200 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tone === 'primary' ? 'bg-[#059669] text-white' : tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const isActif = statut === 'ACTIVE';
  const isCloture = statut === 'CLOTUREE';
  
  let classes = "bg-slate-100 text-slate-600 border-slate-300";
  if (isActif) classes = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (isCloture) classes = "bg-blue-50 text-blue-700 border-blue-200";
  if (statut === 'SUSPENDUE') classes = "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${classes}`}>
      {statut}
    </span>
  );
}

const inputCls = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition";

function AffectationFormModal({ biens, ministeres, onClose, onSave, onError }: {
  biens: MiniBien[];
  ministeres: MiniMinistere[];
  onClose: () => void;
  onSave: (dto: AffectationRequestDTO) => void;
  onError: (msg: string, type: 'error') => void;
}) {
  const [dto, setDto] = useState<AffectationRequestDTO>({
    bienId: '',
    ministereId: '',
    dateDebut: '',
    motif: '',
    observations: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dto.bienId || !dto.ministereId) {
      onError("Veuillez sélectionner un bien et un ministère.", "error");
      return;
    }
    onSave(dto);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-sm items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Créer une Affectation</h3>
              <p className="mt-0.5 text-xs text-gray-500">Mettre à disposition un bien public à un ministère.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 max-h-[65vh] overflow-y-auto">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">Bien concerné *</span>
            <select required className={inputCls} value={dto.bienId} onChange={e => setDto({...dto, bienId: e.target.value})}>
              <option value="" disabled>Sélectionner le matériel...</option>
              {biens.map(b => (
                <option key={b.id} value={b.id}>{b.designation} {b.codeInventaire ? `(${b.codeInventaire})` : ''}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">Ministère Bénéficiaire *</span>
            <select required className={inputCls} value={dto.ministereId} onChange={e => setDto({...dto, ministereId: e.target.value})}>
              <option value="" disabled>Sélectionner le cessionnaire...</option>
              {ministeres.map(m => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">Date de prise d'effet *</span>
            <input type="date" required className={inputCls} onChange={e => setDto({...dto, dateDebut: e.target.value})} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">Motif de l'opération *</span>
            <input type="text" required placeholder="ex: Réaffectation de service..." className={inputCls} onChange={e => setDto({...dto, motif: e.target.value})} />
          </label>

          <label className="sm:col-span-2 block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">Observations additionnelles</span>
            <textarea rows={3} placeholder="Références PV, état du bien lors du transfert..." className={inputCls} onChange={e => setDto({...dto, observations: e.target.value})} />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
          <button type="button" onClick={onClose} className="rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">Annuler</button>
          <button type="submit" className="rounded-xl bg-[#059669] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#047857] flex items-center gap-2">
            <FileText className="h-4 w-4" /> Valider l'opération
          </button>
        </div>
      </form>
    </div>
  );
}

function DetailsSlideOver({ a, onClose, onCloturer }: {
  a: AffectationResponseDTO;
  onClose: () => void;
  onCloturer: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="h-full w-full max-w-md flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-[#059669] text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/20 text-white">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-md font-bold leading-none">Fiche d'Affectation</h3>
              <p className="text-xs text-emerald-100 font-mono mt-1.5">ID: {a.id?.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6 bg-slate-50/60 text-sm">
          <section className="bg-white rounded-xl p-4 border border-gray-200 space-y-3 shadow-sm">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Bien Public Transféré</span>
              <h4 className="text-lg font-bold text-slate-900 mt-0.5">{a.bienDesignation || a.bienId}</h4>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400 block">Statut Actuel</span>
              <div className="mt-1"><StatusBadge statut={String(a.statut)} /></div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
            <div className="flex gap-3">
              <Building className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-400 block">Ministère Bénéficiaire</span>
                <p className="font-bold text-slate-800 mt-0.5">{a.ministereNom || a.ministereId}</p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 pt-3">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-400 block">Prise d'effet</span>
                <p className="font-semibold text-slate-900 mt-0.5">{a.dateDebut ? new Date(a.dateDebut).toLocaleDateString("fr-FR") : 'Non définie'}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
            <h5 className="font-bold text-slate-900 flex items-center gap-2"><FileText className="h-4 w-4 text-gray-400"/> Motif & Observations</h5>
            <div className="text-gray-700 bg-slate-50 p-3 rounded-lg text-xs leading-relaxed border border-gray-100 space-y-2">
              <p><strong>Motif :</strong> {a.motif || 'Non spécifié'}</p>
              {a.observations && (
                <p><strong>Obs. :</strong> {a.observations}</p>
              )}
            </div>
          </section>

          {String(a.statut) === 'ACTIVE' && (
            <section className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 space-y-3 text-xs">
              <h5 className="font-bold text-amber-950 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-amber-600"/> Actions rapides</h5>
              <div className="pt-1">
                <button onClick={() => { onClose(); onCloturer(a.id); }} className="w-full rounded-lg bg-amber-600 text-white py-2 font-bold hover:bg-amber-700 transition shadow-sm">
                  Clôturer l'affectation
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ show, title, message, variant, onConfirm, onCancel }: { show: boolean, title: string, message: string, variant: 'danger'|'warning'|'success', onConfirm: () => void, onCancel: () => void }) {
  if (!show) return null;

  const styles = {
    danger: { bg: 'bg-red-100', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700', icon: AlertTriangle },
    warning: { bg: 'bg-amber-100', text: 'text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700', icon: AlertCircle },
    success: { bg: 'bg-emerald-100', text: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700', icon: CheckCircle2 },
  };
  const StyleInfo = styles[variant];
  const Icon = StyleInfo.icon;

  return (
    <div className="fixed inset-0 z-[60] flex bg-slate-900/40 backdrop-blur-sm items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex gap-4">
          <div className={`shrink-0 grid h-12 w-12 place-items-center rounded-full ${StyleInfo.bg} ${StyleInfo.text}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
          <button onClick={onCancel} className="rounded-xl bg-white border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">Annuler</button>
          <button onClick={onConfirm} className={`rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm ${StyleInfo.btn}`}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

function NotificationToast({ show, message, type, onClose }: { show: boolean, message: string, type: 'success'|'error'|'info', onClose: () => void }) {
  if (!show) return null;
  
  const styles = {
    success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: CheckCircle2, iconColor: 'text-emerald-500' },
    error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: AlertCircle, iconColor: 'text-red-500' },
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: Info, iconColor: 'text-blue-500' },
  };
  const StyleInfo = styles[type];
  const Icon = StyleInfo.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-[70] flex max-w-sm items-center gap-3 rounded-xl border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 ${StyleInfo.bg}`}>
      <Icon className={`h-5 w-5 shrink-0 ${StyleInfo.iconColor}`} />
      <p className={`text-sm font-semibold ${StyleInfo.text}`}>{message}</p>
      <button onClick={onClose} className={`ml-auto shrink-0 opacity-60 hover:opacity-100 ${StyleInfo.text}`}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default AffectationsPage;