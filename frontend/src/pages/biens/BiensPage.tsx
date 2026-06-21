import React, { useMemo, useState, useEffect, useCallback } from "react";
import { bienAPI } from "../../api/bienAPI";
import { BienResponseDTO, EtatBien } from "../../types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasPermission, AccessDeniedModal } from "../../components/AccessControl";
import {
  Plus, Search, Eye, Trash2, Package, Database,
  Activity, Building2, Tag, AlertTriangle, Download,
  AlertCircle, CheckCircle, Info, X
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const BiensPage: React.FC = () => {
  // 🔐 1. CONNEXION AU CONTEXTE D'AUTHENTIFICATION
  const { user } = useAuth();
  const userRole = user?.role || 'CONSULTANT';

  // 🔐 2. ÉVALUATION DES DROITS
  const canCreate = hasPermission(userRole, 'biens', 'CREATE');
  const canDelete = hasPermission(userRole, 'biens', 'DELETE');

  const [list, setList] = useState<BienResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [confirmDel, setConfirmDel] = useState<BienResponseDTO | null>(null);
  
  // 🔐 Modale d'accès refusé
  const [deniedAction, setDeniedAction] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    chargerDonnees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const data = await bienAPI.obtenirTous();
      setList(data);
    } catch (err) {
      console.error("Erreur lors du chargement des biens", err);
      showNotification("Erreur lors du chargement de la liste des biens.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const stats = useMemo(() => {
    const total = list.length;
    const valeurTotale = list.reduce((acc, b) => acc + (b.valeurAcquisition || 0), 0);
    const minConcernes = new Set(list.map((b) => b.ministereId).filter(Boolean)).size;
    const biensBonEtat = list.filter((b) => b.etat === EtatBien.NEUF || b.etat === EtatBien.BON).length;

    return { total, valeurTotale, minConcernes, biensBonEtat };
  }, [list]);

  const filtered = useMemo(
    () =>
      list.filter(
        (b) =>
          b.designation?.toLowerCase().includes(q.toLowerCase()) ||
          b.code?.toLowerCase().includes(q.toLowerCase()) ||
          b.ministereNom?.toLowerCase().includes(q.toLowerCase())
      ),
    [list, q],
  );

  const exporterPDF = () => {
    const doc = new jsPDF('landscape'); 
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); 
    doc.text("Registre du Patrimoine - Biens", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date d'extraction : ${new Date().toLocaleString('fr-FR')}`, 14, 30);
    doc.text(`Nombre de biens : ${filtered.length}`, 14, 36);

    const tableColumn = ["Code", "Désignation", "Localisation", "Ministère", "Valeur (MRU)", "État"];
    const tableRows = filtered.map(b => [
      b.code || "N/A",
      b.designation || "N/A",
      b.localisation || "N/A",
      b.ministereNom || "N/A",
      b.valeurAcquisition ? b.valeurAcquisition.toLocaleString() : "0",
      b.etat || "N/A"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Registre_Biens_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification("Le fichier PDF a été généré avec succès.", "success");
  };

  const handleConfirmDelete = async () => {
    if (!confirmDel || !canDelete) return;
    try {
      await bienAPI.supprimer(confirmDel.id);
      setConfirmDel(null);
      showNotification(`Le bien "${confirmDel.designation}" a été supprimé.`, "success");
      chargerDonnees();
    } catch (err: any) {
      setConfirmDel(null);
      showNotification(
        err.response?.data?.message || "Impossible de supprimer ce bien.", 
        "error"
      );
    }
  };

  return (
    <div className="p-8 w-full bg-slate-50/50 min-h-screen relative overflow-hidden">
      
      {/* Notifications */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-auto max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={`p-4 rounded-xl shadow-xl border text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto ${
            t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />}
            {t.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />}
            <span className="flex-1 leading-relaxed">{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))} className="shrink-0 p-1 rounded-md transition-colors hover:bg-white/50">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-900">Registre du Patrimoine</h2>
            <p className="mt-1 text-sm text-slate-500">Gestion centralisée des actifs immobiliers et mobiliers de l'État</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exporterPDF} disabled={loading || filtered.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50">
              <Download className="h-4 w-4 text-slate-500" /> Exporter PDF
            </button>
            
            {/* 🔐 BOUTON PROTÉGÉ */}
            <button
              onClick={() => {
                if (!canCreate) setDeniedAction("enregistrer un nouvel actif dans le registre");
                else navigate('/biens/nouveau');
              }}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Enregistrer un Bien
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Total des Biens" value={stats.total.toString()} tone="primary" />
          <StatCard icon={Database} label="Valeur Globale (MRU)" value={stats.valeurTotale.toLocaleString()} tone="success" />
          <StatCard icon={Building2} label="Ministères Affectés" value={stats.minConcernes.toString()} tone="secondary" />
          <StatCard icon={Activity} label="Biens en bon état" value={stats.biensBonEtat.toString()} tone="info" />
        </div>

        {/* Tableau */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par code, désignation ou ministère..." className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50 font-bold text-gray-700">
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Désignation</th>
                  <th className="px-5 py-3">Ministère</th>
                  <th className="px-5 py-3">Valeur (MRU)</th>
                  <th className="px-5 py-3 text-center">État</th>
                  <th className="w-32 px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400 font-medium animate-pulse">Chargement des biens...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400"><Package className="h-6 w-6" /></div><p className="mt-3 text-sm font-medium text-gray-600">Aucun bien trouvé</p></td></tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-800 text-xs">{b.code}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Tag className="h-4 w-4" /></div>
                          <div><div className="font-semibold text-slate-900">{b.designation}</div><div className="text-xs text-slate-500 mt-0.5">{b.localisation}</div></div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{b.ministereNom}</td>
                      <td className="px-5 py-4 text-slate-900 font-bold">{b.valeurAcquisition?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${b.etat === "NEUF" || b.etat === "BON" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : b.etat === "MAUVAIS" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>{b.etat}</span>
                      </td>
                      <td className="px-5 py-4 text-center space-x-2 flex justify-center">
                        {/* ACTION VOIR (Accessible à tous) */}
                        <button onClick={() => navigate(`/biens/${b.id}`)} className="grid h-8 w-8 place-items-center rounded-lg bg-gray-50 hover:bg-gray-200 transition-colors" title="Consulter la fiche">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </button>
                        
                        {/* ACTION SUPPRIMER (Masquée pour le GESTIONNAIRE) */}
                        {canDelete && (
                          <button onClick={() => setConfirmDel(b)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 hover:bg-red-100 transition-colors" title="Supprimer le bien">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🛑 Modale Accès Refusé */}
      {deniedAction && (
        <AccessDeniedModal actionLabel={deniedAction} onClose={() => setDeniedAction(null)} />
      )}

      {/* Confirmation Modal pour suppression */}
      {confirmDel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600 mb-4"><AlertTriangle className="h-7 w-7" /></div>
              <h3 className="text-lg font-bold text-slate-900">Supprimer cet actif ?</h3>
              <p className="mt-2 text-sm text-slate-500">Êtes-vous sûr de vouloir retirer <span className="font-bold">{confirmDel.designation}</span> ?</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={handleConfirmDelete} className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-sm">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StatCard({ icon: Icon, label, value, tone }: any) {
  const tones: any = { 
    primary: "bg-blue-50 text-blue-600", 
    info: "bg-sky-50 text-sky-600", 
    secondary: "bg-purple-50 text-purple-600", 
    success: "bg-emerald-50 text-emerald-600" 
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div><p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  );
}

export default BiensPage;