import React, { useEffect, useState } from 'react';
import { categorieAPI } from '../../api/categorieAPI';
import { CategorieResponseDTO, TypeBien } from '../../types';

export const CategoriesPage: React.FC = () => {
  const [cats, setCats] = useState<CategorieResponseDTO[]>([]);
  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<TypeBien>(TypeBien.IMMEUBLE);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 🟢 حالات التحكم في نافذة الحذف الحديثة (Modal States)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  useEffect(() => { 
    charger(); 
  }, []);

  const charger = () => {
    categorieAPI.obtenirTous()
      .then(setCats)
      .catch(err => console.error("Erreur chargement :", err));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (editingId) {
        await categorieAPI.modifier(editingId, { nom, code, type });
      } else {
        await categorieAPI.creer({ nom, code, type });
      }
      annulerEdition();
      charger();
    } catch (error: any) {
      if (error && error.response) {
        const status = error.response.status;
        if (status === 500) {
          setErrorMessage("Erreur interne (500) : Ce code est probablement déjà utilisé ou invalide.");
        } else {
          setErrorMessage(`Erreur (${status}) : Impossible de finaliser l'opération.`);
        }
      } else {
        setErrorMessage("Une erreur réseau est survenue.");
      }
    }
  };

  const activerEdition = (c: CategorieResponseDTO) => {
    setEditingId(c.id);
    setNom(c.nom);
    setCode(c.code);
    setType(c.type);
    setErrorMessage(null);
  };

  const annulerEdition = () => {
    setEditingId(null);
    setNom('');
    setCode('');
    setType(TypeBien.IMMEUBLE);
    setErrorMessage(null);
  };

  // 🟢 فتح نافذة الحذف العصرية وتحديد العنصر المستهدف
  const triggerSuppressionModal = (id: string) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // 🟢 تنفيذ الحذف الفعلي بعد تأكيد المستخدم داخل الـ Modal
  const confirmerSuppression = async () => {
    if (!idToDelete) return;
    try {
      await categorieAPI.supprimer(idToDelete);
      if (editingId === idToDelete) annulerEdition();
      charger();
    } catch (error) {
      alert("Impossible de supprimer cette catégorie.");
    } finally {
      // إغلاق النافذة وتصفير الحالة
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
    }
  };

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
      
      {/* 1. Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border space-y-4 shadow-sm h-fit">
        <h2 className="font-bold text-slate-900">
          {editingId ? "Modifier la Nomenclature" : "Nouvelle Nomenclature"}
        </h2>
        
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-semibold">
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Code</label>
          <input 
            type="text" 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            required 
            disabled={editingId !== null} 
            className={`w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 ${editingId ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Libellé</label>
          <input 
            type="text" 
            value={nom} 
            onChange={e => setNom(e.target.value)} 
            required 
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Type d'actif comptable</label>
          <select 
            value={type} 
            onChange={e => setType(e.target.value as TypeBien)} 
            className="w-full border rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            {Object.values(TypeBien).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            type="submit" 
            className={`flex-1 text-white font-bold py-2 rounded-lg text-xs transition ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            {editingId ? "Enregistrer" : "Ajouter la catégorie"}
          </button>
          
          {editingId && (
            <button 
              type="button" 
              onClick={annulerEdition}
              className="px-3 bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-xs hover:bg-gray-300 transition"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* 2. Tableau */}
      <div className="md:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 font-bold text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">Code</th>
              <th className="px-6 py-3 text-left">Libellé</th>
              <th className="px-6 py-3 text-left">Type comptable</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cats.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-bold text-slate-800">{c.code}</td>
                <td className="px-6 py-4 text-slate-600">{c.nom}</td>
                <td className="px-6 py-4 font-semibold text-xs text-indigo-600">{c.type}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button 
                    onClick={() => activerEdition(c)}
                    className="text-xs bg-amber-50 text-amber-700 border border-amber-200 font-bold px-3 py-1 rounded-md hover:bg-amber-100 transition"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => triggerSuppressionModal(c.id!)} // استدعاء المودال الحديث بدلاً من الـ confirm الافتراضية
                    className="text-xs bg-red-50 text-red-700 border border-red-200 font-bold px-3 py-1 rounded-md hover:bg-red-100 transition"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🟢 3. نافذة التأكيد العصرية والجميلة (Modern Confirmation Modal) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-100 transform transition-all scale-100">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              {/* أيقونة تحذيرية صغيرة */}
              <div className="p-2 bg-red-50 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-900">Confirmation</h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
            </p>
            
            <div className="flex space-x-2 justify-end">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmerSuppression}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
              >
                Oui, Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriesPage;