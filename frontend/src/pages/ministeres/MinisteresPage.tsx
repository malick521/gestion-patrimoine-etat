import React, { useMemo, useState, useEffect } from "react";
import { ministereAPI } from "../../api/ministereAPI";
import { MinistereResponseDTO, MinistereRequestDTO } from "../../types";
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, X, Landmark, Database,
  Users as UsersIcon, Activity, Building2, Mail, Phone, MapPin,
  Package, FileText, AlertTriangle, CheckCircle2, Download
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const MinisteresPage: React.FC = () => {
  // 🟢 ربط البيانات الحية من السيرفر
  const [list, setList] = useState<MinistereResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🟢 Filtres
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TOUS");
  
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<MinistereResponseDTO | null>(null);
  const [details, setDetails] = useState<MinistereResponseDTO | null>(null);
  const [confirmDel, setConfirmDel] = useState<MinistereResponseDTO | null>(null);

  // تحميل البيانات عند فتح الصفحة
  useEffect(() => {
    chargerMinisteres();
  }, []);

  const chargerMinisteres = async () => {
    try {
      setLoading(true);
      const data = await ministereAPI.obtenirTous();
      setList(data);
    } catch (err) {
      console.error("Erreur lors du chargement des ministères", err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 حساب الإحصائيات الحقيقية بناءً على البيانات القادمة من الباك إند
  const stats = useMemo(() => {
    const total = list.length;
    // حساب الوزارات النشطة فقط
    const actifs = list.filter((m) => m.actif).length;
    // حساب عدد المسؤولين (بدون تكرار)
    const responsablesUniques = new Set(list.map((m) => m.responsable).filter(Boolean)).size;
    // نسبة النشاط
    const tauxActivite = total > 0 ? Math.round((actifs / total) * 100) : 0;

    return { total, actifs, responsablesUniques, tauxActivite };
  }, [list]);

  // 🟢 Filtrage Combiné (Recherche + Statut)
  const filtered = useMemo(() => {
    return list.filter((m) => {
      // Filtre de recherche texte
      const matchesSearch =
        m.nom.toLowerCase().includes(q.toLowerCase()) ||
        m.code.toLowerCase().includes(q.toLowerCase()) ||
        m.responsable.toLowerCase().includes(q.toLowerCase());

      // Filtre par statut (Actif / Inactif)
      const matchesStatus = 
        statusFilter === "TOUS" ? true :
        statusFilter === "ACTIF" ? m.actif === true :
        m.actif === false;

      return matchesSearch && matchesStatus;
    });
  }, [list, q, statusFilter]);

  // 🟢 EXPORT PDF
  const exporterPDF = () => {
    const doc = new jsPDF('landscape'); 

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); 
    doc.text("Registre des Ministères", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateExtraction = new Date().toLocaleString('fr-FR');
    doc.text(`Date d'extraction : ${dateExtraction}`, 14, 30);
    doc.text(`Nombre de ministères listés : ${filtered.length}`, 14, 36);

    const tableColumn = ["Code", "Nom du ministère", "Responsable", "Téléphone", "Email", "Statut"];
    const tableRows = filtered.map(m => [
      m.code || "N/A",
      m.nom || "N/A",
      m.responsable || "N/A",
      m.telephone || "N/A",
      m.email || "N/A",
      m.actif ? "Actif" : "Inactif"
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
        1: { cellWidth: 70 },
        2: { cellWidth: 50 },
        3: { cellWidth: 40 },
        4: { cellWidth: 55 },
        5: { cellWidth: 20 },
      }
    });

    doc.save(`Registre_Ministeres_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // التعامل مع الحذف المؤكد
  const handleConfirmDelete = async () => {
    if (!confirmDel) return;
    try {
      await ministereAPI.supprimer(confirmDel.id);
      setConfirmDel(null);
      chargerMinisteres(); // تحديث القائمة
    } catch (err) {
      alert("Impossible de supprimer ce ministère.");
    }
  };

  // التعامل مع حفظ النموذج (إضافة أو تعديل)
  const handleSaveForm = async (dto: MinistereRequestDTO) => {
    try {
      if (editing) {
        await ministereAPI.modifier(editing.id, dto);
      } else {
        await ministereAPI.creer(dto);
      }
      setOpenForm(false);
      setEditing(null);
      chargerMinisteres();
    } catch (err) {
      alert("Erreur lors de l'enregistrement. Veuillez vérifier les données.");
    }
  };

  return (
    <div className="p-8 w-full bg-slate-50/50 min-h-screen relative">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-900">Gestion des Ministères</h2>
            <p className="mt-1 text-sm text-slate-500">
              Administration des structures gouvernementales et suivi du patrimoine affecté
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
              onClick={() => { setEditing(null); setOpenForm(true); }}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Nouveau Ministère
            </button>
          </div>
        </div>

        {/* Stats Panel الحقيقي المتصل بالبيانات */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={Building2} 
            label="Total Ministères" 
            value={stats.total.toString()} 
            tone="primary" 
          />
          <StatCard 
            icon={Activity} 
            label="Ministères Actifs" 
            value={stats.actifs.toString()} 
            tone="success" 
          />
          <StatCard 
            icon={UsersIcon} 
            label="Responsables" 
            value={stats.responsablesUniques.toString()} 
            tone="secondary" 
          />
          <StatCard 
            icon={Database} 
            label="Taux d'activité" 
            value={`${stats.tauxActivite}%`} 
            tone="info" 
          />
        </div>

        {/* Table panel */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          
          {/* BARRE DE RECHERCHE ET FILTRES HARMONISÉE */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
            <div className="relative min-w-0 flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un ministère..."
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
                <option value="ACTIF">Actifs uniquement</option>
                <option value="INACTIF">Inactifs uniquement</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50 font-bold text-gray-700">
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Nom du ministère</th>
                  <th className="px-5 py-3.5">Responsable</th>
                  <th className="px-5 py-3.5 text-right">Statut</th>
                  <th className="px-5 py-3.5">Date de Création</th>
                  <th className="w-32 px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-gray-400 font-medium animate-pulse">
                      Chargement des données...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400">
                        <Landmark className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-600">Aucun ministère trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-800 text-xs">{m.code}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Landmark className="h-4 w-4" />
                          </div>
                          <div className="font-semibold text-slate-900">{m.nom}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{m.responsable}</td>
                      <td className="px-5 py-4 text-right">
                        <StatusBadge actif={m.actif} />
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs font-medium">
                        {m.dateCreation ? new Date(m.dateCreation).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-5 py-4 text-center space-x-2 flex justify-center">
                        <IconBtn title="Voir détails" onClick={() => setDetails(m)}>
                          <Eye className="h-4 w-4 text-blue-600" />
                        </IconBtn>
                        <IconBtn title="Modifier" onClick={() => { setEditing(m); setOpenForm(true); }}>
                          <Pencil className="h-4 w-4 text-amber-600" />
                        </IconBtn>
                        <IconBtn title="Supprimer" tone="danger" onClick={() => setConfirmDel(m)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </IconBtn>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* مودال النماذج الذكي */}
      {openForm && (
        <MinistryForm
          initial={editing}
          onClose={() => setOpenForm(false)}
          onSave={handleSaveForm}
        />
      )}

      {/* لوحة العرض الجانبية الفاخرة */}
      {details && <DetailsPanel m={details} onClose={() => setDetails(null)} />}

      {/* مودال الحذف المخصص */}
      {confirmDel && (
        <ConfirmDelete
          name={confirmDel.nom}
          onCancel={() => setConfirmDel(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

/* ---------- الأجزاء الصغيرة المتناسقة ---------- */

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  const tones: Record<string, string> = {
    primary: "bg-indigo-50 text-indigo-600",
    info: "bg-sky-50 text-sky-600",
    secondary: "bg-purple-50 text-purple-600",
    success: "bg-emerald-50 text-emerald-600",
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

function StatusBadge({ actif }: { actif: boolean }) {
  const cls = actif ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${cls}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${actif ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {actif ? "Actif" : "Inactif"}
    </span>
  );
}

function IconBtn({ children, onClick, title, tone }: { children: React.ReactNode; onClick?: () => void; title?: string; tone?: "danger" }) {
  const base = "grid h-8 w-8 place-items-center rounded-lg transition-colors duration-200";
  const hover = tone === "danger" ? "bg-red-50 hover:bg-red-100" : "bg-gray-50 hover:bg-gray-200";
  return (
    <button type="button" title={title} onClick={onClick} className={`${base} ${hover}`}>
      {children}
    </button>
  );
}

/* ---------- مودال الفورم المطور ---------- */

const inputCls = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition";

function MinistryForm({ initial, onClose, onSave }: { initial: MinistereResponseDTO | null; onClose: () => void; onSave: (dto: MinistereRequestDTO) => void }) {
  const [nom, setNom] = useState(initial?.nom || "");
  const [code, setCode] = useState(initial?.code || "");
  const [responsable, setResponsable] = useState(initial?.responsable || "");
  const [adresse, setAdresse] = useState(initial?.adresse || "");
  const [telephone, setTelephone] = useState(initial?.telephone || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [description, setDescription] = useState(initial?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nom, code, responsable, adresse, telephone, email, description });
  };

  return (
    <Overlay onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{initial ? "Modifier le ministère" : "Ajouter un ministère"}</h3>
            <p className="mt-1 text-xs text-gray-500">Renseignez les informations de la structure gouvernementale.</p>
          </div>
          <IconBtn title="Fermer" onClick={onClose}><X className="h-5 w-5 text-gray-500" /></IconBtn>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          <Field label="Nom du ministère" full>
            <input required className={inputCls} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex. Ministère des Finances" />
          </Field>
          <Field label="Code ministère">
            <input required disabled={initial !== null} className={`${inputCls} ${initial ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="ex. MIN-009" />
          </Field>
          <Field label="Responsable">
            <input required className={inputCls} value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Nom du responsable" />
          </Field>
          <Field label="Adresse" full>
            <input className={inputCls} value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Adresse officielle" />
          </Field>
          <Field label="Téléphone">
            <input className={inputCls} value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225 ..." />
          </Field>
          <Field label="Email officiel">
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@ministere.gouv" />
          </Field>
          <Field label="Description" full>
            <textarea className={`${inputCls} min-h-24 resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Missions, attributions, périmètre..." />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
          <button type="button" onClick={onClose} className="rounded-xl bg-white border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
            Annuler
          </button>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800">
            Enregistrer
          </button>
        </div>
      </form>
    </Overlay>
  );
}

/* ---------- لوحة التفاصيل الجانبية الفاخرة ---------- */

function DetailsPanel({ m, onClose }: { m: MinistereResponseDTO; onClose: () => void }) {
  const timeline = [
    { icon: Package, label: "Nouveau bien ajouté", meta: "Imprimante HP LaserJet · il y a 2 h", tone: "info" as const },
    { icon: FileText, label: "Affectation créée", meta: "Véhicule Toyota Hilux → Direction A · hier", tone: "primary" as const },
    { icon: CheckCircle2, label: "Maintenance enregistrée", meta: "Groupe électrogène 80kVA · il y a 3 j", tone: "success" as const },
  ];

  return (
    <Overlay onClose={onClose} align="right">
      <div className="ml-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-slate-900 text-white">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
              <Landmark className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{m.nom}</h3>
              <p className="text-xs text-slate-300 font-mono mt-1">{m.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition"><X className="h-6 w-6" /></button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-6 bg-slate-50">
          <section>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Informations générales</h4>
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-sm">
              <InfoRow icon={UsersIcon} label="Responsable" value={m.responsable} />
              <InfoRow icon={MapPin} label="Adresse" value={m.adresse || "Non renseigné"} />
              <InfoRow icon={Phone} label="Téléphone" value={m.telephone || "Non renseigné"} />
              <InfoRow icon={Mail} label="Email" value={m.email || "Non renseigné"} />
            </div>
          </section>

          {m.description && (
             <section>
               <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Description</h4>
               <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-sm text-slate-600 leading-relaxed">
                 {m.description}
               </div>
             </section>
          )}

          <section>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Activité récente</h4>
            <ol className="relative space-y-5 border-l-2 border-gray-200 pl-6 ml-3">
              {timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[35px] grid h-8 w-8 place-items-center rounded-full ring-4 ring-slate-50 bg-indigo-100 text-indigo-600">
                    <t.icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold text-slate-800">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.meta}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </Overlay>
  );
}

/* ---------- نافذة تأكيد الحذف الحديثة ---------- */

function ConfirmDelete({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Overlay onClose={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl transform transition-all">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600 mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Supprimer ce ministère ?</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Cette action supprimera définitivement <span className="font-bold text-slate-800">{name}</span>. Cette opération est irréversible.
          </p>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={onCancel} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
            Annuler
          </button>
          <button onClick={onConfirm} className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition">
            Oui, Supprimer
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose, align = "center" }: { children: React.ReactNode; onClose: () => void; align?: "center" | "right" }) {
  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      className={`fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-sm animate-fade-in ${align === "right" ? "justify-end" : "items-center justify-center p-4"}`}
    >
      {children}
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default MinisteresPage;