import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bienAPI } from '../../api/bienAPI';
import { ministereAPI } from '../../api/ministereAPI';
import { categorieAPI } from '../../api/categorieAPI';
import { BienRequestDTO, EtatBien, MinistereResponseDTO, CategorieResponseDTO } from '../../types';
import { ArrowLeft, Save, Package, AlertTriangle } from 'lucide-react';
import LocationPicker from "../../components/common/LocationPicker";
import { UploadCloud } from 'lucide-react'; 
export const BienFormPage: React.FC = () => {

  const navigate = useNavigate();
  const [ministeres, setMinisteres] = useState<MinistereResponseDTO[]>([]);
  const [categories, setCategories] = useState<CategorieResponseDTO[]>([]);
const [imageFile, setImageFile] = useState<File | null>(null);  // State الجديد للتحكم في رسالة الخطأ
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [dto, setDto] = useState<BienRequestDTO>({
    code: '',
    designation: '',
    description: '',
    valeurAcquisition: 0,
    dateAcquisition: new Date().toISOString().split('T')[0],
    etat: EtatBien.NEUF,

    localisation: '',
    latitude: null,
    longitude: null,

    categorieId: '',
    ministereId: ''
  });

  useEffect(() => {
    ministereAPI.obtenirTous().then(setMinisteres);
    categorieAPI.obtenirTous().then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null); // مسح أي خطأ سابق عند المحاولة من جديد
    
    try {
      await bienAPI.creer(dto, imageFile);
      navigate('/biens');
    } catch (err: any) {
      // محاولة قراءة رسالة الخطأ القادمة من السيرفر، أو عرض رسالة افتراضية
      const serverMessage = err.response?.data?.message || err.response?.data?.erreur;
      setErrorMsg(serverMessage || "Impossible d'enregistrer l'actif. Veuillez vérifier vos informations ou l'état du serveur.");
    }
  };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setImageFile(e.target.files[0]);
    }
  };

  const inputCls = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition";

  return (
    <div className="p-8 max-w-4xl mx-auto bg-slate-50/50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/biens')} className="flex items-center text-sm font-medium text-gray-500 hover:text-slate-900 mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour au registre
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-slate-700" /> Fiche de Mise en Inventaire
          </h1>
        </div>
      </div>

      {/* رسالة الخطأ ذات التصميم الحديث تظهر هنا فقط إذا كان هناك خطأ */}
      {errorMsg && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 shadow-sm animate-pulse">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold">Erreur d'enregistrement</h3>
            <p className="text-sm mt-1 opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Désignation administrative</label>
            <input type="text" onChange={e => setDto({...dto, designation: e.target.value})} required className={inputCls} placeholder="Ex: Véhicule Toyota Hilux 4x4" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Code Référence Unique</label>
            <input type="text" onChange={e => setDto({...dto, code: e.target.value})} required className={inputCls} placeholder="Ex: COD-BIEN-2026" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Valeur d'Acquisition (MRU)</label>
            <input type="number" onChange={e => setDto({...dto, valeurAcquisition: Number(e.target.value)})} required className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Ministère de Tutelle</label>
            <select onChange={e => setDto({...dto, ministereId: e.target.value})} required className={inputCls}>
              <option value="">Sélectionner un ministère</option>
              {ministeres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Catégorie Comptable</label>
            <select onChange={e => setDto({...dto, categorieId: e.target.value})} required className={inputCls}>
              <option value="">Sélectionner une catégorie</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Date d'acquisition</label>
            <input type="date" onChange={e => setDto({...dto, dateAcquisition: e.target.value})} required className={inputCls} value={dto.dateAcquisition} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">État Physique</label>
            <select onChange={e => setDto({...dto, etat: e.target.value as EtatBien})} required className={inputCls} value={dto.etat}>
              {Object.values(EtatBien).map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
  <div className="md:col-span-2">
    <label className="block text-xs font-bold text-slate-700 mb-1.5">
      Localisation Physique
    </label>

 <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
  <LocationPicker dto={dto} setDto={setDto} />
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">   
    <input
      type="text"
      readOnly
      value={dto.latitude ?? ""}
      placeholder="Latitude"
      className={`${inputCls} bg-slate-50`}
    />

    <input
      type="text"
      readOnly
      value={dto.longitude ?? ""}
      placeholder="Longitude"
      className={`${inputCls} bg-slate-50`}
    />
    </div>
</div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description (Optionnel)</label>
            <textarea onChange={e => setDto({...dto, description: e.target.value})} className={`${inputCls} min-h-24`} placeholder="Spécificités techniques, numéro de série..." />
          </div>
        </div>


<div className="md:col-span-2">
  <label className="block text-xs font-bold text-slate-700 mb-2">
    Photo du bien
  </label>

  {/* Zone de téléchargement stylisée */}
  <label 
    htmlFor="image-upload" 
    className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-100 hover:border-slate-400 transition-all group"
  >
    <div className="flex flex-col items-center justify-center">
      <div className="p-3 mb-3 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 group-hover:scale-105 group-hover:text-slate-900 transition-all">
        <UploadCloud className="w-6 h-6" />
      </div>
      <p className="mb-1 text-sm text-slate-600 text-center">
        <span className="font-bold text-slate-900">Cliquez pour ajouter une photo</span> ou glissez-la ici
      </p>
      <p className="text-xs text-slate-500">
        PNG, JPG ou SVG (Max. 5MB)
      </p>
    </div>
    
    {/* Input réel, masqué par "hidden" */}
    <input 
      id="image-upload" 
      type="file" 
      accept="image/*" 
      onChange={handleImageChange} 
      className="hidden" 
    />
  </label>
</div>

        <div className="mt-8 flex justify-end pt-5 border-t border-slate-100">
          <button type="button" onClick={() => navigate('/biens')} className="mr-3 px-6 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
            Annuler
          </button>
          <button type="submit" className="flex items-center bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-sm hover:bg-slate-800">
            <Save className="h-4 w-4 mr-2" /> Enregistrer l'actif
          </button>
        </div>
      </form>
    </div>
  );
};
export default BienFormPage;