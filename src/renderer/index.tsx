import "./index.css";
import { createRoot } from "react-dom/client";

function Hello() {
  //@ts-ignore
  return <div>{window.api.ping()}</div>;
}

createRoot(document.getElementById("root")!).render(<Hello />);
