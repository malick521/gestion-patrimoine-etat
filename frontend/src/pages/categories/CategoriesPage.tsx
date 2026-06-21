import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { categorieAPI } from '../../api/categorieAPI';
import { CategorieResponseDTO, TypeBien } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../components/AccessControl';
import { 
  Plus, X, FolderTree, CheckCircle, AlertTriangle, 
  Info, Edit, Trash2, Search, Filter, Download 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const CategoriesPage: React.FC = () => {
  // 🔐 CONNEXION AU CONTEXTE D'AUTHENTIFICATION
  const { user } = useAuth();
  const userRole = user?.role || 'CONSULTANT';

  // 🔐 ÉVALUATION DYNAMIQUE DES DROITS SELON LA MATRICE
  const canCreate = hasPermission(userRole, 'categories', 'CREATE');
  const canEdit = hasPermission(userRole, 'categories', 'UPDATE');
  const canDelete = hasPermission(userRole, 'categories', 'DELETE');
  const hasActions = canEdit || canDelete;

  const [cats, setCats] = useState<CategorieResponseDTO[]>([]);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("TOUS");

  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<TypeBien>(TypeBien.IMMEUBLE);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void; isDamageable: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, isDamageable: false });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const loadCategories = useCallback(() => {
    categorieAPI.obtenirTous()
      .then(setCats)
      .catch(() => showToast("Erreur lors du chargement des catégories", "error"));
  }, [showToast]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const filteredCats = useMemo(() => {
    return cats.filter((c) => {
      const matchesSearch = c.nom.toLowerCase().includes(q.toLowerCase()) || c.code.toLowerCase().includes(q.toLowerCase());
      const matchesType = typeFilter === "TOUS" ? true : c.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [cats, q, typeFilter]);

  const exporterPDF = () => {
    const doc = new jsPDF('portrait'); 
    doc.setFontSize(18); doc.setTextColor(15, 23, 42); doc.text("Nomenclature des Catégories", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Date d'extraction : ${new Date().toLocaleString('fr-FR')}`, 14, 30);
    doc.text(`Nombre de catégories : ${filteredCats.length}`, 14, 36);

    autoTable(doc, {
      head: [["Code", "Libellé", "Type Comptable"]],
      body: filteredCats.map(c => [c.code || "N/A", c.nom || "N/A", c.type || "N/A"]),
      startY: 45, styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(`Categories_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, isDamageable = false) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, isDamageable });
  };

  const handleSupprimer = (id: string) => {
    if (!canDelete) {
      showToast("Action refusée : Vous n'avez pas le droit de supprimer.", "error");
      return;
    }
    triggerConfirm(
      "Supprimer la catégorie",
      "Êtes-vous sûr de vouloir supprimer cette nomenclature ? Cette action est irréversible.",
      async () => {
        try {
          await categorieAPI.supprimer(id);
          if (editingId === id) resetForm();
          showToast("Catégorie supprimée avec succès.", "info");
          loadCategories();
        } catch (error: any) {
          showToast(error?.response?.status === 403 ? "Droit insuffisant : Suppression refusée." : "Impossible de supprimer cette catégorie.", "error");
        }
      }, true
    );
  };

  const resetForm = () => { setEditingId(null); setNom(''); setCode(''); setType(TypeBien.IMMEUBLE); };

  const openCreateModal = () => { if (canCreate) { resetForm(); setIsModalOpen(true); } };
  const openEditModal = (c: CategorieResponseDTO) => { if (canEdit) { setEditingId(c.id || null); setNom(c.nom); setCode(c.code); setType(c.type); setIsModalOpen(true); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categorieAPI.modifier(editingId, { nom, code, type });
        showToast("Catégorie modifiée avec succès !");
      } else {
        await categorieAPI.creer({ nom, code, type });
        showToast("Nouvelle catégorie ajoutée !");
      }
      setIsModalOpen(false); resetForm(); loadCategories();
    } catch (error: any) {
      showToast(error?.response?.status === 403 ? "Erreur 403 : Privilèges insuffisants." : "Erreur lors de l'enregistrement.", "error");
    }
  };

  return (
    <div className="p-8 w-full bg-slate-50/50 min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Notifications */}
        <div className="fixed top-5 right-5 z-50 space-y-3 w-80 pointer-events-none">
          {toasts.map((t) => (
            <div key={t.id} className={`p-4 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto ${
              t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
              {t.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
              <span className="flex-1">{t.message}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-900">Nomenclature des Catégories</h2>
            <p className="mt-1 text-sm text-slate-500">Gestion des types d'actifs comptables et de leurs codes d'inventaire</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exporterPDF} disabled={filteredCats.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
              <Download className="h-4 w-4 text-slate-500" /> Exporter PDF
            </button>
            {canCreate && (
              <button onClick={openCreateModal} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800">
                <Plus className="h-4 w-4" /> Nouvelle Catégorie
              </button>
            )}
          </div>
        </div>

        {/* Tableau */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
            <div className="relative min-w-0 flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par nom ou code..." className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-900" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-slate-900">
              <option value="TOUS">Tous les types</option>
              {Object.values(TypeBien).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 font-bold text-gray-700">
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th className="px-6 py-4 w-32">Code</th>
                  <th className="px-6 py-4">Libellé</th>
                  <th className="px-6 py-4">Type comptable</th>
                  {hasActions && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCats.length === 0 ? (
                  <tr>
                    <td colSpan={hasActions ? 4 : 3} className="px-6 py-16 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-400"><FolderTree className="h-6 w-6" /></div>
                      <p className="mt-3 text-sm font-medium text-gray-600">Aucune catégorie trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredCats.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-xs">{c.code}</span></td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{c.nom}</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">{c.type}</span></td>
                      {hasActions && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && <button onClick={() => openEditModal(c)} title="Modifier" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-200"><Edit className="w-4 h-4 text-amber-600" /></button>}
                            {canDelete && <button onClick={() => handleSupprimer(c.id!)} title="Supprimer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 hover:bg-red-100"><Trash2 className="w-4 h-4 text-red-600" /></button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modales */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 flex flex-col">
            <div className="p-6 border-b flex justify-between"><h2 className="text-xl font-bold">{editingId ? "Modifier" : "Nouvelle"} Catégorie</h2><button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div><label className="block text-sm font-bold mb-1.5">Code d'inventaire</label><input required value={code} onChange={e => setCode(e.target.value)} disabled={editingId !== null} className={`w-full rounded-xl border px-3 py-2 text-sm ${editingId ? 'bg-gray-100' : 'bg-white'}`} /></div>
              <div><label className="block text-sm font-bold mb-1.5">Libellé</label><input required value={nom} onChange={e => setNom(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-bold mb-1.5">Type comptable</label><select value={type} onChange={e => setType(e.target.value as TypeBien)} className="w-full rounded-xl border px-3 py-2 text-sm">{Object.values(TypeBien).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
              <div className="pt-4 border-t flex justify-end gap-3 mt-6"><button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border px-4 py-2 text-sm font-bold">Annuler</button><button type="submit" className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-bold">Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center space-y-4">
            <div className={`mx-auto h-14 w-14 flex items-center justify-center rounded-full ${confirmDialog.isDamageable ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}><AlertTriangle className="h-7 w-7" /></div>
            <h3 className="text-lg font-bold">{confirmDialog.title}</h3>
            <p className="text-sm text-slate-500">{confirmDialog.message}</p>
            <div className="mt-6 flex gap-3"><button onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} className="w-full rounded-xl border px-4 py-2.5 text-sm font-bold">Annuler</button><button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(prev => ({ ...prev, isOpen: false })); }} className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white ${confirmDialog.isDamageable ? 'bg-red-600' : 'bg-slate-900'}`}>Confirmer</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;