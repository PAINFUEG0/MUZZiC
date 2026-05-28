import { Root } from "./layouts/Root";
import { Preload } from "./gates/Preload";
import { createHashRouter } from "react-router-dom";

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
