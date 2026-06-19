import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bienAPI } from '../../api/bienAPI';
import { BienResponseDTO } from '../../types';
import { ArrowLeft, Package, Building2, MapPin, Activity, Database, Banknote, Calendar, AlignLeft } from 'lucide-react';

export const BienDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [b, setBien] = useState<BienResponseDTO | null>(null);

  useEffect(() => {
    if (id) bienAPI.obtenirParId(id).then(setBien).catch(() => navigate('/biens'));
  }, [id, navigate]);

  if (!b) return (
    <div className="p-8 text-center mt-20 text-slate-500 animate-pulse font-medium">
      Chargement du dossier technique...
    </div>
  );

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <button onClick={() => navigate('/biens')} className="flex items-center text-sm font-medium text-gray-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour au registre
          </button>
          <div className="flex items-center gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-lg">
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-white/10">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">{b.designation}</h1>
              <p className="text-sm text-slate-300 font-mono mt-1">CODE: {b.code}</p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-6">
          <section>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Informations Techniques</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <InfoRow icon={Building2} label="Ministère d'Affectation" value={b.ministereNom} />
              <InfoRow icon={Database} label="Catégorie Comptable" value={b.categorieNom} />
              <InfoRow icon={MapPin} label="Localisation Physique" value={b.localisation} />
              <InfoRow icon={Activity} label="État actuel" value={b.etat} />
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Informations Financières</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <InfoRow icon={Banknote} label="Coût d'Acquisition" value={`${b.valeurAcquisition?.toLocaleString()} MRU`} />
              <InfoRow icon={Calendar} label="Date d'Acquisition" value={b.dateAcquisition ? new Date(b.dateAcquisition).toLocaleDateString("fr-FR") : "—"} />
            </div>
          </section>

          {b.description && (
             <section>
               <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Description Complète</h4>
               <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-sm text-slate-600 leading-relaxed flex gap-3 items-start">
                 <AlignLeft className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                 <div>{b.description}</div>
               </div>
             </section>
          )}
        </div>
      </div>
    </div>
  );
};

/* Composant utilitaire pour l'affichage des informations */
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white shadow-sm border border-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default BienDetailPage;