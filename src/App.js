import { React } from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout, { loadStandUps } from './pages/Root';
import ManageStandUpsPage from './pages/ManageTeams';
import RunStandUpPage from './pages/RunStandUp';
import ErrorPage from './pages/Error';
import AuthenticationPage, {
  action as authAction,
} from './pages/Authentication';
import { AuthProvider } from './components/store/AuthProvider';

/*TODO: 
1. Add components for create new stand up, attending attendees, deleting stand up - Done
2. Add link to stand-up card to start the stand up - Done
3. Add route action to add and remove stand-ups and attendees - Done
4. Add database for stand-ups - Done
5. Add authentication
6. Add error page - Done
7. Improve handling of loading default stand-up - Done
8. Add better styling for loading and no team/participants messages - Done
9. Fix general styling
10. Add unit tests
11. Add dev and production configs
12. Update teams state to subscribe for DB updates
*/
const router = createBrowserRouter([
  {
    path: '/',
    id: 'root',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <RunStandUpPage />,
        loader: loadStandUps,
      },
      {
        path: 'manage-teams',
        element: <ManageStandUpsPage />,
        loader: loadStandUps,
      },
      {
        path: 'auth',
        element: <AuthenticationPage />,
        action: authAction,
      },
    ],
  },
]);

export default function App() {
  return (
  <AuthProvider>
      <RouterProvider router={router} />
  </AuthProvider>
  )
}
