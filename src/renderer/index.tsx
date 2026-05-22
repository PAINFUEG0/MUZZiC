import "./index.css";
import { createRoot } from "react-dom/client";

function Hello() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-red-500">
      {
        //@ts-ignore
        window.api.list().map((e) => (
          <div>{e}</div>
        ))
      }
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Hello />);
