import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    <p className="text-sm text-gray-500 font-medium">Traitement des données de l'État en cours...</p>
  </div>
);
export default LoadingSpinner;