import React, { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../context/AuthContext";
import { formatPrice, CATEGORIES } from "../data/products";
import {
  addProductToFirestore,
  deleteProductFromFirestore,
  updateProductInFirestore,
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
  Tag,
  Layers,
  Sparkles,
  Search,
  Upload,
  AlertCircle,
  ExternalLink,
  Edit3,
  X,
} from "lucide-react";

interface SellerDashboardProps {
  onBackToShop: () => void;
  onNotify: (message: string) => void;
}

export default function SellerDashboard({
  onBackToShop,
  onNotify,
}: SellerDashboardProps) {
  const { products, loading, refetch } = useProducts(true);
  const { orders } = useAuth();

  // Tab: 'products' | 'add' | 'orders'
  const [activeTab, setActiveTab] = useState<"products" | "add" | "orders">("products");

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

  // Umumiy statistika
  const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length;

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

  // Yangi mahsulotni saqlash
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

      const finalCategory = category === "boshqa" ? (customCategory.trim() || "Boshqa") : category;

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
      };

      if (isFirebaseConfigured && db) {
        await addProductToFirestore(newProductData);
        onNotify(`"${name}" mahsuloti Firestore bazasiga qo'shildi va katalogda chiqdi!`);
      } else {
        onNotify(`"${name}" mahsuloti qo'shildi (Demo rejim)!`);
      }

      // Formani tozalash
      setName("");
      setPrice("");
      setOldPrice("");
      setImage("");
      setDescription("");
      setSpecsList([{ key: "Kafolat", value: "1 yil rasmiy" }]);
      setActiveTab("products");
      refetch();
    } catch (err: unknown) {
      console.error("Mahsulot qo'shishda xatolik:", err);
      const msg = err instanceof Error ? err.message : "Xatolik yuz berdi";
      alert("Mahsulotni saqlashda xatolik: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Mahsulotni o'chirish
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Haqiqatan ham "${productName}" mahsulotini o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      if (isFirebaseConfigured && db) {
        await deleteProductFromFirestore(productId);
      }
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
          createdAt: new Date().toISOString(),
        });
      });
      await batch.commit();
      onNotify("Barcha boshlang'ich mahsulotlar Firestore ga muvaffaqiyatli yuklandi!");
      refetch();
    } catch (err) {
      console.error("Seed error:", err);
      alert("Mahsulotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setSeeding(false);
    }
  };

  // Filtrlangan jadval mahsulotlari
  const filteredTableProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTable.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTable.toLowerCase())
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
                    Admin
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Firebase Firestore (ordersapp-01) bilan ulangan
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("add")}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-indigo-600/30"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Yangi mahsulot</span>
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
              <p className="text-xs text-slate-400 font-medium">Katalogdagi Mahsulotlar</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalProductsCount} ta</h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Barchasi saytda faol
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Jami Buyurtmalar</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalOrdersCount} ta</h3>
              <p className="text-[11px] text-indigo-300 mt-1">Xaridorlar tomonidan</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Umumiy Buyurtmalar Summasi</p>
              <h3 className="text-xl font-black text-emerald-400 mt-1 truncate">
                {formatPrice(totalRevenue)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Tushgan buyurtmalar</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Baza Holati</p>
              <h3 className="text-base font-bold text-white mt-1">Firebase Cloud</h3>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● Real-time faol
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
            <span>Mening Mahsulotlarim ({totalProductsCount})</span>
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
            <span>Buyurtmalar Ro'yxati ({totalOrdersCount})</span>
          </button>
        </div>

        {/* TAB 1: BARCHA MAHSULOTLAR JADVALI */}
        {activeTab === "products" && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTable}
                  onChange={(e) => setSearchTable(e.target.value)}
                  placeholder="Mahsulot yoki toifani qidiring..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeedProducts}
                  disabled={seeding}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Demo mahsulotlarni Firestore ga bir marta yuklash"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{seeding ? "Yuklanmoqda..." : "Demo mahsulotlarni bazaga yuklash"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("add")}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md"
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
                    <th className="py-3.5 px-4">Zaxira</th>
                    <th className="py-3.5 px-4">Nishon (Badge)</th>
                    <th className="py-3.5 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTableProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Mahsulotlar topilmadi.
                      </td>
                    </tr>
                  ) : (
                    filteredTableProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
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
                              <p className="font-bold text-white text-sm line-clamp-1">{p.name}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
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

                        <td className="py-3 px-4">
                          {p.badge ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {p.badge}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
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
                Mahsulot ma'lumotlarini to'ldiring. Saqlangandan so'ng, u avtomatik tarzda asosiy katalogda paydo bo'ladi.
              </p>

              <form onSubmit={handleCreateProduct} className="space-y-5 text-xs sm:text-sm">
                
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
                      onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
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
                      onChange={(e) => setOldPrice(e.target.value === "" ? "" : Number(e.target.value))}
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
                      <span className="text-[11px] text-slate-500">JPG, PNG, WebP (2MB gacha)</span>
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
                          onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                          placeholder="Xususiyat (masalan: Xotira)"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
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
                  <label htmlFor="inStockCheck" className="font-medium text-slate-300 cursor-pointer">
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
                    <span>{submitting ? "Saqlanmoqda..." : "Katalogga qo'shish va e'lon qilish"}</span>
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
                      <span className="text-xs">Rasm kiritilsa shu yerda aks etadi</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-indigo-600 font-semibold">
                    <span>{category === "boshqa" ? (customCategory || "Boshqa") : category}</span>
                    <span className="text-amber-500 font-bold">★ 5.0</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {name || "Mahsulotingiz nomi"}
                  </h4>

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
            <h2 className="text-lg font-bold text-white">Xaridorlardan tushgan buyurtmalar</h2>
            
            {orders.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-slate-800">
                <ShoppingBag size={40} className="mx-auto text-slate-500 mb-3" />
                <h3 className="text-base font-bold text-white">Hozircha buyurtmalar yo'q</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Mijozlar saytdan buyurtma berishi bilan bu yerda to'liq ro'yxati chiqadi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
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
                        Tarkibi: {ord.items?.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
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
