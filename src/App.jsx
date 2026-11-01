import { useState, useMemo, useRef } from "react";
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

function ShopContent() {
  // Firestore real-time mahsulotlar hooki
  const { products, loading, error, filterByCategory, refetch } = useProducts(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [sortBy, setSortBy] = useState("default");
  
  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const productsRef = useRef(null);

  const notify = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Kategoriya, qidiruv va saralash mantiqi
  const filteredProducts = useMemo(() => {
    // 1. Kategoriya bo'yicha hook orqali filtrlash
    let result = filterByCategory(selectedCategory);

    // 2. Qidiruv so'zi bo'yicha filtrlash
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // 3. Narx va reyting bo'yicha saralash
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [filterByCategory, selectedCategory, searchQuery, sortBy]);

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
                  onNotify={notify}
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
                "{searchQuery}" so'rovi bo'yicha hech qanday natija chiqmadi. Boshqa toifani tanlang yoki qidiruv so'zini o'zgartiring.
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
        onNotify={notify}
      />

      <CartDrawer
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={(order) => {
          notify(`Buyurtma qabul qilindi! Raqami: #${order.id}`);
        }}
      />

      <AuthModal onNotify={notify} />

      <OrdersModal />

      <NotificationToast
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* Footer */}
      <Footer
        onCategoryClick={(cat) => {
          setSelectedCategory(cat);
          scrollToProducts();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ShopContent />
      </CartProvider>
    </AuthProvider>
  );
}
