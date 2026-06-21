import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { LogOut, TrendingUp, Package, Wrench, ArrowRightLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
// 👉 1. IMPORT DES OUTILS DE SÉCURITÉ
import { hasPermission, AccessDeniedModal } from "../../components/AccessControl"; 
import { affectationAPI } from "../../api/affectationAPI";
import { maintenanceAPI } from "../../api/maintenanceAPI";
import { mouvementAPI } from "../../api/mouvementAPI";
import { bienAPI } from "../../api/bienAPI";

interface Activity {
  title: string;
  text: string;
  date: string;
  rawDate: number;
  icon: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const user = authUser || {
    nom: "Cheikh",
    prenom: "K",
    role: "ADMIN"
  };

  // 👉 2. VÉRIFICATION DU DROIT "CREATE" SUR LES BIENS
  const userRole = user.role || 'CONSULTANT';
  const canCreateBien = hasPermission(userRole, 'biens', 'CREATE');
  const [deniedAction, setDeniedAction] = useState<string | null>(null);

  const [stats, setStats] = useState([
    { title: "Total des biens", value: "0", trend: "+0%", icon: <Package size={20} /> },
    { title: "Valeur totale", value: "0 MRU", trend: "+0%", icon: <TrendingUp size={20} /> },
    { title: "Affectations", value: "0", trend: "+0%", icon: <ArrowRightLeft size={20} /> },
    { title: "Maintenance", value: "0", trend: "+0%", icon: <Wrench size={20} /> }
  ]);

  const [activities, setActivities] = useState<Activity[]>([]);

  const [chartData, setChartData] = useState([
    { month: "Jan", value: 0 }, { month: "Fév", value: 0 },
    { month: "Mar", value: 0 }, { month: "Avr", value: 0 },
    { month: "Mai", value: 0 }, { month: "Juin", value: 0 }
  ]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [biens, affectations, maintenances, mouvements]: [any[], any[], any[], any[]] = await Promise.all([
          bienAPI.obtenirTous().catch(() => [] as any[]),
          affectationAPI.obtenirTous().catch(() => [] as any[]),
          maintenanceAPI.obtenirTous().catch(() => [] as any[]),
          mouvementAPI.obtenirTous().catch(() => [] as any[])
        ]);

        const totalBiens = biens.length;
        const valeurTotale = biens.reduce((sum: any, b: any) => sum + Number(b.valeurAcquisition ?? b.valeur ?? 0), 0);

        setStats([
          { title: "Total des biens", value: String(totalBiens), trend: "Actifs", icon: <Package size={20} /> },
          { title: "Valeur totale", value: valeurTotale.toLocaleString("fr-FR") + " MRU", trend: "Estimée", icon: <TrendingUp size={20} /> },
          { title: "Affectations", value: String(affectations.length), trend: "En cours", icon: <ArrowRightLeft size={20} /> },
          { title: "Maintenance", value: String(maintenances.length), trend: "En cours", icon: <Wrench size={20} /> }
        ]);

        // ACTIVITÉS
        let acts: Activity[] = [];

        affectations.forEach((a: any) => {
          acts.push({
            title: "Nouvelle affectation",
            text: `Bien ${a.bienDesignation ?? "N/A"} affecté au ministère ${a.ministereNom ?? ""}`,
            date: new Date(a.dateCreation ?? a.dateDebut).toLocaleDateString("fr-FR"),
            rawDate: new Date(a.dateCreation ?? a.dateDebut).getTime(),
            icon: "affectation"
          });
        });

        maintenances.forEach((m: any) => {
          acts.push({
            title: "Maintenance",
            text: `${m.type ?? ""} - ${m.description ?? "Intervention"}`,
            date: new Date(m.dateCreation ?? m.dateIntervention).toLocaleDateString("fr-FR"),
            rawDate: new Date(m.dateCreation ?? m.dateIntervention).getTime(),
            icon: "maintenance"
          });
        });

        mouvements.forEach((m: any) => {
          acts.push({
            title: "Mouvement",
            text: `${m.type ?? ""} : ${m.bienDesignation ?? ""}`,
            date: new Date(m.dateCreation ?? m.dateMouvement).toLocaleDateString("fr-FR"),
            rawDate: new Date(m.dateCreation ?? m.dateMouvement).getTime(),
            icon: "mouvement"
          });
        });

        acts.sort((a, b) => b.rawDate - a.rawDate);
        setActivities(acts.slice(0, 6));

        setChartData([
          { month: "Jan", value: biens.length > 0 ? 10 : 0 },
          { month: "Fév", value: affectations.length > 0 ? 15 : 0 },
          { month: "Mar", value: maintenances.length > 0 ? 8 : 0 },
          { month: "Avr", value: mouvements.length },
          { month: "Mai", value: totalBiens },
          { month: "Juin", value: totalBiens + affectations.length }
        ]);

      } catch (e) {
        console.log("Erreur lors du chargement du dashboard :", e);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      
      {/* HEADER COMPACT */}
      <header className="bg-white h-16 px-6 lg:px-8 flex items-center justify-between border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-[#00236f] leading-tight">Gestion du patrimoine</h1>
          <p className="text-xs text-gray-500">Tableau de bord administratif</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 border-r border-gray-200 pr-4">
            <div className="bg-[#00236f] text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-semibold text-gray-900 leading-none">{user.prenom} {user.nom}</p>
              <p className="text-xs text-gray-500 mt-1">{user.role}</p>
            </div>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-600 transition-colors" title="Se déconnecter">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* EN-TÊTE DE PAGE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bonjour, {user.prenom} 👋</h2>
            <p className="text-sm text-gray-500 mt-1">Voici la vue globale du patrimoine de l'État.</p>
          </div>
          
          {/* 👉 3. BOUTON PROTÉGÉ PAR LE TEST */}
          <button
            onClick={() => {
              if (!canCreateBien) {
                setDeniedAction("enregistrer un nouveau bien depuis le tableau de bord");
              } else {
                navigate("/biens/nouveau");
              }
            }}
            className="bg-[#00236f] hover:bg-[#1e3fc2] text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
          >
            + Nouveau bien
          </button>
        </div>

        {/* CARTES DE STATISTIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-50 text-[#00236f] rounded-lg">
                  {s.icon}
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-md">
                  {s.trend}
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{s.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* GRAPHIQUE ET ACTIVITÉS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GRAPHIQUE */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Évolution du patrimoine</h3>
            <div className="flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#00236f" fill="#eff6ff" strokeWidth={3} activeDot={{ r: 6, fill: '#00236f', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LISTE DES ACTIVITÉS */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col max-h-[380px]">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Activités récentes</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {activities.length > 0 ? (
                activities.map((a, i) => (
                  <div key={i} className="flex flex-col pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm text-gray-900">{a.title}</p>
                      <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded">{a.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{a.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucune activité récente.</p>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* 👉 4. AFFICHAGE DE LA MODALE SI ACCÈS REFUSÉ */}
      {deniedAction && (
        <AccessDeniedModal 
          actionLabel={deniedAction} 
          onClose={() => setDeniedAction(null)} 
        />
      )}
    </div>
  );
};

export default DashboardPage;