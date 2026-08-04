import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se ha encontrado el elemento #root.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);