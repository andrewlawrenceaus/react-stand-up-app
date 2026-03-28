import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/header/Header';
import { getTeamsAndParticipants, migrateParticipantsIfNeeded } from '../utils/db-utils';
import { useContext } from 'react';
import { AuthContext } from '../components/store/AuthProvider';

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
  let { teams, participants } = await getTeamsAndParticipants();
  await migrateParticipantsIfNeeded(teams);
  // After migration, re-fetch to get updated data if migration ran
  ({ teams, participants } = await getTeamsAndParticipants());
  return { teams, participants };
}
