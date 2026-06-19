import React, { useMemo, useState, useEffect } from "react";
import { bienAPI } from "../../api/bienAPI";
import { BienResponseDTO, EtatBien } from "../../types";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search,  Eye, Trash2, Package, Database,
  Activity, Building2, Tag, AlertTriangle
} from "lucide-react";

export const BiensPage: React.FC = () => {
  const [list, setList] = useState<BienResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [confirmDel, setConfirmDel] = useState<BienResponseDTO | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const data = await bienAPI.obtenirTous();
      setList(data);
    } catch (err) {
      console.error("Erreur lors du chargement des biens", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleConfirmDelete = async () => {
    if (!confirmDel) return;
    try {
      await bienAPI.supprimer(confirmDel.id);
      setConfirmDel(null);
      chargerDonnees();
    } catch (err) {
      alert("Impossible de supprimer ce bien.");
    }
  };

  return (
    <div className="p-8 w-full bg-slate-50/50 min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-900">Registre du Patrimoine</h2>
            <p className="mt-1 text-sm text-slate-500">
              Gestion centralisée des actifs immobiliers et mobiliers de l'État
            </p>
          </div>
          <button
            onClick={() => navigate('/biens/nouveau')}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" /> Enregistrer un Bien
          </button>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Total des Biens" value={stats.total.toString()} tone="primary" />
          <StatCard icon={Database} label="Valeur Globale (MRU)" value={stats.valeurTotale.toLocaleString()} tone="success" />
          <StatCard icon={Building2} label="Ministères Affectés" value={stats.minConcernes.toString()} tone="secondary" />
          <StatCard icon={Activity} label="Biens en bon état" value={stats.biensBonEtat.toString()} tone="info" />
        </div>

        {/* Table panel */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher par code, désignation ou ministère..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
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
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-gray-400 font-medium animate-pulse">
                      Chargement des biens...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-600">Aucun bien trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-800 text-xs">{b.code}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                            <Tag className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{b.designation}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{b.localisation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{b.ministereNom}</td>
                      <td className="px-5 py-4 text-slate-900 font-bold">{b.valeurAcquisition?.toLocaleString()}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${b.etat === "NEUF" || b.etat === "BON" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : b.etat === "MAUVAIS" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                          {b.etat}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center space-x-2 flex justify-center">
                        <button onClick={() => navigate(`/biens/${b.id}`)} className="grid h-8 w-8 place-items-center rounded-lg bg-gray-50 hover:bg-gray-200 transition-colors">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </button>
                        <button onClick={() => setConfirmDel(b)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600 mb-4">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Supprimer cet actif ?</h3>
              <p className="mt-2 text-sm text-slate-500">Êtes-vous sûr de vouloir retirer <span className="font-bold">{confirmDel.designation}</span> ?</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">Annuler</button>
              <button onClick={handleConfirmDelete} className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StatCard({ icon: Icon, label, value, tone }: any) {
  const tones: any = { primary: "bg-blue-50 text-blue-600", info: "bg-sky-50 text-sky-600", secondary: "bg-purple-50 text-purple-600", success: "bg-emerald-50 text-emerald-600" };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  );
}

export default BiensPage;