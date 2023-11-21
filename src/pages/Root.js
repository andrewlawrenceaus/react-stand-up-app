import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import { getTeams } from '../utils/db-utils';

function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default RootLayout;

export async function loadStandUps() {
  return await getTeams();
}
