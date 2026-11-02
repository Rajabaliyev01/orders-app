import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  MailCheck,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

export default function AuthModal({ onNotify }) {
  const {
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    signup,
    loginWithGoogle,
    logout,
    sendEmailVerificationLink,
    reloadUser,
    isFirebaseConfigured,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email tasdiqlash (Verification) holatlari
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // Qayta yuborish taymeri
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setError("");
    setResendSuccess("");
    // Agar tasdiqlanmagan holda yopilsa, orqa fondagi soxta sessiyani tozalash
    if (verificationSent) {
      logout().catch(() => {});
      setVerificationSent(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResendSuccess("");

    if (!email || !password) {
      setError("Email va parolni kiriting");
      return;
    }
    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      if (authMode === "login") {
        const user = await login(email, password);
        // Agar foydalanuvchi pochtasi tasdiqlanmagan bo'lsa
        if (user && user.emailVerified === false) {
          setVerificationSent(true);
          setError("Ushbu email hali tasdiqlanmagan. Iltimos, emailingizga kelgan havolani bosing.");
          return;
        }
        if (onNotify) onNotify("Tizimga muvaffaqiyatli kirdingiz!");
        setAuthModalOpen(false);
        setEmail("");
        setPassword("");
        setDisplayName("");
      } else {
        // Ro'yxatdan o'tish (Sign Up) -> avtomatik tasdiqlash xati yuboriladi
        await signup(email, password, displayName);
        setVerificationSent(true);
        setResendCooldown(60);
        if (onNotify) onNotify("Pochtanggizga tasdiqlash xati yuborildi!");
      }
    } catch (err) {
      console.error("Auth error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Email yoki parol noto'g'ri");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Ushbu email allaqachon ro'yxatdan o'tgan");
      } else if (err.code === "auth/invalid-email") {
        setError("Noto'g'ri email formati");
      } else {
        setError(err.message || "Xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onNotify) onNotify("Google orqali tizimga kirdingiz!");
      setAuthModalOpen(false);
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google orqali kirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // Foydalanuvchi havolani bosganini tekshirish
  const handleCheckVerified = async () => {
    setError("");
    setResendSuccess("");
    setChecking(true);
    try {
      const isVerified = await reloadUser();
      if (isVerified) {
        if (onNotify) onNotify("Pochtanggiz muvaffaqiyatli tasdiqlandi! Xush kelibsiz!");
        setAuthModalOpen(false);
        setVerificationSent(false);
        setEmail("");
        setPassword("");
        setDisplayName("");
      } else {
        setError("Pochtangiz hali tasdiqlanmadi. Iltimos emailingizga borgan xatdagi havolani bosing yoki biroz kuting.");
      }
    } catch (err) {
      console.error("Verification check error:", err);
      setError("Tekshirishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setChecking(false);
    }
  };

  // Tasdiqlash xatini qayta yuborish
  const handleResendEmail = async () => {
    setError("");
    setResendSuccess("");
    setLoading(true);
    try {
      await sendEmailVerificationLink();
      setResendSuccess("Yangi tasdiqlash havolasi yuborildi! Pochtanggizni tekshiring.");
      setResendCooldown(60);
    } catch (err) {
      console.error("Resend error:", err);
      if (err.code === "auth/too-many-requests") {
        setError("Juda ko'p so'rov yuborildi. Iltimos, 1 daqiqa kuting.");
      } else {
        setError("Xat yuborishda xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  // Boshqa email bilan kirish / orqaga qaytish
  const handleBackToAuth = async () => {
    await logout().catch(() => {});
    setVerificationSent(false);
    setError("");
    setResendSuccess("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>

        {/* ---------------------------------------------------- */}
        {/* BOSQICH 2: EMAILNI TASDIQLASH OYNASI (FIREBASE VERIFY) */}
        {/* ---------------------------------------------------- */}
        {verificationSent ? (
          <div className="py-2 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
              <MailCheck size={32} className="animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Pochtani tasdiqlang
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Biz <span className="font-bold text-slate-800 break-all">{email}</span> manziliga rasmiy tasdiqlash xatini yubordik.
              </p>
            </div>

            {/* Instruction box */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 text-xs text-indigo-950 text-left space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-indigo-900 text-xs">
                <CheckCircle size={15} className="text-indigo-600 shrink-0" />
                <span>Qanday tasdiqlanadi?</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed pl-1">
                <li>Pochtanggizni (Inbox yoki Spam papkasini) oching;</li>
                <li>Xatdagi <strong>"Verify your email"</strong> havolasini bosing;</li>
                <li>Bosganingizdan so'ng, pastdagi <strong>"Men tasdiqladim"</strong> tugmasini bosing.</li>
              </ol>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 text-left">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 text-left">
                <CheckCircle size={15} className="shrink-0" />
                <span>{resendSuccess}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCheckVerified}
                disabled={checking}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-60 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-200"
              >
                {checking ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Tekshirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Men tasdiqladim (Tekshirish)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || loading}
                className="w-full py-2.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                {resendCooldown > 0
                  ? `Xatni qayta yuborish (${resendCooldown}s)`
                  : "Tasdiqlash xatini qayta yuborish"}
              </button>

              <button
                type="button"
                onClick={handleBackToAuth}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Boshqa email bilan kirish</span>
              </button>
            </div>
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* BOSQICH 1: ASOSIY FORM (KIRISH VA RO'YXATDAN O'TISH) */
          /* ---------------------------------------------------- */
          <>
            {/* Tab Switcher */}
            <div className="flex border-b border-slate-100 mb-6 pb-2 gap-4">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                }}
                className={`pb-2 text-sm font-bold cursor-pointer transition-all border-b-2 ${
                  authMode === "login"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                Kirish (Login)
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setError("");
                }}
                className={`pb-2 text-sm font-bold cursor-pointer transition-all border-b-2 ${
                  authMode === "signup"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                Ro'yxatdan o'tish (Sign Up)
              </button>
            </div>

            {/* Title */}
            <div className="mb-5">
              <h2 className="text-xl font-black text-slate-900">
                {authMode === "login"
                  ? "Hisobingizga kiring"
                  : "Yangi hisob yarating"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === "login"
                  ? "Buyurtmalaringizni kuzatish va xaridlarni boshqarish"
                  : "Haqiqiy elektron pochtangiz orqali xavfsiz ro'yxatdan o'ting"}
              </p>
            </div>

            {/* Error notification */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              {authMode === "signup" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ismingiz
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ismingizni kiriting"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Elektron pochta (Email)
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="misol@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Parol
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kamida 6 ta belgi"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-60 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-200"
              >
                {authMode === "login" ? (
                  <>
                    <LogIn size={16} />
                    <span>{loading ? "Kirilmoqda..." : "Kirish"}</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>{loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-400 uppercase">
                <span className="bg-white px-2">yoki</span>
              </div>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google orqali kirish</span>
            </button>

            {!isFirebaseConfigured && (
              <p className="mt-4 text-[11px] text-center text-slate-400">
                * Firebase .env ulanmaganligi sababli test rejimida ishlaydi.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
