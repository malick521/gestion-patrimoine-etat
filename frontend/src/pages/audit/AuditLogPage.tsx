import React, { useEffect, useState } from 'react';
import { auditLogAPI } from '../../api/auditLogAPI';
import { AuditLogResponseDTO } from '../../types';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogResponseDTO[]>([]);

  useEffect(() => {
    auditLogAPI.obtenirTous().then(setLogs);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Piste d'Audit Interministérielle</h1>
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs shadow-2xl">
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Journal de traçabilité des opérations</span>
        </div>
        <div className="divide-y divide-slate-800 max-h-[70vh] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-850/50 flex flex-col space-y-1.5 text-slate-300">
              <div className="flex justify-between text-slate-400 font-medium">
                <span>📅 {new Date(log.dateAction).toLocaleString()}</span>
                <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40">{log.action}</span>
              </div>
              <p><span className="text-slate-500 font-bold">Opérateur:</span> <span className="text-indigo-400">{log.userEmail}</span></p>
              <p><span className="text-slate-500 font-bold">Cible:</span> {log.entite} [ID: {log.entiteId}]</p>
              <p className="text-slate-400 italic bg-slate-950 p-2 rounded border border-slate-800/60 mt-1">{log.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AuditLogPage;