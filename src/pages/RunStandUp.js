import { useLoaderData, useSearchParams } from 'react-router-dom';
import RunStandUp from '../components/run-stand-up/RunStandUp';

function RunStandUpPage() {
  const standUps = useLoaderData();
  const [searchParams] = useSearchParams();
  const selectedTeam = searchParams.get('team');
  console.log(selectedTeam);
  let activeStandUp = setActiveStandUp(selectedTeam, standUps);

  /*TODO: Add component for changing the active stand up, 
  and use the useSearchParams hook to modify the query string*/

  return (
    <RunStandUp activeStandUp={activeStandUp[0]} standUp={activeStandUp[1]} />
  );
}

function setActiveStandUp(team, standUps){
  let activeStandUp = []
  console.log(standUps)
  if (team && standUps.get(team)){
    activeStandUp = [team, standUps.get(team)];
  } else {
    activeStandUp = standUps.entries().next().value;
  }
  return activeStandUp;
}

export default RunStandUpPage;


