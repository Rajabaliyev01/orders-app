import { useState, useMemo, useRef, useEffect } from "react";
import { INITIAL_PRODUCTS } from "./data/products";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { db, isFirebaseConfigured } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

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

import { Search, Frown } from "lucide-react";

function ShopContent() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [sortBy, setSortBy] = useState("default");
  
  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const productsRef = useRef(null);

  // Firestore dan mahsulotlarni yuklash (agar foydalanuvchi Firestore ga qo'shsa)
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const fetchFirestoreProducts = async () => {
        try {
          const snapshot = await getDocs(collection(db, "products"));
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() });
            });
            setProducts(list);
          }
        } catch (err) {
          console.warn("Firestore mahsulotlarini yuklashda xatolik:", err);
        }
      };
      fetchFirestoreProducts();
    }
  }, []);

  const notify = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Filtrlash va saralash
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Toifa bo'yicha
    if (selectedCategory !== "Barchasi") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Qidiruv so'zi bo'yicha
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Saralash
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

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
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Mahsulotlar katalogi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Kafolatlangan sifat va eng maqbul narxlarda
              </p>
            </div>
          </div>

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
