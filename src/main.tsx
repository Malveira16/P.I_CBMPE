import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'

window.addEventListener("beforeunload", () => {
  localStorage.clear();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <App />
    </AuthProvider>
  </StrictMode>,
)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[Chama SW] Registrado com sucesso:", registration.scope);

        // Detecta nova versão e força atualização
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.onstatechange = () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("[Chama SW] Nova versão detectada!");
                newWorker.postMessage({ type: "SKIP_WAITING" });
                window.location.reload();
              }
            };
          }
        };
      })
      .catch((err) =>
        console.error("[Chama SW] Falha ao registrar service worker:", err)
      );
  });
}

