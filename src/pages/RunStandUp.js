import { useRouteLoaderData } from 'react-router-dom';
import RunStandUp from '../components/run-stand-up/RunStandUp';

function RunStandUpPage() {
  const standUps = useRouteLoaderData('root');
  console.log(standUps);
  //   const activeStandUp = useSearchParams();
  const firstStandUp = standUps.entries().next().value;

  return (
    <RunStandUp activeStandUp={firstStandUp[0]} standUp={firstStandUp[1]} />
  );
}

export default RunStandUpPage;
