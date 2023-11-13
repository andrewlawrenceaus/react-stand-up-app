import { React } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout, { loadStandUps } from "./pages/Root";
import ManageStandUpsPage from "./pages/ManageStandUps";
import RunStandUpPage from "./pages/RunStandUp";

const router = createBrowserRouter([
  {
    path: '/',
    id: 'root',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <RunStandUpPage />,
        loader: loadStandUps
      },
      {
        path: 'manage-stand-ups',
        element: <ManageStandUpsPage />,
        loader: loadStandUps
      }
    ]
  }
])

export default function App(){
  return <RouterProvider router={router} />
}