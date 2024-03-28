import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Main from "./pages/Main/Main.tsx";
import Layout from "./layout/Layout/Layout.tsx";
import Portfolio from "./pages/portfolio/Portfolio.tsx";
import About from "./pages/About/About.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Main />
      },
      {
        path: "/portfolio",
        element: <Portfolio />
      },
      {
        path: "/about",
        element: <About />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
