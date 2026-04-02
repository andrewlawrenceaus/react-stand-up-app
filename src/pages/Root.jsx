import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/header/Header';
import { getTeamsAndParticipants, migrateParticipantsIfNeeded } from '../utils/db-utils';
import { readParticipantSession } from '../utils/db-utils-tokens';
import { useContext } from 'react';
import { AuthContext } from '../components/store/AuthProvider';
import { auth } from '../utils/firebase';

const PARTICIPANT_BLOCKED_PATHS = ['/', '/manage-teams', '/participants'];

function RootLayout() {
  const authCtx = useContext(AuthContext);
  const location = useLocation();
  const authPath = "/auth";
  const loginSearchParam = "?mode=login";

  // Wait for session to resolve before making redirect decisions
  if (authCtx.sessionLoading) {
    return null;
  }

  const authRedirect = () => {
    // Participants can only access /retro
    if (authCtx.isParticipant) {
      if (PARTICIPANT_BLOCKED_PATHS.includes(location.pathname)) {
        return <Navigate to="/retro" replace />;
      }
      return <Outlet />;
    }

    if (authCtx.user || location.pathname === authPath) {
      return <Outlet />;
    } else {
      return <Navigate to={`${authPath}${loginSearchParam}`} />;
    }
  };

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
  await auth.authStateReady();
  const user = auth.currentUser;

  if (!user) return { teams: {}, participants: {} };

  if (user.isAnonymous) {
    const session = await readParticipantSession(user.uid);
    if (!session) return { teams: {}, participants: {} };
    const { teams, participants } = await getTeamsAndParticipants(session.ownerUID);
    return { teams, participants };
  }

  let { teams, participants } = await getTeamsAndParticipants();
  const migrated = await migrateParticipantsIfNeeded(teams);
  if (migrated) ({ teams, participants } = await getTeamsAndParticipants());
  return { teams, participants };
}
