import { useLoaderData, useSearchParams } from 'react-router-dom';
import RunStandUp from '../components/run-stand-up/RunStandUp';
import SelectStandUp from '../components/run-stand-up/SelectStandUp';

function RunStandUpPage() {
  const standUps = useLoaderData();
  const teams = Array.from( standUps.keys() );

  const [searchParams] = useSearchParams();
  const selectedTeam = searchParams.get('team');
  console.log(selectedTeam);
  let activeStandUp = setActiveStandUp(selectedTeam, standUps);
  console.log(activeStandUp);

  /*TODO: Add component for changing the active stand up, 
  and use the useSearchParams hook to modify the query string*/

  return (
    <>
      <SelectStandUp teams={teams} />
      <RunStandUp team={activeStandUp[0]} participants={activeStandUp[1]} />
    </>
  );
}

function setActiveStandUp(team, standUps) {
  let activeStandUp = [];
  console.log(standUps);
  if (team && standUps.get(team)) {
    activeStandUp = [team, standUps.get(team)];
  } else {
    activeStandUp = standUps.entries().next().value;
  }
  return activeStandUp;
}

export default RunStandUpPage;
