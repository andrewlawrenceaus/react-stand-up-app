import { useEffect } from 'react';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import RunStandUp from '../components/run-stand-up/RunStandUp';
import SelectTeam from '../components/run-stand-up/SelectTeam';

function RunStandUpPage() {
  const teams = useLoaderData();
  const teamNames = Object.keys(teams);
  const defaultTeam = teamNames[0];
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('team') === null && defaultTeam) {
      setSearchParams({ team: defaultTeam });
    }
  }, [searchParams, setSearchParams, defaultTeam]);

  const generateRunStandUpComponent = () => {
    const selectedTeam = searchParams.get('team');

    //If no teams have been created, prompt user to add one
    if (teamNames && teamNames.length === 0) {
      return (
        <>
          <h1>No Teams Created</h1>
          <p>Add new teams on the 'manage teams' page</p>
        </>
      );
    }

    //If the selected team has no participants, prompt user to add them
    if (!selectedTeam || selectedTeam.length === 0) {
      return (
        <>
          <h1>No Participants</h1>
          <p>
            The {selectedTeam} team does not have any participants! Add them on
            the 'manage stand-ups' page
          </p>
        </>
      );
    }

    return (
      <RunStandUp
        team={selectedTeam}
        participants={teams[selectedTeam]}
      />
    );
  };

  return (
    <>
      <SelectTeam teams={teamNames} />
      {generateRunStandUpComponent()}
    </>
  );
}

export default RunStandUpPage;
