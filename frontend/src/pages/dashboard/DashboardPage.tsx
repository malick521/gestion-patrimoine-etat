import React, { useState, useEffect } from 'react';
import { bienAPI } from '../../api/bienAPI';
import { ministereAPI } from '../../api/ministereAPI';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ biensCount: 0, ministeresCount: 0, valeurTotale: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [biens, mins] = await Promise.all([bienAPI.obtenirTous(), ministereAPI.obtenirTous()]);
        const valeur = biens.reduce((sum, b) => sum + b.valeurAcquisition, 0);
        setStats({ biensCount: biens.length, ministeresCount: mins.length, valeurTotale: valeur });
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Tableau de Bord Directeur</h1>
      <p className="text-slate-500 text-sm mb-8">Indicateurs clés du patrimoine matériel de l'État</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total des Biens Consignés</span>
          <span className="text-4xl font-black text-slate-900 mt-2">{stats.biensCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ministères Opérationnels</span>
          <span className="text-4xl font-black text-slate-900 mt-2">{stats.ministeresCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col justify-between shadow-xl shadow-emerald-950/10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Valeur Totale du Parc</span>
          <span className="text-3xl font-black mt-2">{stats.valeurTotale.toLocaleString()} MRU</span>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;