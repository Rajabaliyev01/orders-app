import { useState, useMemo, useRef, useCallback, Component } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { useProducts } from "./hooks/useProducts";

import FirebaseConfigBanner from "./components/FirebaseConfigBanner";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import CategoryFilter from "./components/CategoryFilter";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import AuthModal from "./components/AuthModal";
import OrdersModal from "./components/OrdersModal";
import NotificationToast from "./components/NotificationToast";
import Footer from "./components/Footer";

import { Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";

// SellerDashboard lazy import qilamiz — bundling va xato izolatsiyasi uchun
import SellerDashboard from "./components/SellerDashboard";

/**
 * Error Boundary — React xatolarini ushlash va oq ekran oldini olish
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔴 [ErrorBoundary] React xatosi ushlandi:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Xatolik yuz berdi
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Ilovada kutilmagan xatolik sodir bo'ldi. Sahifani qayta yuklang.
            </p>
            <pre className="text-xs text-left bg-slate-100 p-3 rounded-lg mb-4 overflow-auto max-h-32 text-rose-600">
              {this.state.error?.message || "Noma'lum xatolik"}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors"
            >
              Sahifani qayta yuklash
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Do'kon asosiy kontenti — mahsulotlar katalogi, banner, filtrlash
 */
function ShopContent({ onNotify, onOpenSeller }) {
  // Firestore real-time mahsulotlar hooki
  const { products, loading, error, filterByCategory, refetch } = useProducts(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [sortBy, setSortBy] = useState("default");
  
  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const productsRef = useRef(null);

  // Kategoriya, qidiruv va saralash mantiqi
  const filteredProducts = useMemo(() => {
    // 1. Kategoriya bo'yicha hook orqali filtrlash
    let result = [];
    try {
      result = filterByCategory(selectedCategory);
    } catch (err) {
      console.warn("filterByCategory xatosi:", err);
      result = products || [];
    }

    // 2. Qidiruv so'zi bo'yicha filtrlash
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // 3. Narx va reyting bo'yicha saralash (copy qilib sort qilish)
    const sorted = [...result];
    if (sortBy === "price-asc") {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating-desc") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return sorted;
  }, [filterByCategory, products, selectedCategory, searchQuery, sortBy]);

  const scrollToProducts = () => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-600 selection:text-white">
      {/* Top Firebase notification / status pill */}
      <FirebaseConfigBanner />

      {/* Main Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Promotional Hero Banner */}
        <Banner onExploreClick={scrollToProducts} />

        {/* Catalog Section */}
        <section ref={productsRef} className="scroll-mt-24 pt-4 pb-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Mahsulotlar katalogi
                </h2>
                {loading && (
                  <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full animate-pulse">
                    <Loader2 size={13} className="animate-spin" />
                    Yangilanmoqda...
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Kafolatlangan sifat va eng maqbul narxlarda
              </p>
            </div>
          </div>

          {/* Xatolik bo'lsa qayta urinish bloki */}
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>Firestore ma'lumotlarida ogohlantirish: {error} (Lokal mahsulotlar ko'rsatilmoqda)</span>
              </div>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <RefreshCw size={13} /> Qayta yuklash
              </button>
            </div>
          )}

          {/* Filters & Sorting */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalFound={filteredProducts.length}
          />

          {/* Product Cards Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onNotify={onNotify}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 my-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Mahsulot topilmadi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                &quot;{searchQuery}&quot; so&apos;rovi bo&apos;yicha hech qanday natija chiqmadi. Boshqa toifani tanlang yoki qidiruv so&apos;zini o&apos;zgartiring.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Barchasi");
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-indigo-200"
              >
                Filtrlarni tozalash
              </button>
            </div>
          )}

        </section>

      </main>

      {/* Global Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onNotify={onNotify}
      />

      <CartDrawer
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={(order) => {
          onNotify(`Buyurtma qabul qilindi! Raqami: #${order.id}`);
        }}
      />

      <AuthModal onNotify={onNotify} />

      <OrdersModal />

      {/* Footer */}
      <Footer
        onCategoryClick={(cat) => {
          setSelectedCategory(cat);
          scrollToProducts();
        }}
        onOpenSeller={onOpenSeller}
      />
    </div>
  );
}

/**
 * Asosiy App komponenti — sahifa almashtirish (Do'kon / Sotuvchilar) 
 * va global notify boshqaruvi
 */
export default function App() {
  // Sahifa holati: "shop" — do'kon, "seller" — sotuvchilar markazi
  const [currentPage, setCurrentPage] = useState("shop");
  
  // Global toast/notification holati (ikkala sahifada ishlaydi)
  const [toastMessage, setToastMessage] = useState("");

  const notify = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  }, []);

  // Sotuvchilar sahifasiga o'tish
  const handleOpenSeller = useCallback(() => {
    setCurrentPage("seller");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Do'konga qaytish
  const handleBackToShop = useCallback(() => {
    setCurrentPage("shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>

          {/* Sahifaga qarab content almashtirish */}
          {currentPage === "seller" ? (
            <SellerDashboard
              onBackToShop={handleBackToShop}
              onNotify={notify}
            />
          ) : (
            <ShopContent
              onNotify={notify}
              onOpenSeller={handleOpenSeller}
            />
          )}

          {/* Global Notification Toast — ikkala sahifada ham ishlaydi */}
          <NotificationToast
            message={toastMessage}
            onClose={() => setToastMessage("")}
          />

        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
