import "./index.css";
import { createRoot } from "react-dom/client";

function Hello() {
  return <div>Hello </div>;
}

createRoot(document.getElementById("root")!).render(<Hello />);
