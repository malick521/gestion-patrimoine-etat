import React, { useEffect, useState } from 'react';
import { userAPI } from '../../api/userAPIS'; 
import { ministereAPI } from '../../api/ministereAPI'; 
import { UserResponseDTO, UserRole, MinistereResponseDTO, UserRequestDTO } from '../../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [ministeres, setMinisteres] = useState<MinistereResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('Tous');
  const [openForm, setOpenForm] = useState<boolean>(false);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [usersData, ministeresData] = await Promise.all([
        userAPI.obtenirTous(),
        ministereAPI.obtenirTous() 
      ]);
      setUsers(usersData);
      setMinisteres(ministeresData);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActif = async (id: string, statutActuel: boolean) => {
    try {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, actif: !statutActuel } : u));
      await userAPI.modifierStatut(id);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      chargerDonnees();
    }
  };

  const handleCreateUser = async (dto: UserRequestDTO) => {
    try {
      await userAPI.creer(dto);
      setOpenForm(false);
      chargerDonnees(); 
    } catch (error) {
      alert("Erreur lors de la création du compte de l'agent. Vérifiez les habilitations.");
    }
  };

  const getInitials = (nom: string, prenom: string) => {
    const iNom = nom ? nom.trim().charAt(0).toUpperCase() : '';
    const iPrenom = prenom ? prenom.trim().charAt(0).toUpperCase() : '';
    return `${iPrenom}${iNom}` || 'AG';
  };

  const formatRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Administrateur';
      case UserRole.GESTIONNAIRE: return 'Gestionnaire';
      case UserRole.AUDITEUR: return 'Auditeur';
      case UserRole.CONSULTANT: return 'Consultant';
      default: return role;
    }
  };

  const getPermissionsByRole = (role: UserRole) => {
    return {
      lecture: true,
      modification: role === UserRole.ADMIN || role === UserRole.GESTIONNAIRE,
      approbation: role === UserRole.ADMIN
    };
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      `${user.nom} ${user.prenom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.ministereNom && user.ministereNom.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedRoleFilter === 'Tous') return matchesSearch;
    return matchesSearch && user.userRole === selectedRoleFilter;
  });

  return (
    <div className="min-h-screen bg-[#faf8ff] p-8 font-sans text-on-background relative">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1b21] tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">Rôles, permissions et activité des agents du patrimoine</p>
        </div>
        <button 
          onClick={() => setOpenForm(true)}
          className="inline-flex items-center gap-2 bg-[#00236f] hover:bg-[#1e3fc2] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Inviter un utilisateur
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full lg:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un utilisateur, un e-mail..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {['Tous', UserRole.ADMIN, UserRole.GESTIONNAIRE, UserRole.AUDITEUR, UserRole.CONSULTANT].map((roleKey) => {
            const isSelected = selectedRoleFilter === roleKey;
            const label = roleKey === 'Tous' ? 'Tous' : formatRoleLabel(roleKey as UserRole);
            return (
              <button
                key={roleKey}
                onClick={() => setSelectedRoleFilter(roleKey)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isSelected 
                    ? 'bg-[#00236f] text-white shadow-sm' 
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00236f]"></div>
          <p className="text-gray-500 text-sm mt-4">Synchronisation des agents en cours...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">Aucun agent ou fonctionnaire ne correspond à vos critères.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const perms = getPermissionsByRole(user.userRole);
            return (
              <div 
                key={user.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
              >
                <div className="p-6 pb-4 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#00236f] text-white font-bold flex items-center justify-center text-base shadow-inner">
                      {getInitials(user.nom, user.prenom)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base leading-snug">
                        {user.prenom} {user.nom}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-mono">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 flex flex-wrap items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {formatRoleLabel(user.userRole)}
                  </span>
                  {user.ministereNom && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {user.ministereNom}
                    </span>
                  )}
                </div>

                <div className="px-6 space-y-3 mb-6 border-t border-gray-50 pt-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Lecture</span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${perms.lecture ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-200 ${perms.lecture ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Modification</span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${perms.modification ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-200 ${perms.modification ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Approbation</span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${perms.approbation ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-200 ${perms.approbation ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>

                <div className="mt-auto bg-[#f4f3fa] px-6 py-4 flex items-center justify-between border-t border-gray-100">
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">Compte actif</span>
                  </div>
                  <button
                    onClick={() => handleToggleActif(user.id, user.actif)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      user.actif ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.actif ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openForm && (
        <UserFormModal 
          ministeres={ministeres}
          onClose={() => setOpenForm(false)}
          onSave={handleCreateUser}
        />
      )}
    </div>
  );
};

/* ---------- COMPOSANT DE FORMULAIRE MODAL ---------- */
function UserFormModal({ ministeres, onClose, onSave }: {
  ministeres: MinistereResponseDTO[];
  onClose: () => void;
  onSave: (dto: UserRequestDTO) => void;
}) {
  const [dto, setDto] = useState<UserRequestDTO>({
    nom: '', prenom: '', email: '', motDePasse: '', ministereId: '', role: UserRole.CONSULTANT
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dto.ministereId) {
      alert("Veuillez sélectionner un ministère de rattachement.");
      return;
    }
    onSave(dto);
  };

  const inputCls = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#00236f] focus:ring-1 focus:ring-[#00236f] transition mt-1";

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-sm items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Enregistrer un Agent Public</h3>
            <p className="text-xs text-gray-500 mt-0.5">Créer un profil avec un rôle d'accès spécifique.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-xs font-bold text-slate-700">Prénom *
              <input type="text" required className={inputCls} placeholder="ex: Ahmed" value={dto.prenom} onChange={e => setDto({...dto, prenom: e.target.value})} />
            </label>
            <label className="block text-xs font-bold text-slate-700">Nom *
              <input type="text" required className={inputCls} placeholder="ex: Ould ..." value={dto.nom} onChange={e => setDto({...dto, nom: e.target.value})} />
            </label>
          </div>

          <label className="block text-xs font-bold text-slate-700">Adresse Email Officielle *
            <input type="email" required className={inputCls} placeholder="agent@patrimoine.gov" value={dto.email} onChange={e => setDto({...dto, email: e.target.value})} />
          </label>

          <label className="block text-xs font-bold text-slate-700">Mot de Passe Initial *
            <input type="password" required className={inputCls} placeholder="Minimum 8 caractères" value={dto.motDePasse} onChange={e => setDto({...dto, motDePasse: e.target.value})} />
          </label>

          <label className="block text-xs font-bold text-slate-700">Rôle Applicatif / Droits *
            <select required className={inputCls} value={dto.role} onChange={e => setDto({...dto, role: e.target.value as UserRole})}>
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>
                  {role === UserRole.ADMIN ? 'Administrateur' : role === UserRole.GESTIONNAIRE ? 'Gestionnaire' : role === UserRole.AUDITEUR ? 'Auditeur' : 'Consultant'}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-bold text-slate-700">Ministère d'Affectation *
            <select required className={inputCls} value={dto.ministereId} onChange={e => setDto({...dto, ministereId: e.target.value})}>
              <option value="" disabled>Sélectionner le ministère de rattachement...</option>
              {ministeres.map(m => (
                <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
          <button type="button" onClick={onClose} className="rounded-xl bg-white border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">Annuler</button>
          <button type="submit" className="rounded-xl bg-[#00236f] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#1e3fc2]">Créer le compte</button>
        </div>
      </form>
    </div>
  );
}

export default UsersPage;