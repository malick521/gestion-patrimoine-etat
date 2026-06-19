import React, { useEffect, useState } from 'react';
import { userAPI } from '../../api/userAPIS';
import { UserResponseDTO } from '../../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);

  useEffect(() => {
    userAPI.obtenirTous().then(setUsers);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Habilitations & Fonctionnaires Agents</h1>
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left font-bold text-gray-700">
            <tr>
              <th className="px-6 py-3">Identité de l'agent</th>
              <th className="px-6 py-3">Email Institutionnel</th>
              <th className="px-6 py-3">Ministère</th>
              <th className="px-6 py-3">Rôle Assigné</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">{u.nom} {u.prenom}</td>
                <td className="px-6 py-4 font-mono text-gray-600">{u.email}</td>
                <td className="px-6 py-4">{u.ministereNom}</td>
                <td className="px-6 py-4"><span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">{u.userRole}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UsersPage;