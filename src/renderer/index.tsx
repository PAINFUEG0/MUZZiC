import "./index.css";
import { router } from "./router";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
