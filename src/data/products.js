/**
 * MAHSULOTLAR RO'YXATI (PRODUCTS DATA)
 * ----------------------------------------------------
 * Siz ushbu ro'yxatga yangi mahsulotlar qo'shishingiz yoki mavjudlarini tahrirlashingiz mumkin.
 *
 * Rasmlar bo'yicha:
 * 1. Tashqi havola (Unsplash, Cloudinary yoki Firebase Storage URL)
 * 2. Yoki o'zingizning rasmlaringizni 'public/images/' papkasiga tashlab,
 *    image: "/images/mahsulot1.jpg" ko'rinishida yozishingiz mumkin.
 */

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Apple iPhone 15 Pro Max 256GB",
    category: "Smartfonlar",
    price: 14200000,
    oldPrice: 15500000,
    rating: 4.9,
    reviewsCount: 128,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFWorrhuGbwPOA8AtOPnAcAWowLx6mJznhwZ8qjokUTg&s=10",
    badge: "Top Mahsulot",
    inStock: true,
    description: "Titan korpus, A17 Pro kuchli protsessori va professional darajadagi 48 MP kamera tizimi. Batareya quvvati kun bo'yi yetadi.",
    specs: {
      "Xotira": "256 GB",
      "Rang": "Natural Titanium",
      "Ekran": "6.7 dyuym Super Retina XDR",
      "Kafolat": "1 yil rasmiy"
    }
  },
  {
    id: "prod-9",
    name: "MacBook  M5 Pro (24GB / 1TB)",
    category: "Elektronika",
    price: 39589000,
    //oldPrice: 39589000,
    rating: 4.8,
    reviewsCount: 25,
    image: "images/mac.jpg",
    badge: "Tavsiya etiladi",
    inStock: true,
    description: "yuqori unumdorlik, AI ish jarayonlari va professional vazifalar uchun mo‘ljallangan.",
    specs: {
      "Protsessor": "Apple M5 (18-core)",
      "RAM": "16 GB Unified Memory",
      "SSD": "1 TB",
      //"Vazni": "1.24 kg",
      "Display": "Liquid Retina XDR (120 Hz ProMotion, 1600 nitgacha cho'qqi yorqinligi)",

    }
  },
  {
    id: "prod-2",
    name: "Sony WH-1000XM5 Shovqinni bekor qiluvchi quloqchin",
    category: "Aksessuarlar",
    price: 3850000,
    oldPrice: 4200000,
    rating: 4.8,
    reviewsCount: 84,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    badge: "Chegirma",
    inStock: true,
    description: "Sohadagi eng yaxshi Active Noise Cancelling texnologiyasi, kristall toza ovoz va 30 soatgacha uzluksiz ishlash vaqti.",
    specs: {
      "Batareya": "30 soat",
      "Ulanish": "Bluetooth 5.2, 3.5mm AUX",
      "Og'irligi": "250g",
      "Mikrofon": "8 ta mikrofonli tizim"
    }
  },
  {
    id: "prod-3",
    name: "MacBook Air 13 M3 (8GB / 512GB)",
    category: "Elektronika",
    price: 13900000,
    oldPrice: 14800000,
    rating: 5.0,
    reviewsCount: 62,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    badge: "Yangi",
    inStock: true,
    description: "Yengil va ingichka alyuminiy korpus, M3 chipi bilan tezkor ishlash va 18 soatgacha batareya quvvati.",
    specs: {
      "Protsessor": "Apple M3 (8-core)",
      "RAM": "8 GB Unified Memory",
      "SSD": "512 GB",
      "Vazni": "1.24 kg"
    }
  },
  {
    id: "prod-4",
    name: "Samsung Galaxy Watch 6 Classic 47mm",
    category: "Aksessuarlar",
    price: 3100000,
    oldPrice: 3500000,
    rating: 4.7,
    reviewsCount: 45,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    badge: "Ommabop",
    inStock: true,
    description: "Aylanuvchi mexanik bezel, yurak urishi va uyqu monitoringi, mustahkam safir shisha.",
    specs: {
      "O'lchami": "47mm",
      "Himoya": "5ATM + IP68 / MIL-STD-810H",
      "Tizim": "Wear OS by Google"
    }
  },
  {
    id: "prod-5",
    name: "Ergonomik charm ofis kreslosi Pro",
    category: "Uy-ro'zg'or",
    price: 1950000,
    oldPrice: 2300000,
    rating: 4.6,
    reviewsCount: 39,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTHqL98CAoMM2FxyIndz1Z5Q9StpLXxTQ2l5LKuSgKEQ&s",
    badge: "Tavsiya etiladi",
    inStock: true,
    description: "Bel sohasini qo'llab-quvvatlovchi zamonaviy dizayn, nafas oluvchi material va sozlanuvchi tirgaklar.",
    specs: {
      "Maksimal yuklama": "140 kg",
      "Mexanizm": "Multiblok tebranish",
      "Material": "Eko charm va alyuminiy"
    }
  },
  {
    id: "prod-6",
    name: "Premium Oversize Paxta Xudi (Qora)",
    category: "Kiyim-kechak",
    price: 320000,
    oldPrice: 420000,
    rating: 4.9,
    reviewsCount: 97,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    badge: "Chegirma",
    inStock: true,
    description: "100% tabiiy paxta, qulay bichim va zamonaviy ko'rinish. Sovuq kunlar uchun eng yaxshi tanlov.",
    specs: {
      "Tarkibi": "100% Paxta (3-ipli)",
      "O'lchamlar": "S, M, L, XL, XXL",
      "Rangi": "Chuqur qora"
    }
  },
  {
    id: "prod-7",
    name: "Minimalist Charm Ryukzak Laptop uchun",
    category: "Aksessuarlar",
    price: 490000,
    oldPrice: 580000,
    rating: 4.7,
    reviewsCount: 53,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    badge: "Yangi",
    inStock: true,
    description: "15.6 dyuymgacha noutbuklar uchun mo'ljallangan maxsus himoyalangan bo'lma, suv o'tkazmaydigan qoplama.",
    specs: {
      "Sig'imi": "20 litr",
      "Material": "Suv o'tkazmaydigan Oxford matosi",
      "Bo'lmalar": "Asosiy + 4 ta qo'shimcha cho'ntak"
    }
  },
  {
    id: "prod-8",
    name: "Aqlli Qahva Qaynatgich Espresso Barista",
    category: "Uy-ro'zg'or",
    price: 2450000,
    oldPrice: 2900000,
    rating: 4.8,
    reviewsCount: 71,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    badge: "Trend",
    inStock: true,
    description: "20 bar bosimli nasos, avtomatik sut ko'pirtirgich va sensorli boshqaruv paneli.",
    specs: {
      "Bosim": "20 Bar",
      "Suv idishi": "1.5 litr",
      "Quvvati": "1350W"
    }
  }
];

export const CATEGORIES = [
  "Barchasi",
  "Smartfonlar",
  "Elektronika",
  "Aksessuarlar",
  "Kiyim-kechak",
  "Uy-ro'zg'or"
];

// O'zbekiston so'mida xavfsiz formatlash
export const formatPrice = (price) => {
  const num = Number(price);
  if (isNaN(num)) return "0 so'm";
  return new Intl.NumberFormat("uz-UZ").format(num) + " so'm";
};
