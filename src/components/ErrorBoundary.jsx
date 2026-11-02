import React, { Component } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔴 [ErrorBoundary] Xatolik ushlandi:", error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem("orders_app_cart_v2");
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">
              Kutilmagan xatolik yuz berdi
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Ilovani yuklashda xatolik aniqlandi. Quyidagi tugma orqali sahifani yangilab, ishlashda davom etishingiz mumkin.
            </p>
            <div className="text-xs text-left bg-slate-900 text-rose-300 p-3 rounded-xl mb-5 font-mono overflow-auto max-h-32 border border-slate-800">
              {this.state.error?.message || "Noma'lum xatolik"}
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              <RefreshCw size={15} />
              <span>Qayta yuklash va tozalash</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
