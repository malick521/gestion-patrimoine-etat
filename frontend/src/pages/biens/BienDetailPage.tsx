import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bienAPI } from '../../api/bienAPI';
import { BienResponseDTO } from '../../types';
import {
  ArrowLeft,
  Package,
  Building2,
  MapPin,
  Activity,
  Database,
  Banknote,
  Calendar,
  AlignLeft,
  Image as ImageIcon
} from 'lucide-react';

export const BienDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [b, setBien] = useState<BienResponseDTO | null>(null);

  useEffect(() => {
    if (id) {
      bienAPI
        .obtenirParId(id)
        .then(setBien)
        .catch(() => navigate('/biens'));
    }
  }, [id, navigate]);

  if (!b) {
    return (
      <div className="p-8 text-center mt-20 text-slate-500 animate-pulse font-medium">
        Chargement du dossier technique...
      </div>
    );
  }

  // Adresse de ton backend
  const API_URL = "http://localhost:8080";

  const imageUrl = b.imageUrl
    ? `${API_URL}${b.imageUrl}`
    : null;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/biens')}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au registre
          </button>

          <div className="flex items-center gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-lg">
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-white/10">
              <Package className="h-8 w-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {b.designation}
              </h1>

              <p className="text-slate-300 font-mono text-sm mt-1">
                CODE : {b.code}
              </p>
            </div>
          </div>
        </div>

        {/* ================= PHOTO ================= */}

        <section>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Photo du bien
          </h4>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

            {imageUrl ? (

              <img
                src={imageUrl}
                alt={b.designation}
                className="w-full max-h-[500px] object-contain bg-slate-50"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/900x500?text=Image+introuvable";
                }}
              />

            ) : (

              <div className="h-80 flex flex-col items-center justify-center bg-slate-100 text-slate-400">

                <ImageIcon className="w-16 h-16 mb-4" />

                <p className="font-medium">
                  Aucune photo disponible
                </p>

              </div>

            )}

          </div>

        </section>

        {/* Informations techniques */}

        <section>

          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Informations Techniques
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <InfoRow
              icon={Building2}
              label="Ministère"
              value={b.ministereNom}
            />

            <InfoRow
              icon={Database}
              label="Catégorie"
              value={b.categorieNom}
            />

            <InfoRow
              icon={MapPin}
              label="Localisation"
              value={b.localisation}
            />

            <InfoRow
              icon={Activity}
              label="État"
              value={b.etat}
            />

          </div>

        </section>

        {/* Informations financières */}

        <section>

          <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Informations Financières
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <InfoRow
              icon={Banknote}
              label="Valeur d'acquisition"
              value={`${b.valeurAcquisition?.toLocaleString()} MRU`}
            />

            <InfoRow
              icon={Calendar}
              label="Date d'acquisition"
              value={
                b.dateAcquisition
                  ? new Date(b.dateAcquisition).toLocaleDateString("fr-FR")
                  : "—"
              }
            />

          </div>

        </section>

        {/* Description */}

        {b.description && (

          <section>

            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Description
            </h4>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex gap-3">

              <AlignLeft className="h-5 w-5 mt-1 text-slate-400 shrink-0" />

              <div className="text-slate-600 leading-relaxed">
                {b.description}
              </div>

            </div>

          </section>

        )}

      </div>
    </div>
  );
};

interface InfoRowProps {
  icon: any;
  label: string;
  value: any;
}

function InfoRow({
  icon: Icon,
  label,
  value
}: InfoRowProps) {

  return (

    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">

      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white border shadow-sm">

        <Icon className="h-4 w-4 text-slate-500" />

      </div>

      <div className="min-w-0">

        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">

          {label}

        </p>

        <p className="text-sm font-semibold text-slate-800 break-words">

          {value || "—"}

        </p>

      </div>

    </div>

  );
}

export default BienDetailPage;