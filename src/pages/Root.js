import { Outlet, json } from 'react-router-dom';
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

export default RootLayout

export async function loadStandUps() {
  const response = await getTeams();
  if (!response.ok) {
    return json({ message: 'Could not fetch stand ups.' }, { status: 500 });
  } else {
    return await response.json();
  }
}