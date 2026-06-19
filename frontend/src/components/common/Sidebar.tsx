import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Handshake, Wrench, 
  Package, Landmark, FolderTree, Users, FileText, ShieldAlert 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/biens', label: 'Patrimoine & Biens', icon: Building2 },
    { to: '/affectations', label: 'Affectations', icon: Handshake },
    { to: '/maintenances', label: 'Maintenances', icon: Wrench },
    { to: '/mouvements', label: 'Mouvements', icon: Package },
    { to: '/ministeres', label: 'Ministères', icon: Landmark },
    { to: '/categories', label: 'Catégories', icon: FolderTree },
    { to: '/users', label: 'Utilisateurs', icon: Users },
    { to: '/audit', label: 'Journal d\'Audit', icon: FileText },
  ];

  return (
    <div className="w-72 bg-[#11224E] text-slate-200 flex flex-col h-screen sticky top-0 p-4 justify-between select-none">
      
      <div className="flex flex-col space-y-6">
        {/* Profil Header */}
        <div className="flex items-center space-x-3 p-2">
          <div className="w-12 h-12 rounded-full bg-[#00C389] flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-6 h-6 text-[#11224E]" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base leading-tight">Patrimoine</h2>
            <p className="text-xs text-slate-400 font-medium">État · GovAsset</p>
          </div>
        </div>

        {/* Liens de navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive 
                    ? 'bg-[#1E3A75] text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-[#162C5B] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="tracking-wide">{link.label}</span>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-[#00C389]" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Pied de page de conformité */}
      <div className="bg-[#1E3A75] p-4 rounded-2xl border border-sky-950/20">
        <h4 className="text-xs font-bold text-white tracking-wide">Conformité ISO</h4>
        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Audit certifié — v2.4.1</p>
      </div>

    </div>
  );
};

export default Sidebar;