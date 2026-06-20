import React, { useMemo, useState, useEffect } from "react";
import { mouvementAPI } from "../../api/mouvementAPI";
import { bienAPI } from "../../api/bienAPI";
import { ministereAPI } from "../../api/ministereAPI";
import { 
  MouvementResponseDTO, MouvementRequestDTO, TypeMouvement,
  BienResponseDTO, MinistereResponseDTO
} from "../../types";
import {
  Search, Filter, Eye, X, Activity, Package, Building2,
  Calendar, FileText, AlertTriangle, ArrowLeftRight, Landmark, AlignLeft, Scale, Download
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const MouvementsPage: React.FC = () => {
  // 🟢 Données
  const [list, setList] = useState<MouvementResponseDTO[]>([]);
  const [biens, setBiens] = useState<BienResponseDTO[]>([]);
  const [ministeres, setMinisteres] = useState<MinistereResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🟢 Filtres harmonisés
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("TOUS");
  
  // 🟢 États des fenêtres (Modals / Drawers)
  const [openForm, setOpenForm] = useState(false);
  const [details, setDetails] = useState<MouvementResponseDTO | null>(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [mouvData, biensData, minData] = await Promise.all([
        mouvementAPI.obtenirTous(),
        bienAPI.obtenirTous(),
        ministereAPI.obtenirTous()
      ]);
      setList(mouvData);
      setBiens(biensData);
      setMinisteres(minData);
    } catch (err) {
      console.error("Erreur lors du chargement des données", err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Calcul des statistiques dynamiques
  const stats = useMemo(() => {
    const total = Array.isArray(list) ? list.length : 0;
    const affectations = Array.isArray(list) ? list.filter((m) => m.type === TypeMouvement.AFFECTATION).length : 0;
    const transferts = Array.isArray(list) ? list.filter((m) => m.type === TypeMouvement.TRANSFERT).length : 0;
    const reformes = Array.isArray(list) ? list.filter((m) => m.type === TypeMouvement.REFORME).length : 0;

    return { total, affectations, transferts, reformes };
  }, [list]);

  // 🟢 Filtrage mis à jour (Recherche + Select)
  const filtered = useMemo(() => {
    if (!Array.isArray(list)) return [];
    return list.filter(m => {
      const searchStr = `${m.bienDesignation || ''} ${m.ministereSourceNom || ''} ${m.ministereDestinationNom || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "TOUS" || m.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [list, searchQuery, typeFilter]);

  // 🟢 EXPORT PDF
  const exporterPDF = () => {
    const doc = new jsPDF('landscape'); 

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); 
    doc.text("Historique des Mouvements", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateExtraction = new Date().toLocaleString('fr-FR');
    doc.text(`Date d'extraction : ${dateExtraction}`, 14, 30);
    doc.text(`Nombre d'opérations listées : ${filtered.length}`, 14, 36);

    const tableColumn = ["Date", "Désignation du Bien", "Type", "Provenance", "Destination"];
    const tableRows = filtered.map(m => [
      new Date(m.dateMouvement).toLocaleDateString("fr-FR"),
      m.bienDesignation || "N/A",
      m.type || "N/A",
      m.ministereSourceNom || "Stock / Inventaire",
      m.ministereDestinationNom || "Sortie Définitive"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 80 },
        2: { cellWidth: 35 },
        3: { cellWidth: 65 },
        4: { cellWidth: 65 },
      }
    });

    doc.save(`Historique_Mouvements_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSaveForm = async (dto: MouvementRequestDTO) => {
    try {
      await mouvementAPI.creer(dto);
      setOpenForm(false);
      chargerDonnees();
    } catch (err) {
      alert("Erreur lors de l'enregistrement du mouvement.");
    }
  };

  return (
    <div className="p-8 w-full bg-slate-50/50 min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-900">Historique des Mouvements</h2>
            <p className="mt-1 text-sm text-slate-500">
              Traçabilité complète des flux, cessions, réformes et affectations de matériels
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exporterPDF}
              disabled={loading || filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-slate-500" /> Exporter PDF
            </button>
            <button
              onClick={() => setOpenForm(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <ArrowLeftRight className="h-4 w-4" /> Enregistrer un Flux
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Activity} label="Total Opérations" value={stats.total.toString()} tone="primary" />
          <StatCard icon={Building2} label="Affectations" value={stats.affectations.toString()} tone="success" />
          <StatCard icon={ArrowLeftRight} label="Transferts" value={stats.transferts.toString()} tone="info" />
          <StatCard icon={Scale} label="Biens Réformés" value={stats.reformes.toString()} tone="danger" />
        </div>

        {/* Table panel */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          
          {/* NOUVELLE BARRE DE FILTRES HARMONISÉE */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
            <div className="relative min-w-0 flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par bien, ministère..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-slate-900"
              >
                <option value="TOUS">Tous les types</option>
                {Object.values(TypeMouvement).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50 font-bold text-gray-700">
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="px-5 py-3.5">Date Opération</th>
                  <th className="px-5 py-3.5">Désignation Bien</th>
                  <th className="px-5 py-3.5 text-center">Type</th>
                  <th className="px-5 py-3.5">Provenance (Source)</th>
                  <th className="px-5 py-3.5">Cessionnaire (Destination)</th>
                  <th className="w-20 px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-gray-400 font-medium animate-pulse">
                      Chargement de l'historique...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
                        <ArrowLeftRight className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-600">Aucun mouvement trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-800 text-xs">
                        {new Date(m.dateMouvement).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="font-semibold text-slate-900">{m.bienDesignation}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <TypeMouvementBadge type={m.type} />
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {m.ministereSourceNom ? (
                            <span className="flex items-center gap-2"><Landmark className="h-3.5 w-3.5 text-gray-400"/>{m.ministereSourceNom}</span>
                        ) : (
                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Stock / Inventaire</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-900 font-medium">
                        {m.ministereDestinationNom ? (
                             <span className="flex items-center gap-2"><Landmark className="h-3.5 w-3.5 text-gray-400"/>{m.ministereDestinationNom}</span>
                        ) : (
                            <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">Sortie Définitive</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center flex justify-center">
                        <button 
                          title="Voir détails"
                          onClick={() => setDetails(m)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-gray-50 hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
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

      {/* Modal de Création */}
      {openForm && (
        <MouvementForm
          biens={biens}
          ministeres={ministeres}
          onClose={() => setOpenForm(false)}
          onSave={handleSaveForm}
        />
      )}

      {/* Slide-over Panel */}
      {details && <DetailsPanel m={details} onClose={() => setDetails(null)} />}

    </div>
  );
};

/* ---------- Micro-Composants Stylisés ---------- */

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  const tones: Record<string, string> = {
    primary: "bg-indigo-50 text-indigo-600",
    info: "bg-sky-50 text-sky-600",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-red-50 text-red-600",
    secondary: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone] || tones.primary}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function TypeMouvementBadge({ type }: { type: TypeMouvement }) {
  const styles: Record<TypeMouvement, string> = {
    [TypeMouvement.AFFECTATION]: "bg-emerald-50 text-emerald-700 border-emerald-200",
    [TypeMouvement.TRANSFERT]: "bg-sky-50 text-sky-700 border-sky-200",
    [TypeMouvement.REFORME]: "bg-red-50 text-red-700 border-red-200",
  };
  const dots: Record<TypeMouvement, string> = {
    [TypeMouvement.AFFECTATION]: "bg-emerald-500",
    [TypeMouvement.TRANSFERT]: "bg-sky-500",
    [TypeMouvement.REFORME]: "bg-red-500",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${styles[type]}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dots[type]}`} />
      {type}
    </span>
  );
}

/* ---------- MODAL FORMULAIRE ---------- */

const inputCls = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition";

function MouvementForm({ biens, ministeres, onClose, onSave }: { 
  biens: BienResponseDTO[];
  ministeres: MinistereResponseDTO[];
  onClose: () => void; 
  onSave: (dto: MouvementRequestDTO) => void;
}) {
  const [dto, setDto] = useState<MouvementRequestDTO>({
    bienId: '', type: TypeMouvement.TRANSFERT, ministereSourceId: '', ministereDestinationId: '',
    motif: '', observations: '', raisonReforme: '', valeurResiduelle: 0
  });

  const isReforme = dto.type === TypeMouvement.REFORME;
  const needsSource = dto.type === TypeMouvement.TRANSFERT || dto.type === TypeMouvement.REFORME;
  const needsDestination = dto.type === TypeMouvement.TRANSFERT || dto.type === TypeMouvement.AFFECTATION;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(dto);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-sm items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ArrowLeftRight className="text-slate-500 h-5 w-5"/>Enregistrer un Mouvement</h3>
            <p className="mt-1 text-xs text-gray-500">Déclarer un transfert, une affectation ou une réforme de matériel.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 max-h-[70vh] overflow-y-auto">
          
          <Field label="Bien concerné" full>
            <select required className={inputCls} onChange={e => setDto({...dto, bienId: e.target.value})}>
              <option value="">Sélectionner le matériel...</option>
              {biens.map(b => <option key={b.id} value={b.id}>{b.code} - {b.designation}</option>)}
            </select>
          </Field>

          <Field label="Type de mouvement">
            <select required className={inputCls} value={dto.type} onChange={e => setDto({...dto, type: e.target.value as TypeMouvement})}>
              {Object.values(TypeMouvement).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          {needsSource && (
            <Field label="Ministère Source (Détenteur actuel)">
              <select required={needsSource} className={inputCls} onChange={e => setDto({...dto, ministereSourceId: e.target.value})}>
                <option value="">Sélectionner la source...</option>
                {ministeres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </Field>
          )}

          {needsDestination && (
            <Field label="Ministère Destination (Nouveau détenteur)">
              <select required={needsDestination} className={inputCls} onChange={e => setDto({...dto, ministereDestinationId: e.target.value})}>
                <option value="">Sélectionner le cessionnaire...</option>
                {ministeres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </Field>
          )}

          <Field label="Motif de l'opération" full>
            <input type="text" className={inputCls} placeholder="ex: Réaffectation de service, Fin de déploiement..." onChange={e => setDto({...dto, motif: e.target.value})} />
          </Field>

          {isReforme && (
            <>
              <Field label="Raison de la réforme (Si applicable)" full>
                <input type="text" className={inputCls} placeholder="ex: Obsolescence technique, Matériel vétuste..." onChange={e => setDto({...dto, raisonReforme: e.target.value})} />
              </Field>
              <Field label="Valeur Résiduelle Estimée (MRU)">
                <input type="number" className={inputCls} onChange={e => setDto({...dto, valeurResiduelle: Number(e.target.value)})} />
              </Field>
            </>
          )}

          <Field label="Observations additionnelles" full>
            <textarea className={`${inputCls} min-h-20`} placeholder="Références PV, état du bien lors du transfert..." onChange={e => setDto({...dto, observations: e.target.value})} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
          <button type="button" onClick={onClose} className="rounded-xl bg-white border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">Annuler</button>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-slate-800 flex items-center gap-2"><FileText className="h-4 w-4"/>Valider l'opération</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- DETAILS PANEL (SLIDE-OVER DRAWERS) ---------- */

function DetailsPanel({ m, onClose }: { m: MouvementResponseDTO; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="h-full w-full max-w-md flex flex-col bg-white shadow-2xl">
        
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-slate-900 text-white">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-white">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">Détails du Flux</h3>
              <p className="text-xs text-slate-300 font-mono mt-1">OP N° {m.id?.substring(0,8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white"><X className="h-6 w-6" /></button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-6 bg-slate-50">
          <section>
            <TypeMouvementBadge type={m.type} />
            <h2 className="text-2xl font-bold text-slate-950 mt-3">{m.bienDesignation}</h2>
            <p className="text-sm font-mono text-slate-500 mt-1">Bien ID: {m.bienId}</p>
          </section>

          <section className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-sm">
            <InfoRow icon={Calendar} label="Date Opération" value={new Date(m.dateMouvement).toLocaleDateString("fr-FR")} />
            <InfoRow icon={FileText} label="Motif" value={m.motif || "Non spécifié"} />
            
            <div className="col-span-2 border-t border-gray-100 pt-4 mt-1 space-y-4">
                <InfoRow icon={Landmark} label="Provenance (Source)" value={m.ministereSourceNom || "Stock / Inventaire"} tone={!m.ministereSourceNom ? "success" : "default"}/>
                <InfoRow icon={Landmark} label="Cessionnaire (Destination)" value={m.ministereDestinationNom || "Sortie Définitive (Réforme)"} tone={!m.ministereDestinationNom ? "danger" : "default"}/>
            </div>
          </section>

          {(m.raisonReforme || m.valeurResiduelle) && (
            <section className="rounded-xl border border-red-100 bg-red-50 p-5 shadow-sm text-sm text-red-900">
                <h4 className="font-bold flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4"/> Détails de la Sortie / Réforme</h4>
                <div className="space-y-3">
                    <p><strong>Raison :</strong> {m.raisonReforme || 'N/A'}</p>
                    {m.valeurResiduelle && <p><strong>Valeur Résiduelle :</strong> {m.valeurResiduelle.toLocaleString()} MRU</p>}
                </div>
            </section>
          )}

          {m.observations && (
             <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-sm text-gray-700 leading-relaxed space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-slate-900 mb-3"><AlignLeft className="h-4 w-4"/>Observations</h4>
                {m.observations}
             </section>
          )}

          <section className="text-xs text-gray-400 border-t border-gray-100 pt-5 mt-auto">
            Enregistré le {new Date(m.dateCreation).toLocaleString()} par {m.creeParNom}
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone?: string }) {
    const valueClass = tone === "success" ? "text-emerald-700 font-bold" : tone === "danger" ? "text-red-700 font-bold" : "text-slate-900 font-semibold";
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
        <p className={`text-sm truncate ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

export default MouvementsPage;