import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/header/Header';
import { getTeams } from '../utils/db-utils';
import { useContext } from 'react';
import { AuthContext } from '../components/store/AuthProvider';
import { auth } from '../utils/firebase';

function RootLayout() {
  const authCtx = useContext(AuthContext);
  const location = useLocation();
  const authPath = "/auth";
  const loginSearchParam = "?mode=login";

  const authRedirect = () => {
    if (authCtx.user || location.pathname === authPath) {
      return <Outlet />
    } else {
      return <Navigate to={`${authPath}${loginSearchParam}`} />
    }
  }

  return (
    <>
      <Header />
      <main>
        {authRedirect()}
      </main>
    </>
  );
}

export default RootLayout;

export async function loadStandUps() {
  return await getTeams();
}
