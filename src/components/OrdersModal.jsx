import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";
import { X, Package, Clock, MapPin, Phone, CheckCircle, Truck, ShoppingBag } from "lucide-react";

export default function OrdersModal() {
  const { ordersModalOpen, setOrdersModalOpen, orders, currentUser } = useAuth();

  if (!ordersModalOpen) return null;

  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("uz-UZ", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Mening buyurtmalarim
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser
                  ? `${currentUser.displayName || currentUser.email} hisobi`
                  : "Ushbu qurilmadagi buyurtmalar"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setOrdersModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <ShoppingBag size={30} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Hozircha buyurtmalar yo'q
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                Siz hali birorta ham buyurtma bermagansiz. Mahsulotlarni tanlab, buyurtma berishingiz mumkin.
              </p>
              <button
                onClick={() => setOrdersModalOpen(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Katalogni ko'rish
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all shadow-2xs space-y-3"
              >
                {/* Order header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      #{order.id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    <Truck size={12} />
                    {order.status || "Kutilmoqda"}
                  </span>
                </div>

                {/* Products list */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <span className="text-slate-800 font-medium truncate">
                          {item.name}
                        </span>
                        <span className="text-slate-400 shrink-0">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-700 shrink-0 pl-2">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery & Payment info */}
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {order.customer?.city}, {order.customer?.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={12} />
                      {order.customer?.phone}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 mr-2">Jami:</span>
                    <span className="font-extrabold text-sm text-indigo-600">
                      {formatPrice(order.pricing?.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 text-right">
          <button
            onClick={() => setOrdersModalOpen(false)}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
