# 🛍 OrdersApp — Zamonaviy Internet Do'kon (E-commerce)

Ushbu loyiha kichik internet do'kon bo'lib, quyidagi to'liq imkoniyatlarga ega:
- 📦 **Mahsulotlar katalogi**: toifalar (kategoriyalar) bo'yicha filtrlash, qidiruv (search), narx va reyting bo'yicha saralash, mahsulot tafsiloti modali (batafsil ko'rish).
- 🛒 **Savatcha (Cart)**: mahsulotlarni qo'shish/ayirish, sonini boshqarish, bepul yetkazib berish progress paneli, xotirada saqlash (`localStorage`).
- 📝 **Buyurtma berish (Checkout)**: Ism, telefon, manzil, to'lov turi (naqd, karta, Payme/Click), buyurtmani rasmiylashtirish va Firestore'ga yuborish.
- 🔐 **Foydalanuvchi autentifikatsiyasi**: Email/parol va Google orqali kirish/ro'yxatdan o'tish (Firebase Auth + Fallback Demo).
- 📜 **Buyurtmalar tarixi**: Foydalanuvchining o'tgan buyurtmalari ro'yxati va holatlari ("Kutilmoqda", "Yetkazilmoqda", "Yetkazildi").
- 🚀 **Vercel va Firebase uchun 100% tayyor**.

---

## ⚡️ Loyihani ishga tushirish (Local)

Terminalda loyiha papkasiga kiring:
```bash
cd /Users/user10/orders-app
npm run dev
```
Brauzerda `http://localhost:3000` ochiladi.

---

## 📸 1. Mahsulotlar va rasmlar qo'shish

Barcha mahsulotlar `src/data/products.js` faylida saqlanadi.

### Yangi mahsulot qo'shish:
`src/data/products.js` faylini oching va `INITIAL_PRODUCTS` massiviga yangi obyekt qo'shing:

```javascript
{
  id: "prod-9",
  name: "Mahsulotingiz nomi",
  category: "Elektronika", // yoki "Smartfonlar", "Aksessuarlar", "Kiyim-kechak", "Uy-ro'zg'or"
  price: 550000,           // Narxi so'mda
  oldPrice: 650000,        // Eski narxi (chizilgan narx)
  rating: 5.0,
  reviewsCount: 15,
  image: "/images/mening-rasmim.jpg", // yoki internetdagi havola (https://...)
  badge: "Yangi",          // "Yangi", "Chegirma", "Top Mahsulot" yoki bo'sh
  inStock: true,
  description: "Mahsulot haqida batafsil ma'lumot...",
  specs: {
    "Kafolat": "1 yil",
    "Rang": "Qora",
    "Ishlab chiqaruvchi": "Uzbekistan"
  }
}
```

### O'zingizning shaxsiy rasmlaringizni qo'yish:
1. Rasmlaringizni `public/images/` papkasiga nusxalang (masalan: `telefon.jpg`).
2. `src/data/products.js` faylidagi `image` qatoriga `"/images/telefon.jpg"` deb yozing.
3. Rasm avtomatik ravishda saytda aks etadi!

---

## 🔥 2. Firebase bilan ulash

Loyiha Firebase ulanmagan paytda ham **Demo rejimida** to'liq ishlaydi.
Haqiqiy Firebase-ni ulash uchun:

1. [Firebase Console](https://console.firebase.google.com/) ga kiring va **Create a project** bosing.
2. Loyihangizda **Web ilova** yarating (`</>` belgisini bosib).
3. Sizga berilgan kalitlarni nusxalab oling.
4. `orders-app` papkasidagi `.env` faylini oching va kalitlarni kiriting:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=sizning-loyiha.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sizning-loyiha
VITE_FIREBASE_STORAGE_BUCKET=sizning-loyiha.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

5. Firebase konsolida:
   - **Authentication** bo'limiga kiring -> *Get started* -> *Email/Password* va *Google* provayderlarini yoqing (**Enable**).
   - **Cloud Firestore** bo'limiga kiring -> *Create database* -> Test mode ni tanlang.
6. Loyihani qayta ishga tushiring: `npm run dev`. Tepada yashil rangda **"Firebase ulangan"** belgisi paydo bo'ladi!
Buyurtmalar avtomatik ravishda Firestore'dagi `orders` to'plamiga (collection) tushadi.

---

## ☁️ 3. Vercelga joylash (Deploy)

Loyiha ichida `vercel.json` fayli mavjud, bu React SPA sahifalarini to'g'ri yo'naltirishni ta'minlaydi.

### Usul 1: GitHub orqali (Tavsiya etiladi)
1. Kodni GitHub repozitoriyingizga yuklang (`git push`).
2. [Vercel.com](https://vercel.com/) ga kiring va **Add New... -> Project** ni tanlang.
3. Repozitoriyingizni import qiling.
4. **Environment Variables** bo'limiga `.env` faylingizdagi barcha `VITE_FIREBASE_*` kalitlarini qo'shing.
5. **Deploy** tugmasini bosing. 1 daqiqada saytingiz butun dunyo uchun jonli ishlaydi!

### Usul 2: Vercel CLI orqali
```bash
npx vercel
```
So'rovlarga javob bering va deploy qiling.

---

## 📁 Loyiha tuzilmasi

```
orders-app/
├── index.html
├── vite.config.js
├── vercel.json           # Vercel SPA sozlamasi
├── package.json
├── .env                  # Firebase kalitlari
├── .env.example
├── public/
│   ├── favicon.svg
│   └── images/           # O'z rasmlaringizni shu yerga joylaysiz
└── src/
    ├── index.css         # Tailwind CSS v4 uslublari
    ├── main.jsx
    ├── App.jsx           # Asosiy do'kon sahifasi va filtrlash
    ├── firebase.js       # Firebase initsializatsiyasi
    ├── context/
    │   ├── AuthContext.jsx  # Login, signup, buyurtmalar tarixi
    │   └── CartContext.jsx  # Savatcha va hisob-kitob
    ├── data/
    │   └── products.js      # Mahsulotlar ro'yxati va toifalar
    └── components/
        ├── Navbar.jsx               # Qidiruv, logo, savatcha, profil
        ├── Banner.jsx               # Aksiya va afzalliklar banneri
        ├── CategoryFilter.jsx       # Toifalar va saralash
        ├── ProductCard.jsx          # Mahsulot kartochkasi
        ├── ProductModal.jsx         # Mahsulot haqida batafsil oyna
        ├── CartDrawer.jsx           # O'ng tomondan ochiluvchi savatcha
        ├── CheckoutModal.jsx        # Buyurtma rasmiylashtirish formasi
        ├── AuthModal.jsx            # Kirish / Ro'yxatdan o'tish
        ├── OrdersModal.jsx          # Buyurtmalar tarixi
        ├── FirebaseConfigBanner.jsx # Firebase holati paneli
        ├── NotificationToast.jsx    # Xabarnomalar
        └── Footer.jsx               # Saytning pastki qismi
```
