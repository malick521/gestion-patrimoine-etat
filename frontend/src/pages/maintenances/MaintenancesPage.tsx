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
  
  // 🔐 État pour déclencher la modale d'interdiction globale
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chargerDonnees = async () => {
    // 🛑 Si l'utilisateur n'a pas le droit de lecture, on annule tout de suite la requête
    if (!canRead) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 🛡️ Sécurisation avec `.catch(() => [])` pour ne pas faire crasher l'appli en cas d'erreur 403
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
                  /* 🛑 SUBSTITUT D'INTERFACE SI L'UTILISATEUR N'A PAS LE DROIT "READ" */
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
                        <div className="text-xs