import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Critical root render error:", err);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: system-ui, sans-serif; padding: 20px;">
        <div style="max-width: 450px; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;">
          <h2 style="color: #dc2626; margin-top: 0;">Ilovani yuklashda xatolik</h2>
          <p style="color: #64748b; font-size: 14px;">${err?.message || "Kutilmagan xatolik yuz berdi"}</p>
          <button onclick="localStorage.clear(); window.location.reload();" style="margin-top: 16px; padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 14px;">
            Keshni tozalash va qayta yuklash
          </button>
        </div>
      </div>
    `;
  }
}
