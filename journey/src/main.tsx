import { createRoot } from "react-dom/client";
import Index from "./pages/Index.tsx";
import "./index.css";

const rootElement = document.getElementById("journeySection");
if (rootElement) {
  // Wrap in dark mode variable context
  createRoot(rootElement).render(
    <div className="dark relative text-foreground border-border break-words">
      <Index />
    </div>
  );
}
