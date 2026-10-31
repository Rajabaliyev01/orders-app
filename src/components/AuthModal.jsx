import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function AuthModal({ onNotify }) {
  const {
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    signup,
    loginWithGoogle,
    isFirebaseConfigured,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
        await login(email, password);
        if (onNotify) onNotify("Tizimga muvaffaqiyatli kirdingiz!");
      } else {
        await signup(email, password, displayName);
        if (onNotify) onNotify("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
      }
      setAuthModalOpen(false);
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (err) {
      console.error("Auth error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Email yoki parol noto'g'ri");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Ushbu email allaqachon ro'yxatdan o'tgan");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>

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
              : "Do'konda to'liq imkoniyatlardan foydalanish uchun ro'yxatdan o'ting"}
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
                <span>{loading ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}</span>
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
      </div>
    </div>
  );
}
