import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App.tsx";
import { trackActiveEngagement } from "./analytics.ts";
import "./ui/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Report active-use time to GA4 for the lifetime of the page. Set up outside
// React so StrictMode's double-mount can't start it twice.
trackActiveEngagement();
