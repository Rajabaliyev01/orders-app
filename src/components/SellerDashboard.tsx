import React, { useState, useEffect } from "react";
import {
  useProducts,
  saveProductLocally,
  deleteProductLocally,
} from "../hooks/useProducts";
import { useAuth } from "../context/AuthContext";
import { formatPrice, CATEGORIES } from "../data/products";
import {
  addProductToFirestore,
  deleteProductFromFirestore,
  isFirebaseConfigured,
  db,
} from "../lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { INITIAL_PRODUCTS } from "../data/products";
import type { Product } from "../types";
import {
  Store,
  ArrowLeft,
  Plus,
  Package,
  Trash2,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  Search,
  Upload,
  AlertCircle,
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  LogOut,
  ShieldCheck,
  MailCheck,
  RefreshCw,
} from "lucide-react";

interface SellerDashboardProps {
  onBackToShop: () => void;
  onNotify: (message: string) => void;
}

/**
 * Sotuvchi avtorizatsiya oynasi (Agar tizimga kirmagan bo'lsa)
 */
function SellerAuthGate({
  onBackToShop,
  onNotify,
}: {
  onBackToShop: () => void;
  onNotify: (msg: string) => void;
}) {
  const { login, signup, loginWithGoogle } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      onNotify("Sotuvchi hisobiga Google orqali muvaffaqiyatli kirildi!");
    } catch (err: unknown) {
      console.error("Google seller login error:", err);
      setError("Google orqali kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        onNotify("Sotuvchi hisobingizga muvaffaqiyatli kirdingiz!");
      } else {
        await signup(email, password, displayName || "Sotuvchi");
        onNotify("Yangi sotuvchi hisobi muvaffaqiyatli yaratildi!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xatolik yuz berdi";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Top brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
            <Store size={28} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sotuvchilar Markazi
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Mahsulotlaringiz boshqa sotuvchilar bilan aralashib ketmasligi uchun sotuvchi hisobingizga kiring.
          </p>
        </div>

        {/* Informative Security Pill */}
        <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl flex items-start gap-2.5 text-xs text-indigo-300">
          <ShieldCheck size={18} className="shrink-0 text-indigo-400 mt-0.5" />
          <span>
            Har bir sotuvchi faqat <strong>o'zi qo'shgan</strong> mahsulotlarni tahrirlaydi va boshqaradi.
          </span>
        </div>

        {/* Google One-Click Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 cursor-pointer transition-all shadow-md active:scale-98 disabled:opacity-60"
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
          <span>Google orqali sotuvchi sifatida kirish</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="absolute bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">
            yoki email bilan
          </span>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => {
              setAuthMode("login");
              setError("");
            }}
            className={`pb-2 text-xs font-bold cursor-pointer transition-all border-b-2 ${
              authMode === "login"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Kirish (Login)
          </button>
          <button
            onClick={() => {
              setAuthMode("signup");
              setError("");
            }}
            className={`pb-2 text-xs font-bold cursor-pointer transition-all border-b-2 ${
              authMode === "signup"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Sotuvchi bo'lib ro'yxatdan o'tish
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {authMode === "signup" && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Do'kon yoki sotuvchi nomi
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Masalan: TechStore yoki Javohir"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Elektron pochta (Email)
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sotuvchi@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Parol
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-98 disabled:opacity-60 text-white rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            {authMode === "login" ? (
              <>
                <LogIn size={15} />
                <span>{loading ? "Kirilmoqda..." : "Kabinetga kirish"}</span>
              </>
            ) : (
              <>
                <UserPlus size={15} />
                <span>{loading ? "Yaratilmoqda..." : "Sotuvchi hisobini yaratish"}</span>
              </>
            )}
          </button>
        </form>

        {/* Back to shop */}
        <div className="pt-2 text-center border-t border-slate-800">
          <button
            onClick={onBackToShop}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Asosiy do'konga qaytish</span>
          </button>
        </div>

      </div>
    </div>
  );
}

/**
 * Sotuvchi pochtasini tasdiqlash oynasi (Agar email tasdiqlanmagan bo'lsa)
 */
function SellerVerificationGate({
  onBackToShop,
  onNotify,
}: {
  onBackToShop: () => void;
  onNotify: (msg: string) => void;
}) {
  const { currentUser, reloadUser, sendEmailVerificationLink, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleCheck = async () => {
    setError("");
    setChecking(true);
    try {
      const verified = await reloadUser();
      if (verified) {
        onNotify("Pochtanggiz muvaffaqiyatli tasdiqlandi! Sotuvchilar Markaziga xush kelibsiz!");
      } else {
        setError("Pochtangiz hali tasdiqlanmadi. Iltimos pochtangizga borgan xatdagi havolani bosing.");
      }
    } catch {
      setError("Tekshirishda xatolik yuz berdi");
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendSuccess("");
    try {
      await sendEmailVerificationLink();
      setResendSuccess("Tasdiqlash havolasi pochtangizga qayta yuborildi!");
      setResendCooldown(60);
    } catch {
      setError("Xat yuborishda xatolik yuz berdi");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-700/50 flex items-center justify-center text-indigo-400 mx-auto shadow-lg">
          <MailCheck size={32} className="animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-black text-white">
            Sotuvchi pochtasini tasdiqlang
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Mahsulot qo'shish va boshqarish uchun <span className="text-indigo-400 font-bold break-all">{currentUser?.email}</span> manziliga yuborilgan tasdiqlash havolasini bosing.
          </p>
        </div>

        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-left space-y-1.5">
          <p className="font-bold text-slate-300">Tasdiqlash tartibi:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
            <li>Pochtanggizni (Inbox yoki Spam) oching;</li>
            <li>Firebase'dan kelgan <strong>"Verify your email"</strong> havolasini bosing;</li>
            <li>So'ng bu yerda <strong>"Men tasdiqladim"</strong> tugmasini bosing.</li>
          </ol>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs rounded-xl flex items-center gap-2 text-left">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs rounded-xl flex items-center gap-2 text-left">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{resendSuccess}</span>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-98 disabled:opacity-60 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-indigo-600/30"
          >
            {checking ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Men tasdiqladim (Tekshirish)</span>
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="w-full py-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer disabled:text-slate-600 transition-colors"
          >
            {resendCooldown > 0
              ? `Xatni qayta yuborish (${resendCooldown}s)`
              : "Tasdiqlash xatini qayta yuborish"}
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
            <button
              onClick={() => logout()}
              className="hover:text-slate-300 cursor-pointer transition-colors"
            >
              Chiqish (Logout)
            </button>
            <button
              onClick={onBackToShop}
              className="hover:text-slate-300 cursor-pointer transition-colors"
            >
              Do'konga qaytish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sotuvchilar Markazi Asosiy Paneli
 */
export default function SellerDashboard({
  onBackToShop,
  onNotify,
}: SellerDashboardProps) {
  const { products, loading, refetch } = useProducts(true);
  const { currentUser, orders, logout } = useAuth();

  // Agar sotuvchi tizimga kirmagan bo'lsa, avtorizatsiya oynasini chiqaramiz
  if (!currentUser) {
    return <SellerAuthGate onBackToShop={onBackToShop} onNotify={onNotify} />;
  }

  // Agar foydalanuvchining pochtasi hali tasdiqlanmagan bo'lsa
  if (currentUser.emailVerified === false) {
    return <SellerVerificationGate onBackToShop={onBackToShop} onNotify={onNotify} />;
  }

  // Tab: 'products' | 'add' | 'orders'
  const [activeTab, setActiveTab] = useState<"products" | "add" | "orders">("products");

  // Mahsulotlar filtri: "my" (faqat o'z mahsulotlarim) yoki "all" (umumiy katalog)
  const [productViewFilter, setProductViewFilter] = useState<"my" | "all">("my");

  // Yangi mahsulot forma holati
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Smartfonlar");
  const [customCategory, setCustomCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [oldPrice, setOldPrice] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [badge, setBadge] = useState("Yangi");
  const [inStock, setInStock] = useState(true);
  const [description, setDescription] = useState("");

  // Xususiyatlar (specs key-value)
  const [specsList, setSpecsList] = useState<Array<{ key: string; value: string }>>([
    { key: "Kafolat", value: "1 yil rasmiy" },
  ]);

  const [searchTable, setSearchTable] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Xavfsiz massivlar
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  // Ushbu sotuvchiga tegishli mahsulotlar
  const myProducts = safeProducts.filter((p) => p.sellerId === currentUser.uid);

  // Ushbu sotuvchiga tegishli buyurtmalar (sotuvchining mahsulotlari bor bo'lgan buyurtmalar)
  const myOrders = safeOrders.filter((ord) => {
    if (!ord.items || ord.items.length === 0) return false;
    return ord.items.some((item) =>
      myProducts.some((mp) => mp.id === item.id)
    );
  });

  // Umumiy statistika (Ushbu sotuvchining o'z ko'rsatkichlari)
  const sellerRevenue = myOrders.reduce(
    (sum, o) => sum + (o?.pricing?.totalAmount || 0),
    0
  );
  const myProductsCount = myProducts.length;
  const myOrdersCount = myOrders.length;

  const handleAddSpecRow = () => {
    setSpecsList([...specsList, { key: "", value: "" }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecsList(specsList.filter((_, idx) => idx !== index));
  };

  const handleSpecChange = (index: number, field: "key" | "value", text: string) => {
    const updated = [...specsList];
    updated[index][field] = text;
    setSpecsList(updated);
  };

  // Rasm yuklash (fayl orqali)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Rasm hajmi 2MB dan kichik bo'lishi kerak");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setImagePreviewError(false);
    };
    reader.readAsDataURL(file);
  };

  // Yangi mahsulotni saqlash (Firestore + LocalStorage)
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Mahsulot nomini kiriting");
    if (!price || Number(price) <= 0) return alert("Narxni to'g'ri kiriting");
    if (!image.trim()) return alert("Mahsulot rasmini kiriting yoki fayl tanlang");

    setSubmitting(true);

    try {
      // Specs massivini obyektga aylantirish
      const specsObj: Record<string, string> = {};
      specsList.forEach((s) => {
        if (s.key.trim() && s.value.trim()) {
          specsObj[s.key.trim()] = s.value.trim();
        }
      });

      const finalCategory =
        category === "boshqa" ? customCategory.trim() || "Boshqa" : category;

      const sellerDisplayName =
        currentUser.displayName || currentUser.email?.split("@")[0] || "Sotuvchi";

      const newProductData: Omit<Product, "id"> = {
        name: name.trim(),
        category: finalCategory,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        rating: 5.0,
        reviewsCount: 1,
        image: image.trim(),
        badge: badge.trim() || undefined,
        inStock,
        description: description.trim() || "Sifatli va kafolatlangan mahsulot.",
        specs: specsObj,
        sellerId: currentUser.uid,
        sellerEmail: currentUser.email || undefined,
        sellerName: sellerDisplayName,
        createdAt: new Date().toISOString(),
      };

      let generatedId = "prod-" + Date.now();

      // 1. Firebase Firestore ga yozish
      if (isFirebaseConfigured && db) {
        try {
          const docId = await addProductToFirestore(newProductData);
          if (docId) generatedId = docId;
        } catch (fsErr) {
          console.warn("Firestore yozishda ogohlantirish, lokal saqlanadi:", fsErr);
        }
      }

      // 2. Har doim lokal xotiraga ham saqlash (umumiy katalogda bir zumda chiqadi)
      saveProductLocally({ id: generatedId, ...newProductData });

      onNotify(
        `"${name}" mahsuloti muvaffaqiyatli qo'shildi va umumiy katalogda darhol chiqdi!`
      );

      // Formani tozalash
      setName("");
      setPrice("");
      setOldPrice("");
      setImage("");
      setDescription("");
      setSpecsList([{ key: "Kafolat", value: "1 yil rasmiy" }]);
      setActiveTab("products");
      setProductViewFilter("my");
      refetch();
    } catch (err: unknown) {
      console.error("Mahsulot qo'shishda xatolik:", err);
      const msg = err instanceof Error ? err.message : "Xatolik yuz berdi";
      alert("Mahsulotni saqlashda xatolik: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Mahsulotni o'chirish (Faqat o'zining mahsulotini)
  const handleDeleteProduct = async (
    productId: string,
    productName: string,
    sellerId?: string
  ) => {
    if (sellerId && sellerId !== currentUser.uid) {
      alert("Siz faqat o'zingiz qo'shgan mahsulotlarni o'chira olasiz!");
      return;
    }

    if (!confirm(`Haqiqatan ham "${productName}" mahsulotini o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      if (isFirebaseConfigured && db) {
        try {
          await deleteProductFromFirestore(productId);
        } catch {
          // continue to delete locally
        }
      }
      deleteProductLocally(productId);
      onNotify(`"${productName}" muvaffaqiyatli o'chirildi!`);
      refetch();
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  // Boshlang'ich mahsulotlarni Firestore ga yuklash (Seed)
  const handleSeedProducts = async () => {
    if (!isFirebaseConfigured || !db) {
      alert("Firebase sozlanmagan");
      return;
    }

    if (!confirm("Boshlang'ich 9 ta mahsulotni Firestore bazasiga yuklamoqchimisiz?")) {
      return;
    }

    setSeeding(true);
    try {
      const batch = writeBatch(db!);
      INITIAL_PRODUCTS.forEach((p) => {
        const docRef = doc(collection(db!, "products"));
        batch.set(docRef, {
          name: p.name,
          category: p.category,
          price: p.price,
          oldPrice: p.oldPrice || null,
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          image: p.image,
          badge: p.badge || "",
          inStock: p.inStock,
          description: p.description,
          specs: p.specs || {},
          sellerId: currentUser.uid,
          sellerEmail: currentUser.email || "",
          sellerName: currentUser.displayName || "OrdersApp Do'kon",
          createdAt: new Date().toISOString(),
        });
      });
      await batch.commit();
      onNotify("Boshlang'ich mahsulotlar Firestore ga muvaffaqiyatli yuklandi!");
      refetch();
    } catch (err) {
      console.error("Seed error:", err);
      alert("Mahsulotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setSeeding(false);
    }
  };

  // Ko'rsatiladigan mahsulotlar (O'zimniki yoki Umumiy katalog)
  const displayProducts =
    productViewFilter === "my" ? myProducts : safeProducts;

  // Filtrlangan jadval mahsulotlari
  const filteredTableProducts = displayProducts.filter(
    (p) =>
      (p?.name || "").toLowerCase().includes(searchTable.toLowerCase()) ||
      (p?.category || "").toLowerCase().includes(searchTable.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToShop}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer transition-all border border-slate-700/60"
            >
              <ArrowLeft size={16} />
              <span>Do'konga qaytish</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Store size={22} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Sotuvchilar Markazi
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Sotuvchi
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Firebase Firestore (ordersapp-01) bilan ulangan
                </p>
              </div>
            </div>
          </div>

          {/* Logged in seller info & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                {(currentUser.displayName || currentUser.email || "S")[0].toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-white line-clamp-1">
                  {currentUser.displayName || "Sotuvchi"}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("add")}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-indigo-600/30"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Yangi mahsulot</span>
            </button>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="Hisobdan chiqish"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Statistics Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Mening Mahsulotlarim</p>
              <h3 className="text-2xl font-black text-white mt-1">{myProductsCount} ta</h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Barchasi umumiy katalogda faol
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Mening Buyurtmalarim</p>
              <h3 className="text-2xl font-black text-white mt-1">{myOrdersCount} ta</h3>
              <p className="text-[11px] text-indigo-300 mt-1">Sizning mahsulotlaringizga</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Mening Tushumim</p>
              <h3 className="text-xl font-black text-emerald-400 mt-1 truncate">
                {formatPrice(sellerRevenue)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Sotuvlar summasi</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Umumiy Katalog Bazasida</p>
              <h3 className="text-base font-bold text-white mt-1">
                {safeProducts.length} ta mahsulot
              </h3>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● Do'konda hamma ko'radi
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all border-b-2 ${
              activeTab === "products"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package size={17} />
            <span>Mahsulotlar Ro'yxati</span>
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all border-b-2 ${
              activeTab === "add"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus size={17} />
            <span>Yangi Mahsulot Qo'shish</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all border-b-2 ${
              activeTab === "orders"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShoppingBag size={17} />
            <span>Buyurtmalar ({myOrdersCount})</span>
          </button>
        </div>

        {/* TAB 1: MAHSULOTLAR JADVALI */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Filter Pill: My Products vs All Products */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setProductViewFilter("my")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    productViewFilter === "my"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Mening mahsulotlarim ({myProductsCount})
                </button>
                <button
                  onClick={() => setProductViewFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    productViewFilter === "all"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Umumiy katalog ({safeProducts.length})
                </button>
              </div>

              <div className="relative flex-1 max-w-sm">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTable}
                  onChange={(e) => setSearchTable(e.target.value)}
                  placeholder="Mahsulot yoki toifani qidiring..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeedProducts}
                  disabled={seeding}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Demo mahsulotlarni Firestore ga bir marta yuklash"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>{seeding ? "Yuklanmoqda..." : "Demo mahsulotlarni yuklash"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("add")}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={14} />
                  <span>Qo'shish</span>
                </button>
              </div>
            </div>

            {/* Mahsulotlar Jadvali */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Mahsulot</th>
                    <th className="py-3.5 px-4">Toifa</th>
                    <th className="py-3.5 px-4">Narxi</th>
                    <th className="py-3.5 px-4">Sotuvchi</th>
                    <th className="py-3.5 px-4">Zaxira</th>
                    <th className="py-3.5 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTableProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        {productViewFilter === "my"
                          ? "Siz hali mahsulot qo'shmadingiz. 'Yangi Mahsulot Qo'shish' tugmasini bosing."
                          : "Mahsulotlar topilmadi."}
                      </td>
                    </tr>
                  ) : (
                    filteredTableProducts.map((p) => {
                      const isOwner = p.sellerId === currentUser.uid;
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80";
                                }}
                              />
                              <div>
                                <p className="font-bold text-white text-sm line-clamp-1">
                                  {p.name}
                                </p>
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  {p.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 font-medium">
                              {p.category}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-extrabold text-white text-sm">
                              {formatPrice(p.price)}
                            </span>
                            {p.oldPrice && (
                              <span className="text-[10px] text-slate-500 line-through block">
                                {formatPrice(p.oldPrice)}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isOwner
                                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {isOwner ? "Sizniki" : p.sellerName || "Do'kon"}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {p.inStock ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Mavjud
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Tugagan
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {isOwner ? (
                              <button
                                onClick={() =>
                                  handleDeleteProduct(p.id, p.name, p.sellerId)
                                }
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                                title="O'chirish"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <span
                                className="text-[11px] text-slate-600 italic"
                                title="Faqat egasi o'chira oladi"
                              >
                                Boshqa sotuvchi
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: YANGI MAHSULOT QO'SHISH FORMASI */}
        {activeTab === "add" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column (2/3) */}
            <div className="lg:col-span-2 bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl">
              <h2 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                <Plus className="text-indigo-400" size={22} />
                Yangi Mahsulot Qo'shish
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Mahsulot ma'lumotlarini to'ldiring. Saqlashingiz bilanoq u{" "}
                <strong className="text-white">asosiy do'kon katalogida</strong>{" "}
                avtomatik aks etadi va barcha mijozlarga ko'rinadi.
              </p>

              <form onSubmit={handleCreateProduct} className="space-y-5 text-xs sm:text-sm">
                {/* Sotuvchi ma'lumoti banneri */}
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <User size={15} className="text-indigo-400" />
                    <span>
                      Sotuvchi:{" "}
                      <strong className="text-white">
                        {currentUser.displayName || currentUser.email}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={13} /> Mahsulot sizning nomingizga biriktiriladi
                  </span>
                </div>

                {/* 1. Nomi */}
                <div>
                  <label className="block font-bold text-slate-200 mb-1.5">
                    Mahsulot nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: iPhone 16 Pro Max 512GB Natural Titanium"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                {/* 2. Toifasi va Nishon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-200 mb-1.5">
                      Toifasi (Kategoriya) *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {CATEGORIES.filter((c) => c !== "Barchasi").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="boshqa">+ Yangi kategoriya kiritish</option>
                    </select>

                    {category === "boshqa" && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Kategoriya nomini yozing..."
                        className="w-full mt-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-200 mb-1.5">
                      Nishon (Badge)
                    </label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">Nishonsiz</option>
                      <option value="Yangi">Yangi</option>
                      <option value="Chegirma">Chegirma</option>
                      <option value="Top Mahsulot">Top Mahsulot</option>
                      <option value="Tavsiya etiladi">Tavsiya etiladi</option>
                      <option value="Trend">Trend</option>
                    </select>
                  </div>
                </div>

                {/* 3. Narxi va Eski Narxi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-200 mb-1.5">
                      Sotuv narxi (so'mda) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="Masalan: 14500000"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-200 mb-1.5">
                      Eski narxi (so'mda, ixtiyoriy)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      value={oldPrice}
                      onChange={(e) =>
                        setOldPrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="Masalan: 16000000"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* 4. Rasm (URL yoki Fayl) */}
                <div>
                  <label className="block font-bold text-slate-200 mb-1.5">
                    Mahsulot rasmi (Havola yoki Fayl tanlash) *
                  </label>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => {
                        setImage(e.target.value);
                        setImagePreviewError(false);
                      }}
                      placeholder="Rasm havolasi (https://images.unsplash.com/... yoki /images/mac.jpg)"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                    />

                    <div className="flex items-center gap-3">
                      <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors">
                        <Upload size={14} />
                        <span>Qurilmadan rasm tanlash</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-500">
                        JPG, PNG, WebP (2MB gacha)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Tavsifi */}
                <div>
                  <label className="block font-bold text-slate-200 mb-1.5">
                    Mahsulot haqida tavsif
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mahsulot afzalliklari va qisqacha ma'lumot..."
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                {/* 6. Xususiyatlar (Specs dinamik jadvali) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-slate-200">
                      Texnik xususiyatlar (Parametrlar)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} /> Qator qo'shish
                    </button>
                  </div>

                  <div className="space-y-2">
                    {specsList.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.key}
                          onChange={(e) =>
                            handleSpecChange(idx, "key", e.target.value)
                          }
                          placeholder="Xususiyat (masalan: Xotira)"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) =>
                            handleSpecChange(idx, "value", e.target.value)
                          }
                          placeholder="Qiymati (masalan: 256 GB)"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(idx)}
                          className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Omborda mavjudligi */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="inStockCheck"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label
                    htmlFor="inStockCheck"
                    className="font-medium text-slate-300 cursor-pointer"
                  >
                    Mahsulot hozirda omborda mavjud (inStock)
                  </label>
                </div>

                {/* Saqlash tugmasi */}
                <div className="pt-4 border-t border-slate-700/80 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 disabled:opacity-50 text-white rounded-xl font-bold text-sm cursor-pointer transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    <span>
                      {submitting
                        ? "Saqlanmoqda..."
                        : "Katalogga qo'shish va e'lon qilish"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("products")}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Column (1/3) */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-300 text-sm flex items-center gap-2">
                <ImageIcon size={16} className="text-indigo-400" />
                Jonli Ko'rinish (Mijozlar qanday ko'radi):
              </h3>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl text-slate-800 max-w-sm mx-auto">
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  {badge && (
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                      {badge}
                    </span>
                  )}
                  {image ? (
                    <img
                      src={image}
                      alt={name || "Namuna"}
                      onError={() => setImagePreviewError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                      <ImageIcon size={40} className="stroke-[1.5] mb-2 opacity-50" />
                      <span className="text-xs">
                        Rasm kiritilsa shu yerda aks etadi
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-indigo-600 font-semibold">
                    <span>
                      {category === "boshqa"
                        ? customCategory || "Boshqa"
                        : category}
                    </span>
                    <span className="text-amber-500 font-bold">★ 5.0</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {name || "Mahsulotingiz nomi"}
                  </h4>

                  <p className="text-[11px] text-slate-400">
                    Sotuvchi:{" "}
                    <span className="font-semibold text-slate-600">
                      {currentUser.displayName || currentUser.email}
                    </span>
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {description || "Mahsulot tavsifi bu yerda ko'rinadi..."}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {oldPrice && (
                        <span className="text-xs text-slate-400 line-through block">
                          {formatPrice(Number(oldPrice))}
                        </span>
                      )}
                      <span className="text-base font-extrabold text-slate-900">
                        {price ? formatPrice(Number(price)) : "0 so'm"}
                      </span>
                    </div>

                    <span className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold">
                      Savatchaga
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUYURTMALAR NAZORATI */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">
              Sizning mahsulotlaringizga tushgan buyurtmalar
            </h2>

            {myOrders.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-slate-800">
                <ShoppingBag size={40} className="mx-auto text-slate-500 mb-3" />
                <h3 className="text-base font-bold text-white">
                  Hozircha buyurtmalar yo'q
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Mijozlar sizning mahsulotlaringizga buyurtma berishi bilan bu yerda to'liq ro'yxati chiqadi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-indigo-400 text-sm">
                          #{ord.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {ord.status || "Kutilmoqda"}
                        </span>
                      </div>
                      <p className="text-xs text-white font-semibold">
                        Mijoz: {ord.customer?.fullName} ({ord.customer?.phone})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Manzil: {ord.customer?.city}, {ord.customer?.address}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Tarkibi:{" "}
                        {ord.items
                          ?.map((i) => `${i.name} (x${i.quantity})`)
                          .join(", ")}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 block">Jami summa:</span>
                      <span className="text-lg font-black text-emerald-400">
                        {formatPrice(ord.pricing?.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
