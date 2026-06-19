import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/authAPI';
import { UserRequestDTO } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  
  // State للتبديل بين وضع الدخول ووضع التسجيل
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // States المشتركة
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');

  // States الخاصة بالتسجيل فقط (يجب أن تكون داخل الـ Component!)
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [ministereId, setMinistereId] = useState('');
  const [role, setRole] = useState('ADMIN');

  // دالة تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authAPI.login({ email, motDePasse });
      login(data); // ستقوم هذه الدالة بحفظ التوكن وتوجيه المستخدم
    } catch (err: any) {
      setError("Identifiants invalides ou serveur indisponible.");
    }
  };

  // دالة إنشاء حساب جديد
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData: UserRequestDTO = {
        nom,
        prenom,
        email,
        motDePasse,
        ministereId,
        role: role as any // توافق مع Enum في الباك إند
      };
      
      const data = await authAPI.register(userData);
      // إذا كان الباك إند يرجع توكن بعد التسجيل مباشرة:
      // login(data); 
      
      // أما إذا كان يرجع بيانات المستخدم فقط، نطلب منه تسجيل الدخول:
      alert("Compte créé avec succès ! Veuillez vous connecter.");
      setIsRegisterMode(false);
      setError('');
      
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'inscription. Vérifiez vos données.");
    }
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

      <div className="bg-[#faf8ff] text-[#1a1b21] antialiased min-h-screen flex w-full font-sans">
        
        {/* الجانب الأيسر: الصورة (كما هي) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#1e3a8a] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Architecture institutionnelle" 
              className="w-full h-full object-cover object-center" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0KBIiQkvnZdzbCqViYOyHudzCi8lw_oGsOeJPHqywuR965zSUSzZlo47K6P-wT0fQe1lODP3mUW2ev71CUyfkuKxXBHfmhm1Tkle7mDfaKlndfX_IBGZEsqY2vNI6mo-p_77Ps7AS3bBmSl_qrNOwt-Cn_G0LyBj2N4VrNVwGb58eGdqGhgM1Ra2J2-EkVttn21n44spFx8pQpuSR-FVX6_6dEBQzeTr-9IMykQad1NYS6oWcwSGr4rpEYrG1cXQmDXsO2XOmK_S-" // ضع رابط صورة حقيقي هنا لاحقاً
            />
          </div>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#00236f]/95 via-[#00236f]/80 to-[#00236f]/40 mix-blend-multiply"></div>
          <div className="relative z-20 flex flex-col justify-between p-12 w-full h-full text-white">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-[48px]">account_balance</span>
            </div>
            <div className="max-w-lg">
              <h1 className="text-4xl font-bold mb-6 leading-tight tracking-tight">Gestion de Patrimoine de l'État</h1>
              <p className="text-[#dce1ff] text-base opacity-90">
                Portail officiel sécurisé. Interface d'administration pour le suivi, l'évaluation et la gestion stratégique des actifs publics.
              </p>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن: الفورم (الدخول أو التسجيل) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-[#faf8ff] overflow-y-auto">
          <div className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200 p-8 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00236f]"></div>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1 text-[#1a1b21]">
                {isRegisterMode ? "Créer un compte" : "Connexion"}
              </h2>
              <p className="text-sm text-[#444651]">
                {isRegisterMode ? "Renseignez vos informations pour demander un accès." : "Veuillez vous identifier pour accéder à votre espace."}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium mb-4 flex items-center gap-2">
                {error}
              </div>
            )}

            {/* نستخدم دالة مختلفة حسب الوضعية */}
            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
              
              {/* الحقول الإضافية تظهر فقط في وضع التسجيل */}
              {isRegisterMode && (
                <>
                  <div className="flex gap-4">
                    <div className="space-y-1 w-1/2">
                      <label className="block text-[11px] font-bold tracking-wider text-[#444651]">NOM</label>
                      <input 
                        className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-[#00236f] focus:outline-none" 
                        required type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 w-1/2">
                      <label className="block text-[11px] font-bold tracking-wider text-[#444651]">PRÉNOM</label>
                      <input 
                        className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-[#00236f] focus:outline-none" 
                        required type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold tracking-wider text-[#444651]">CODE MINISTÈRE</label>
                    <input 
                      className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-[#00236f] focus:outline-none" 
                      placeholder="Ex: MIN-01" required type="text" value={ministereId} onChange={(e) => setMinistereId(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* حقول الإيميل والباسورد مشتركة في الوضعين */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold tracking-wider text-[#444651]">ADRESSE E-MAIL GOUVERNEMENTALE</label>
                <input 
                  className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-[#00236f] focus:outline-none" 
                  placeholder="prenom.nom@etat.gov" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold tracking-wider text-[#444651]">MOT DE PASSE</label>
                </div>
                <input 
                  className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-[#00236f] focus:outline-none" 
                  placeholder="••••••••" required type="password" minLength={8} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button 
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-[#00236f] hover:bg-[#1e3a8a] transition-all" 
                  type="submit"
                >
                  {isRegisterMode ? "S'INSCRIRE" : "SE CONNECTER"}
                </button>
              </div>
            </form>

            {/* زر التبديل بين الدخول والتسجيل */}
            <div className="mt-6 text-center text-sm text-[#444651]">
              {isRegisterMode ? (
                <p>Déjà un compte ? <span className="text-[#00236f] font-bold cursor-pointer hover:underline" onClick={() => setIsRegisterMode(false)}>Se connecter</span></p>
              ) : (
                <p>Nouveau membre ? <span className="text-[#00236f] font-bold cursor-pointer hover:underline" onClick={() => setIsRegisterMode(true)}>Créer un compte</span></p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
              <p className="text-xs text-[#505f76] leading-normal">
                🛡️ Accès restreint au personnel autorisé. Toute tentative d'accès non autorisé est surveillée et enregistrée.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;