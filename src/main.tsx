import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App.tsx";
import { useCardStore } from "./state/index.ts";
import "./ui/styles.css";

// Load any card persisted on this device and request persistent storage.
void useCardStore.getState().hydrate();

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
