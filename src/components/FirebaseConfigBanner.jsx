import { useState } from "react";
import { isFirebaseConfigured } from "../firebase";
import { CheckCircle2, AlertCircle, X, ExternalLink, HelpCircle } from "lucide-react";

export default function FirebaseConfigBanner() {
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <aside aria-label="Firebase ulanish holati" className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isFirebaseConfigured ? (
              <>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Firebase ulangan
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  (Autentifikatsiya va Firestore ma'lumotlar bazasi faol)
                </span>
              </>
            ) : (
              <>
                <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                <span className="font-medium text-amber-300 flex items-center gap-1">
                  <AlertCircle size={13} /> Demo rejimda ishlamoqda
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  (Barcha funksiyalar lokal ishlaydi. Haqiqiy Firebase ulash uchun .env faylini to'ldiring)
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuide(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HelpCircle size={13} /> Qanday ulanadi?
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              title="Yopish"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Qo'llanma Modali */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                🔥 Firebase va Vercel qo'llanmasi
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">1. Firebase loyiha yaratish</h4>
                <p>
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    console.firebase.google.com <ExternalLink size={12} />
                  </a>{" "}
                  ga kiring va yangi loyiha yarating.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">2. Web ilova (Web App) qo'shish</h4>
                <p>
                  Loyiha bosh sahifasida <code>&lt;/&gt;</code> (Web) belgisini bosing va ilovangiz nomini kiriting.
                  Sizga berilgan <code>firebaseConfig</code> kalitlarini oling.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">3. .env fayliga kalitlarni yozish</h4>
                <p className="text-xs bg-slate-100 p-2.5 rounded-lg font-mono text-slate-800 leading-relaxed">
                  VITE_FIREBASE_API_KEY=AIzaSy...<br/>
                  VITE_FIREBASE_AUTH_DOMAIN=sizning-app.firebaseapp.com<br/>
                  VITE_FIREBASE_PROJECT_ID=sizning-app<br/>
                  VITE_FIREBASE_STORAGE_BUCKET=sizning-app.appspot.com<br/>
                  VITE_FIREBASE_MESSAGING_SENDER_ID=...<br/>
                  VITE_FIREBASE_APP_ID=1:...:web:...
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">4. Authentication va Firestore ni yoqish</h4>
                <p>
                  Firebase konsolida <strong>Authentication</strong> bo'limiga kirib <em>Email/Password</em> va <em>Google</em> ni yoqing.
                  So'ng <strong>Cloud Firestore</strong> bo'limidan yangi baza yarating.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-1">5. Vercelga joylash (Deploy)</h4>
                <p>
                  Loyiha Vercel uchun to'liq tayyorlangan (`vercel.json` kiritilgan). Vercel da loyihani import qilganda, yuqoridagi <code>VITE_FIREBASE_*</code> o'zgaruvchilarini Environment Variables bo'limiga kiriting.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium cursor-pointer transition-colors"
              >
                Tushundim
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
