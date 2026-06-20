import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import de useNavigate
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { LogOut } from "lucide-react"; 
import { useAuth } from "../../context/AuthContext";

const DashboardPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate(); // 2. Initialisation du hook de navigation

  // Utilisateur connecté
  const user = authUser || { nom: "Cheikh", prenom: "K.", role: "ADMIN" };

  // ---------------------------------------------------------
  // TODO: Ces états seront remplacés par les vraies données 
  // via un useEffect quand le Backend sera prêt.
  // ---------------------------------------------------------
  const [stats, setStats] = useState([
    { title: "Total des biens", value: "...", trend: "..." },
    { title: "Valeur totale", value: "...", trend: "..." },
    { title: "Affectations", value: "...", trend: "..." },
    { title: "Maintenance", value: "...", trend: "..." },
  ]);

  const [chartData, setChartData] = useState([
    { month: "Jan", value: 18 }, { month: "Fév", value: 22 },
    { month: "Mar", value: 20 }, { month: "Avr", value: 26 },
  ]);

  const [activities, setActivities] = useState([
    { title: "Chargement...", text: "Récupération des activités", date: "" }
  ]);

  // Exemple de ce que nous ferons plus tard avec l'API :
  /*
  useEffect(() => {
    dashboardAPI.getStats().then(data => {
      setStats(data.stats);
      setChartData(data.chart);
      setActivities(data.activities);
    });
  }, []);
  */

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] flex flex-col">
      {/* HEADER */}
      <header className="h-[82px] bg-white border-b px-8 flex items-center">
        <div className="w-full flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#00236f]">Gestion du patrimoine</h1>
            <p className="text-xs text-gray-400">Tableau de bord administratif</p>
          </div>

          <div className="flex items-center gap-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-[380px] bg-gray-50 border rounded-xl px-5 py-3 outline-none focus:border-[#00236f] transition-all"
            />

            <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#00236f] text-white flex items-center justify-center font-bold uppercase">
                  {user.prenom ? user.prenom.charAt(0) : ""}{user.nom ? user.nom.charAt(0) : "KC"}
                </div>
                <div>
                  <p className="font-semibold text-sm">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </div>

              <button onClick={logout} title="Se déconnecter" className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-5 overflow-hidden">
        {/* TITLE */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold">Bonjour {user.prenom} {user.nom}</h2>
            <p className="text-gray-500 text-sm">Vue globale du patrimoine de l'état</p>
          </div>
          {/* 3. AJOUT DE LA REDIRECTION ICI */}
          <button 
            onClick={() => navigate('/bien/nouveau')} // <-- Changez l'URL si votre route React est différente
            className="bg-[#00236f] text-white px-5 py-2 rounded-xl hover:bg-[#00174f] transition-colors"
          >
            + Nouveau bien
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-5 mb-5">
          {stats.map((s, index) => (
            <div key={index} className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-xs uppercase text-gray-400 font-semibold">{s.title}</p>
                <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">{s.trend}</span>
              </div>
              <p className="text-2xl font-bold mt-4">{s.value}</p>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-3 gap-5 h-[430px]">
          {/* CHART */}
          <div className="col-span-2 bg-white rounded-xl border p-5">
            <h3 className="font-bold">Evolution du patrimoine</h3>
            <p className="text-xs text-gray-400 mb-3">Valeur des acquisitions</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#00236f" fill="#dbeafe" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ACTIVITIES */}
          <div className="bg-white rounded-xl border p-5 overflow-y-auto">
            <h3 className="font-bold mb-4">Activités récentes</h3>
            {activities.map((a, i) => (
              <div key={i} className="mb-5 border-b pb-3">
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-gray-500">{a.text}</p>
                <p className="text-xs text-gray-400">{a.date}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;