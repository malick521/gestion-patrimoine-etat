import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/authAPI';
import { UserRequestDTO } from '../../types';
import { Toast } from '../../components/common/Toast'; // ← ajuste le chemin selon ton arborescence
import { 
  Mail, Lock, User, Building, ShieldCheck, 
  Eye, EyeOff, Loader2, ArrowRight, Info
} from 'lucide-react'; 

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  
  // States de l'interface
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // STATE : Pour afficher le message de mot de passe oublié
  const [showForgotMsg, setShowForgotMsg] = useState(false);

  // STATE : Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // States du formulaire
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [ministereId, setMinistereId] = useState('');
  const [role, setRole] = useState('ADMIN'); // Par défaut

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await authAPI.login({ email, motDePasse });
      login(data);
    } catch (err: any) {
      setError("Identifiants invalides ou serveur indisponible.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const userData: UserRequestDTO = {
        nom,
        prenom,
        email,
        motDePasse,
        ministereId,
        role: role as any
      };
      
      await authAPI.register(userData);
      setToast({ message: "Compte créé avec succès ! Veuillez vous connecter.", type: 'success' });
      setIsRegisterMode(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'inscription. Vérifiez vos données.");
      setToast({ message: "Erreur lors de l'inscription. Vérifiez vos données.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMotDePasse('');
    setNom('');
    setPrenom('');
    setMinistereId('');
    setError('');
    setShowForgotMsg(false); 
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    resetForm();
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] transition-all";
  const labelClass = "block text-xs font-bold tracking-wide text-slate-500 mb-1.5 ml-1";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400";

  return (
    <div className="min-h-screen flex w-full font-sans bg-slate-50 selection:bg-[#00236f]/20">
      
      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* SECTION GAUCHE : VISUEL MARQUE & MAURITANIE */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#00174f]">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Paysage et Patrimoine de la Mauritanie" 
            className="w-full h-full object-cover object-center opacity-60 scale-105" 
            src="https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcR8vejWCpBOLF4xrD61zhZ7BRJxHVS6HXQ_9rgIxqpVWgdWYamQRWZdAyPeqg_ulus_4IcFk_zT5DzZFmYkIoSk4_s&s=19" 
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-[#00174f]/90 via-[#00236f]/70 to-transparent mix-blend-multiply"></div>
        
        <div className="relative z-20 flex flex-col justify-between p-16 w-full h-full text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SIGPE • RIM</span>
          </div>
          
          <div className="max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl font-extrabold mb-5 leading-tight tracking-tight text-white">
              Gestion Stratégique du Patrimoine de l'État
            </h1>
            
            <div className="inline-block px-4 py-1.5 mb-6 border border-emerald-500/40 bg-emerald-900/40 backdrop-blur-sm rounded-full shadow-sm">
              <p className="text-emerald-300 text-xs font-bold tracking-[0.2em] uppercase">
                Honneur • Fraternité • Justice
              </p>
            </div>

            <p className="text-blue-50 text-lg font-medium leading-relaxed drop-shadow-md">
              Préserver, valoriser et transmettre l'héritage national. Le portail officiel d'administration des actifs de la République Islamique de Mauritanie.
            </p>
          </div>
          
          <div className="text-xs text-blue-200/70 font-medium">
            © {new Date().getFullYear()} Gouvernement de la Mauritanie. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* SECTION DROITE : FORMULAIRE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative overflow-y-auto">
        
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-50/50 blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-[420px] relative z-10">
          
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isRegisterMode ? "Créer un accès" : "Bienvenue"}
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              {isRegisterMode 
                ? "Renseignez vos informations professionnelles." 
                : "Connectez-vous à votre espace sécurisé."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          <form 
            onSubmit={isRegisterMode ? handleRegister : handleLogin} 
            className="space-y-5 animate-in fade-in duration-300"
            key={isRegisterMode ? 'register' : 'login'}
          >
            
            {isRegisterMode && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                <div className="relative">
                  <label className={labelClass}>NOM</label>
                  <div className="relative">
                    <User className={iconClass} />
                    <input className={inputClass} required type="text" placeholder="Dupont" value={nom} onChange={(e) => setNom(e.target.value)} />
                  </div>
                </div>
                <div className="relative">
                  <label className={labelClass}>PRÉNOM</label>
                  <div className="relative">
                    <User className={iconClass} />
                    <input className={inputClass} required type="text" placeholder="Jean" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                  </div>
                </div>
                <div className="relative col-span-2">
                  <label className={labelClass}>CODE MINISTÈRE</label>
                  <div className="relative">
                    <Building className={iconClass} />
                    <input className={inputClass} required type="text" placeholder="Ex: MIN-01" value={ministereId} onChange={(e) => setMinistereId(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <label className={labelClass}>ADRESSE E-MAIL</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input 
                  className={inputClass} 
                  required 
                  type="email" 
                  placeholder="agent@etat.gov.mr" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-xs font-bold tracking-wide text-slate-500">MOT DE PASSE</label>
                {!isRegisterMode && (
                  <button 
                    type="button"
                    onClick={() => setShowForgotMsg(!showForgotMsg)}
                    className="text-xs font-bold text-[#00236f] hover:text-[#1e3a8a] transition"
                  >
                    Oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className={iconClass} />
                <input 
                  className={inputClass} 
                  required 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  minLength={8} 
                  value={motDePasse} 
                  onChange={(e) => setMotDePasse(e.target.value)} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {showForgotMsg && !isRegisterMode && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <Info className="w-5 h-5 text-[#00236f] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#00236f]">Besoin d'aide ?</p>
                  <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                    Pour des raisons de sécurité liées aux données de l'État, la réinitialisation par email est désactivée. Veuillez contacter votre administrateur système à l'adresse <strong>support-sigpe@etat.gov.mr</strong>.
                  </p>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#00236f] hover:bg-[#00174f] shadow-lg shadow-[#00236f]/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed" 
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isRegisterMode ? "Créer mon compte" : "Accéder à l'espace"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-sm text-slate-600 font-medium">
              {isRegisterMode ? "Vous possédez déjà un accès ?" : "Nouveau sur la plateforme ?"}
              <button 
                type="button"
                onClick={toggleMode}
                className="ml-1.5 text-[#00236f] font-bold hover:underline"
              >
                {isRegisterMode ? "Se connecter" : "S'inscrire"}
              </button>
            </p>
          </div>

          <div className="mt-8 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Accès restreint au personnel autorisé. Vos connexions sont chiffrées de bout en bout et tracées dans la piste d'audit gouvernementale.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;