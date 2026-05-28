import { createHashRouter } from "react-router-dom";
import Preload from "./gates/preload";
import { Root } from "./layouts/root";

export const router = createHashRouter([
  {
    path: "/",
    element: <Preload />,
    children: [
      {
        path: "/",
        element: <Root />,
        // children: [{ path: "/", element: <ViewPort /> }],
      },
    ],
  },
]);
