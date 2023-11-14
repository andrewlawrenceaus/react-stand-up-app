import { React } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout, { loadStandUps } from "./pages/Root";
import ManageStandUpsPage from "./pages/ManageStandUps";
import RunStandUpPage from "./pages/RunStandUp";

/*TODO: 
1. Add components for create new stand up, attending attendees, deleting stand up
2. Add link to stand-up card to start the stand up
3. Add route action to add and remove stand-ups and attendees
4. Add database for stand-ups
5. Add authentication
6. Add error page
7. Add fetching state to run stand-up page
8. Add better styling for loading and no team/participants messages
9. Fix styling
10. Add unit tests
11. Add storage for user images
*/
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