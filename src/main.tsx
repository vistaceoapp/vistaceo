import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installChunkReloadGuard } from "./lib/chunk-reload-guard";

installChunkReloadGuard();

createRoot(document.getElementById("root")!).render(<App />);

