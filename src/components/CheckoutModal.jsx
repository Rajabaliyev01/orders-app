import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  User,
  Loader2,
  Truck,
} from "lucide-react";

export default function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { cart, subtotal, shippingPrice, totalAmount, clearCart } = useCart();
  const { currentUser, createOrder } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.displayName || "");
  const [phone, setPhone] = useState("+998 ");
  const [city, setCity] = useState("Toshkent shahri");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash"); // 'cash', 'card', 'payme'
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Iltimos, ism va familiyangizni kiriting");
      return;
    }
    if (!phone.trim() || phone.trim() === "+998") {
      setError("Iltimos, telefon raqamingizni kiriting");
      return;
    }
    if (!address.trim()) {
      setError("Iltimos, aniq yetkazib berish manzilini kiriting");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          fullName,
          phone,
          city,
          address,
          notes,
        },
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        pricing: {
          subtotal,
          shippingPrice,
          totalAmount,
        },
        paymentMethod,
      };

      const result = await createOrder(orderPayload);
      clearCart();
      setCompletedOrder(result);
      if (onOrderPlaced) {
        onOrderPlaced(result);
      }
    } catch (err) {
      console.error("Buyurtma berishda xato:", err);
      setError("Buyurtmani yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCompletedOrder(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>

        {/* Success Screen */}
        {completedOrder ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Buyurtmangiz muvaffaqiyatli qabul qilindi!
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Buyurtma raqami:{" "}
                <span className="font-mono font-bold text-indigo-600">
                  {completedOrder.id}
                </span>
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs sm:text-sm space-y-2 border border-slate-100 max-w-md mx-auto">
              <div className="flex justify-between text-slate-600">
                <span>Qabul qiluvchi:</span>
                <span className="font-semibold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Telefon:</span>
                <span className="font-semibold text-slate-900">{phone}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Manzil:</span>
                <span className="font-semibold text-slate-900 text-right">{city}, {address}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>To'lov usuli:</span>
                <span className="font-semibold text-slate-900">
                  {paymentMethod === "cash"
                    ? "Yetkazilganda naqd"
                    : paymentMethod === "card"
                    ? "Karta orqali"
                    : "Payme / Click"}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Jami to'lov:</span>
                <span className="text-indigo-600">{formatPrice(completedOrder.pricing.totalAmount)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Operatorimiz tez orada siz bilan bog'lanib, buyurtma tafsilotlarini tasdiqlaydi.
            </p>

            <button
              onClick={handleClose}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 cursor-pointer transition-all"
            >
              Xaridni davom ettirish
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Package className="text-indigo-600" size={24} />
                Buyurtmani rasmiylashtirish
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Yetkazib berish ma'lumotlarini to'ldiring va buyurtmani tasdiqlang.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              
              {/* Row 1: Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ism va familiyangiz *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masalan: Sardor Aliyev"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telefon raqamingiz *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: City and Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shahar / Hudud
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800 cursor-pointer"
                  >
                    <option>Toshkent shahri</option>
                    <option>Toshkent viloyati</option>
                    <option>Samarqand</option>
                    <option>Buxoro</option>
                    <option>Andijon</option>
                    <option>Farg'ona</option>
                    <option>Namangan</option>
                    <option>Qashqadaryo</option>
                    <option>Surxondaryo</option>
                    <option>Xorazm</option>
                    <option>Navoiy</option>
                    <option>Jizzax</option>
                    <option>Sirdaryo</option>
                    <option>Qoraqalpog'iston</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Aniq manzil *
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Tuman, ko'cha, uy raqami"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  To'lov usuli
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      paymentMethod === "cash"
                        ? "border-indigo-600 bg-indigo-50/60 text-indigo-700 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Banknote size={20} />
                    <span className="text-xs">Naqd</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-indigo-600 bg-indigo-50/60 text-indigo-700 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <CreditCard size={20} />
                    <span className="text-xs">Karta orqali</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("payme")}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      paymentMethod === "payme"
                        ? "border-indigo-600 bg-indigo-50/60 text-indigo-700 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Smartphone size={20} />
                    <span className="text-xs">Payme / Click</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kuryer uchun izoh (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masalan: Domofon kodi 45, kechqurun olib keling..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Order total review box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Mahsulotlar soni:</span>
                  <span className="font-semibold text-slate-800">{cart.length} xil</span>
                </div>
                <div className="flex justify-between">
                  <span>Yetkazib berish:</span>
                  <span className="font-semibold">
                    {shippingPrice === 0 ? "Bepul" : formatPrice(shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Jami to'lov:</span>
                  <span className="text-indigo-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-60 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-indigo-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Buyurtma rasmiylashtirilmoqda...</span>
                  </>
                ) : (
                  <span>Buyurtmani tasdiqlash ({formatPrice(totalAmount)})</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
