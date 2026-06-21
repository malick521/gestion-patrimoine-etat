import React, { useEffect, useState, useMemo } from 'react';
import { maintenanceAPI } from '../../api/maintenanceAPI';
import { bienAPI } from '../../api/bienAPI';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, AccessDeniedModal } from '../../components/AccessControl';
import { 
  MaintenanceResponseDTO, 
  MaintenanceRequestDTO, 
  TypeMaintenance, 
  StatutMaintenance,
  BienResponseDTO 
} from '../../types';
import { 
  Wrench, Search, Filter, Eye, CheckCircle, XCircle, Trash2, 
  Plus, Calendar, DollarSign, FileText, User, Activity, 
  Settings, Clock, X, AlertTriangle, AlertCircle, CheckCircle2, Info, Download
} from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const MaintenancesPage: React.FC = () => {
  // 🔐 CONNEXION AU CONTEXTE D'AUTHENTIFICATION
  const { user } = useAuth();
  const userRole = user?.role || 'CONSULTANT';

  // 🔐 ÉVALUATION DES DROITS (Ressource: 'maintenances')
  const canRead = hasPermission(userRole, 'maintenances', 'READ');
  const canCreate = hasPermission(userRole, 'maintenances', 'CREATE');
  const canUpdate = hasPermission(userRole, 'maintenances', 'UPDATE');
  const canDelete = hasPermission(userRole, 'maintenances', 'DELETE');

  const [maintenances, setMaintenances] = useState<MaintenanceResponseDTO[]>([]);
  const [biens, setBiens] = useState<BienResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("TOUS");

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<MaintenanceResponseDTO | null>(null);
  
  // 🔐 État pour déclencher la modale d'interdiction
  const [deniedAction, setDeniedAction] = useState<string | null>(null);

  // --- STATES POUR LES ALERTES UI ---
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'info'}>({ show: false, message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState<{show: boolean, title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'success'}>({ show: false, title: '', message: '', onConfirm: () => {}, variant: 'warning' });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  const requestAction = (title: string, message: string, action: () => Promise<void>, variant: 'danger' | 'warning' | 'success' = 'warning') => {
    setConfirmDialog({
      show: true,
      title,
      message,
      variant,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, show: false }));
        await action();
      }
    });
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    if (!canRead) {
      setLoading(false);
      setDeniedAction("consulter le registre des interventions techniques");
      return;
    }

    try {
      setLoading(true);
      const [maintenanceData, biensData] = await Promise.all([
        maintenanceAPI.obtenirTous().catch(() => []),
        bienAPI.obtenirTous().catch(() => [])
      ]);
      setMaintenances(maintenanceData);
      setBiens(biensData);
    } catch (err) {
      console.error("Erreur lors de la récupération des données", err);
      showNotification("Impossible de charger les données.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaintenance = async (dto: MaintenanceRequestDTO) => {
    if (!canCreate) {
      setDeniedAction("créer une nouvelle fiche d'intervention");
      return;
    }
    try {
      await maintenanceAPI.creer(dto);
      setOpenForm(false);
      showNotification("Fiche de maintenance créée avec succès.", "success");
      chargerDonnees();
    } catch (err: any) {
      const errorMessage = err.response?.data?.erreur || "Erreur lors de la création de la maintenance. Vérifiez les champs.";
      showNotification(errorMessage, "error");
    }
  };

  const handleTerminerMaintenance = (id: string) => {
    if (!canUpdate) {
      setDeniedAction("clôturer une intervention technique");
      return;
    }
    requestAction(
      "Clôturer l'intervention",
      "Voulez-vous marquer cette intervention comme terminée ? Cette action mettra à jour l'historique du bien.",
      async () => {
        try {
          await maintenanceAPI.terminer(id);
          if (selectedDetail?.id === id) setSelectedDetail(null);
          showNotification("Intervention clôturée avec succès.", "success");
          chargerDonnees();
        } catch (err: any) {
          showNotification(err.response?.data?.erreur || "Erreur lors de la clôture de l'intervention.", "error");
        }
      },
      "success"
    );
  };

  const handleAnnulerMaintenance = (id: string) => {
    if (!canUpdate) {
      setDeniedAction("annuler un ordre de maintenance");
      return;
    }
    requestAction(
      "Annuler l'intervention",
      "Êtes-vous sûr de vouloir annuler cette intervention ? Elle passera en statut annulé.",
      async () => {
        try {
          await maintenanceAPI.annuler(id);
          if (selectedDetail?.id === id) setSelectedDetail(null);
          showNotification("Intervention annulée.", "info");
          chargerDonnees();
        } catch (err: any) {
          showNotification(err.response?.data?.erreur || "Erreur lors de l'annulation de l'intervention.", "error");
        }
      },
      "warning"
    );
  };

  const handleSupprimerMaintenance = (id: string) => {
    if (!canDelete) {
      setDeniedAction("supprimer définitivement un registre de maintenance");
      return;
    }
    requestAction(
      "Suppression définitive",
      "Confirmez-vous la suppression définitive de cette fiche ? Cette action est irréversible.",
      async () => {
        try {
          await maintenanceAPI.supprimer(id);
          if (selectedDetail?.id === id) setSelectedDetail(null);
          showNotification("Fiche de maintenance supprimée.", "success");
          chargerDonnees();
        } catch (err: any) {
          showNotification(err.response?.data?.erreur || "Erreur lors de la suppression de l'intervention.", "error");
        }
      },
      "danger"
    );
  };

  const stats = useMemo(() => {
    const total = Array.isArray(maintenances) ? maintenances.length : 0;
    const enCours = Array.isArray(maintenances) ? maintenances.filter(m => m.statut === StatutMaintenance.EN_COURS).length : 0;
    const planifiee = Array.isArray(maintenances) ? maintenances.filter(m => m.statut === StatutMaintenance.PLANIFIEE).length : 0;
    const totalCout = Array.isArray(maintenances) ? 
      maintenances.filter(m => m.statut === StatutMaintenance.TERMINEE).reduce((sum, m) => sum + (m.cout || 0), 0) : 0;

    return { total, enCours, planifiee, totalCout };
  }, [maintenances]);

  const filteredMaintenances = useMemo(() => {
    if (!Array.isArray(maintenances)) return [];
    return maintenances.filter(m => {
      const matchesSearch = 
        m.bienDesignation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.prestataire?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "TOUS" || m.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [maintenances, searchQuery, statusFilter]);

  const exporterPDF = () => {
    const doc = new jsPDF('landscape'); 
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); 
    doc.text("Registre des Interventions Techniques", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date d'extraction : ${new Date().toLocaleString('fr-FR')}`, 14, 30);
    doc.text(`Nombre d'interventions : ${filteredMaintenances.length}`, 14, 36);

    const tableColumn = ["Bien Public", "Type Opération", "Prestataire", "Date Prévue", "Montant (MRU)", "Statut"];
    const tableRows = filteredMaintenances.map(m => [
      m.bienDesignation || "N/A",
      m.type || "N/A",
      m.prestataire || "N/A",
      m.dateIntervention ? new Date(m.dateIntervention).toLocaleDateString("fr-FR") : "N/A",
      m.cout ? m.cout.toLocaleString() : "0",
      m.statut || "N/A"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Registre_Maintenances_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification("Le fichier PDF a été généré avec succès.", "success");
  };

  return (
    <div className="p-8 w-full bg-slate-50/50 min-h-screen relative">
      <div className="mx-auto max-w-7xl space-y-6">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Registre des Interventions Techniques</h1>
            <p className="mt-1 text-sm text-slate-500">
              Planification, suivi budgétaire et historique de maintenance préventive et curative des actifs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exporterPDF}
              disabled={loading || filteredMaintenances.length === 0 || !canRead}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-slate-500" /> Exporter PDF
            </button>
            
            {/* 🔐 BOUTON PROTÉGÉ */}
            <button
              onClick={() => {
                if (!canCreate) setDeniedAction("planifier une nouvelle intervention");
                else setOpenForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Nouvelle Intervention
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Activity} label="Total Demandes" value={stats.total.toString()} tone="primary" />
          <StatCard icon={Clock} label="En Cours d'Exécution" value={stats.enCours.toString()} tone="warning" />
          <StatCard icon={Calendar} label="Interventions Planifiées" value={stats.planifiee.toString()} tone="info" />
          <StatCard icon={DollarSign} label="Budget Investi (Clôturé)" value={`${stats.totalCout.toLocaleString()} MRU`} tone="success" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
            <div className="relative min-w-0 flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                disabled={!canRead}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par matériel, prestataire..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-900 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select 
                disabled={!canRead}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-slate-900 disabled:bg-gray-50"
              >
                <option value="TOUS">Tous les statuts</option>
                {Object.values(StatutMaintenance).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50 font-bold text-gray-700">
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="px-6 py-3.5">Bien Public</th>
                  <th className="px-6 py-3.5">Type Opération</th>
                  <th className="px-6 py-3.5">Prestataire Mandaté</th>
                  <th className="px-6 py-3.5">Date Prévue</th>
                  <th className="px-6 py-3.5">Montant</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="w-32 px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400 font-medium animate-pulse">
                      Chargement des fiches de maintenance technique...
                    </td>
                  </tr>
                ) : !canRead ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-900">Accès restreint</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Votre rôle <span className="font-semibold text-slate-700">({userRole})</span> ne vous autorise pas à lire le contenu de ce registre.
                      </p>
                    </td>
                  </tr>
                ) : filteredMaintenances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
                        <Wrench className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-600">Aucune maintenance trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredMaintenances.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{m.bienDesignation}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {m.bienId?.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <TypeBadge type={m.type} />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{m.prestataire}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {m.dateIntervention ? new Date(m.dateIntervention).toLocaleDateString("fr-FR") : ''}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {m.cout ? `${m.cout.toLocaleString()} MRU` : <span className="text-gray-400 font-normal">Non évalué</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge statut={m.statut} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDetail(m)}
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-blue-600 transition"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {m.statut !== StatutMaintenance.TERMINEE && m.statut !== StatutMaintenance.ANNULEE && (
                            <>
                              <button
                                onClick={() => handleTerminerMaintenance(m.id)}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition"
                                title="Clôturer l'intervention"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleAnnulerMaintenance(m.id)}
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition"
                                title="Annuler l'intervention"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleSupprimerMaintenance(m.id)}
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
        <MaintenanceFormModal
          biens={biens}
          onClose={() => setOpenForm(false)}
          onSave={handleCreateMaintenance}
          onError={showNotification}
        />
      )}

      {selectedDetail && (
        <DetailsSlideOver
          m={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onTerminer={handleTerminerMaintenance}
          onAnnuler={handleAnnulerMaintenance}
        />
      )}

      {/* 🛑 Modale Accès Refusé */}
      {deniedAction && (
        <AccessDeniedModal 
          actionLabel={deniedAction} 
          onClose={() => setDeniedAction(null)} 
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
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tone === 'primary' ? 'bg-slate-950 text-white' : tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: TypeMaintenance }) {
  const isCurative = type === TypeMaintenance.CURATIVE;
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${
      isCurative ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
    }`}>
      {type}
    </span>
  );
}

function StatusBadge({ statut }: { statut: StatutMaintenance }) {
  const styles: Record<StatutMaintenance, string> = {
    [StatutMaintenance.PLANIFIEE]: "bg-blue-50 text-blue-700 border border-blue-200",
    [StatutMaintenance.EN_COURS]: "bg-amber-50 text-amber-700 border border-amber-200",
    [StatutMaintenance.TERMINEE]: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    [StatutMaintenance.ANNULEE]: "bg-slate-100 text-slate-600 border border-slate-300",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${styles[statut]}`}>
      {statut}
    </span>
  );
}

const inputCls = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition";

function MaintenanceFormModal({ biens, onClose, onSave, onError }: {
  biens: BienResponseDTO[];
  onClose: () => void;
  onSave: (dto: MaintenanceRequestDTO) => void;
  onError: (msg: string, type: 'error') => void;
}) {
  const [dto, setDto] = useState<MaintenanceRequestDTO>({
    bienId: '',
    type: TypeMaintenance.PREVENTIVE,
    dateIntervention: '',
    dateFinIntervention: undefined,
    prestataire: '',
    cout: 0,
    description: '',
    observations: '',
    statut: StatutMaintenance.PLANIFIEE
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dto.bienId) {
      onError("Veuillez sélectionner un bien public pour cette intervention.", "error");
      return;
    }
    onSave(dto);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-sm items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="text-slate-500 h-5 w-5" /> Enregistrer une Fiche Technique
            </h3>
            <p className="mt-1 text-xs text-gray-500">Planifier une maintenance préventive ou curative.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 max-h-[65vh] overflow-y-auto">
          
          <label className="sm:col-span-2 block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">Bien public à maintenir *</span>
            <select required className={inputCls} value={dto.bienId} onChange={e => setDto({...dto, bienId: e.target.value})}>
              <option value="" disabled>Sélectionner le matériel ou véhicule...</option>
              {biens
                .filter((b: any) => b.statut !== 'REFORME' && b.etat !== 'REFORME' && b.etatLogistique !== 'REFORME')
                .map(b => (
                <option key={b.id} value={b.id}>{b.designation} ({b.code})</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Type de Maintenance</span>
            <select required className={inputCls} value={dto.type} onChange={e => setDto({...dto, type: e.target.value as TypeMaintenance})}>
              {Object.values(TypeMaintenance).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Statut Initial Logistique</span>
            <select required className={inputCls} value={dto.statut} onChange={e => setDto({...dto, statut: e.target.value as StatutMaintenance})}>
              {Object.values(StatutMaintenance).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Date de Début (Planifiée)</span>
            <input type="date" required className={inputCls} onChange={e => setDto({...dto, dateIntervention: e.target.value})} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Date de Fin (Optionnelle)</span>
            <input type="date" className={inputCls} onChange={e => setDto({...dto, dateFinIntervention: e.target.value ? e.target.value : undefined})} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Prestataire / Société Mandatée</span>
            <input type="text" required placeholder="ex: CFAO Motors" className={inputCls} onChange={e => setDto({...dto, prestataire: e.target.value})} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Coût Estimé (MRU)</span>
            <input type="number" placeholder="0.00" className={inputCls} onChange={e => setDto({...dto, cout: Number(e.target.value)})} />
          </label>

          <label className="sm:col-span-2 block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Description / Diagnostic</span>
            <textarea required rows={3} placeholder="Détails de l'intervention..." className={inputCls} onChange={e => setDto({...dto, description: e.target.value})} />
          </label>

          <label className="sm:col-span-2 block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Observations / Garantie</span>
            <input type="text" placeholder="ex: Garantie pièces 6 mois" className={inputCls} onChange={e => setDto({...dto, observations: e.target.value})} />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
          <button type="button" onClick={onClose} className="rounded-xl bg-white border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">Annuler</button>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-slate-800">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}

function DetailsSlideOver({ m, onClose, onTerminer, onAnnuler }: {
  m: MaintenanceResponseDTO;
  onClose: () => void;
  onTerminer: (id: string) => void;
  onAnnuler: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="h-full w-full max-w-md flex flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-md font-bold leading-none">Fiche de Maintenance</h3>
              <p className="text-xs text-slate-400 font-mono mt-1.5">ID: {m.id?.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6 bg-slate-50/60 text-sm">
          <section className="bg-white rounded-xl p-4 border border-gray-200 space-y-3 shadow-sm">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Actif étatique concerné</span>
              <h4 className="text-lg font-bold text-slate-900 mt-0.5">{m.bienDesignation}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <span className="text-xs text-gray-400 block">Type opération</span>
                <div className="mt-1"><TypeBadge type={m.type} /></div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Statut Actuel</span>
                <div className="mt-1"><StatusBadge statut={m.statut} /></div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
            <div className="flex gap-3">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-400 block">Calendrier des travaux</span>
                <p className="font-semibold text-slate-800 mt-0.5">Début : {m.dateIntervention ? new Date(m.dateIntervention).toLocaleDateString("fr-FR") : ''}</p>
                {m.dateFinIntervention && <p className="font-semibold text-slate-800 text-xs">Clôture : {new Date(m.dateFinIntervention).toLocaleDateString("fr-FR")}</p>}
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 pt-3">
              <Settings className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-400 block">Opérateur / Garage agréé</span>
                <p className="font-bold text-slate-900 mt-0.5">{m.prestataire}</p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 pt-3">
              <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-xs text-gray-400 block">Coût d'intervention</span>
                <p className="font-bold text-emerald-600 mt-0.5">{m.cout ? `${m.cout.toLocaleString()} MRU` : 'Non renseigné'}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
            <h5 className="font-bold text-slate-900 flex items-center gap-2"><FileText className="h-4 w-4 text-gray-400"/> Diagnostic & Descriptif</h5>
            <p className="text-gray-700 bg-slate-50 p-2.5 rounded-lg text-xs leading-relaxed border border-gray-100">{m.description}</p>
          </section>

          {m.statut !== StatutMaintenance.TERMINEE && m.statut !== StatutMaintenance.ANNULEE && (
            <section className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 space-y-3 text-xs">
              <h5 className="font-bold text-amber-950 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-amber-600"/> Actions rapides</h5>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => { onClose(); onTerminer(m.id); }} className="rounded-lg bg-emerald-600 text-white py-2 font-bold hover:bg-emerald-700 transition shadow-sm">
                  Clôturer / Terminé
                </button>
                <button onClick={() => { onClose(); onAnnuler(m.id); }} className="rounded-lg bg-white border border-gray-300 text-slate-700 py-2 font-bold hover:bg-gray-50 transition">
                  Annuler l'ordre
                </button>
              </div>
            </section>
          )}

          <section className="text-xs text-gray-400 border-t border-gray-200 pt-4 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Fiche créée par {m.creeParNom || m.creePar}
          </section>
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

export default MaintenancesPage;