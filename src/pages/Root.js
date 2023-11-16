import { Outlet, json } from 'react-router-dom';
import Header from '../components/header/Header';

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
  const response = await fetch('http://localhost:3000/standUpData.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    return json({ message: 'Could not fetch stand ups.' }, { status: 500 });
  } else {
    const standUpJson = await response.json();
    const standUpMap = new Map(Object.entries(standUpJson));
    return standUpMap;
  }
}