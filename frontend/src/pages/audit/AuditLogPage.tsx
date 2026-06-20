import React, { useEffect, useState, useMemo } from 'react';
import { auditLogAPI } from '../../api/auditLogAPI';
import { AuditLogResponseDTO } from '../../types';
import { 
  Search, Filter, Activity, RefreshCw, 
  ShieldAlert, Database, UserCheck, Trash2, Edit3, PlusCircle, Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("TOUTES");

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const data = await auditLogAPI.obtenirTous();
      // Tri par date décroissante (les plus récents en premier)
      const sortedData = data.sort((a, b) => new Date(b.dateAction).getTime() - new Date(a.dateAction).getTime());
      setLogs(sortedData);
    } catch (err) {
      console.error("Erreur lors de la récupération du journal d'audit", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  // --- STATISTIQUES ---
  const stats = useMemo(() => {
    const total = logs.length;
    
    // Actions du jour
    const today = new Date().toISOString().split('T')[0];
    const actionsAujourdhui = logs.filter(log => log.dateAction.startsWith(today)).length;
    
    // Répartition
    const creations = logs.filter(log => log.action.includes('CREATE') || log.action.includes('AJOUT')).length;
    const suppressions = logs.filter(log => log.action.includes('DELETE') || log.action.includes('SUPPR')).length;

    return { total, actionsAujourdhui, creations, suppressions };
  }, [logs]);

  // --- FILTRAGE ---
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entite?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAction = 
        actionFilter === "TOUTES" || 
        (actionFilter === "CREATE" && (log.action.includes('CREATE') || log.action.includes('AJOUT'))) ||
        (actionFilter === "UPDATE" && (log.action.includes('UPDATE') || log.action.includes('MODIF'))) ||
        (actionFilter === "DELETE" && (log.action.includes('DELETE') || log.action.includes('SUPPR')));

      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, actionFilter]);

  // --- EXPORT PDF ---
  const exporterPDF = () => {
    const doc = new jsPDF('landscape'); // Format paysage pour avoir plus de place

    // Titre et En-tête
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Piste d'Audit Interministérielle", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateExtraction = new Date().toLocaleString('fr-FR');
    doc.text(`Date d'extraction : ${dateExtraction}`, 14, 30);
    doc.text(`Nombre d'enregistrements : ${filteredLogs.length}`, 14, 36);

    // Préparation des données pour le tableau
    const tableColumn = ["Date & Heure", "Opérateur", "Type d'Action", "Cible (Entité)", "Détails"];
    const tableRows = filteredLogs.map(log => {
      const dateHeure = new Date(log.dateAction).toLocaleString('fr-FR');
      const cible = `${log.entite}\n${log.entiteId ? `(ID: ${log.entiteId})` : ''}`;
      
      return [
        dateHeure,
        log.userEmail || "Inconnu",
        log.action,
        cible,
        log.details || "N/A"
      ];
    });

    // Génération du tableau
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: { 
        fillColor: [15, 23, 42], // Fond sombre (slate-900)
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Lignes alternées (slate-50)
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Date
        1: { cellWidth: 45 }, // Opérateur
        2: { cellWidth: 35 }, // Action
        3: { cellWidth: 45 }, // Cible
        4: { cellWidth: 'auto' } // Détails prend le reste
      }
    });

    // Sauvegarde du fichier
    doc.save(`Journal_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-8 w-full bg-slate-50/50 min-h-screen relative">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Piste d'Audit Interministérielle</h1>
            <p className="mt-1 text-sm text-slate-500">
              Journal de traçabilité sécurisé des opérations, accès et modifications du système.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exporterPDF}
              disabled={loading || filteredLogs.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 text-slate-500" /> 
              Exporter PDF
            </button>
            <button
              onClick={chargerDonnees}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-70"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
              Actualiser
            </button>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ShieldAlert} label="Total Événements" value={stats.total.toString()} tone="primary" />
          <StatCard icon={Activity} label="Actions du Jour" value={stats.actionsAujourdhui.toString()} tone="info" />
          <StatCard icon={PlusCircle} label="Créations Récentes" value={stats.creations.toString()} tone="success" />
          <StatCard icon={Trash2} label="Suppressions" value={stats.suppressions.toString()} tone="danger" />
        </div>

        {/* TABLEAU ET FILTRES */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          
          {/* BARRE D'OUTILS */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
            <div className="relative min-w-0 flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par opérateur, entité, détails..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select 
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-slate-900"
              >
                <option value="TOUTES">Toutes les actions</option>
                <option value="CREATE">Créations (Ajouts)</option>
                <option value="UPDATE">Modifications</option>
                <option value="DELETE">Suppressions</option>
              </select>
            </div>
          </div>

          {/* TABLEAU */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50 font-bold text-gray-700">
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="px-6 py-3.5">Date & Heure</th>
                  <th className="px-6 py-3.5">Opérateur</th>
                  <th className="px-6 py-3.5">Type d'Action</th>
                  <th className="px-6 py-3.5">Cible (Entité)</th>
                  <th className="px-6 py-3.5">Détails de l'opération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium animate-pulse">
                      Chargement du journal d'audit...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
                        <Database className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-600">Aucun enregistrement trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                      
                      {/* DATE */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {new Date(log.dateAction).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          {new Date(log.dateAction).toLocaleTimeString("fr-FR", { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                        </div>
                      </td>
                      
                      {/* OPERATEUR */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-500">
                            <UserCheck className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-slate-800">{log.userEmail}</span>
                        </div>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ActionBadge action={log.action} />
                      </td>

                      {/* CIBLE */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{log.entite}</div>
                        {log.entiteId && (
                          <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {log.entiteId.substring(0, 12)}...</div>
                        )}
                      </td>

                      {/* DETAILS */}
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        <div className="bg-slate-50 border border-gray-100 rounded-lg p-2 max-w-md break-words">
                          {log.details}
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
    </div>
  );
};

/* ---------- SOUS-COMPOSANTS ---------- */

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  const tones: Record<string, string> = {
    primary: "bg-slate-900 text-white",
    info: "bg-blue-50 text-blue-600 border border-blue-100",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    danger: "bg-red-50 text-red-600 border border-red-100",
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

function ActionBadge({ action }: { action: string }) {
  const actionUpper = action.toUpperCase();
  const isCreate = actionUpper.includes('CREATE') || actionUpper.includes('AJOUT');
  const isUpdate = actionUpper.includes('UPDATE') || actionUpper.includes('MODIF');
  const isDelete = actionUpper.includes('DELETE') || actionUpper.includes('SUPPR');

  let style = "bg-gray-100 text-gray-700 border-gray-200";
  let Icon = Activity;

  if (isCreate) {
    style = "bg-emerald-50 text-emerald-700 border-emerald-200";
    Icon = PlusCircle;
  } else if (isUpdate) {
    style = "bg-blue-50 text-blue-700 border-blue-200";
    Icon = Edit3;
  } else if (isDelete) {
    style = "bg-red-50 text-red-700 border-red-200";
    Icon = Trash2;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border ${style}`}>
      <Icon className="h-3.5 w-3.5" />
      {actionUpper}
    </span>
  );
}

export default AuditLogPage;