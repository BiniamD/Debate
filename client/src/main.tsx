import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY_ECO;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key (VITE_CLERK_PUBLISHABLE_KEY_ECO)");
}

// Use proxy URL for custom domains (production)
const isCustomDomain = window.location.hostname === "ecochamber.pro" || 
                       window.location.hostname === "www.ecochamber.pro";
const proxyUrl = isCustomDomain ? `${window.location.origin}/__clerk` : undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      proxyUrl={proxyUrl}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
