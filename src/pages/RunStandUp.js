import { useEffect } from 'react';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import RunStandUp from '../components/run-stand-up/RunStandUp';
import SelectStandUp from '../components/run-stand-up/SelectStandUp';

function RunStandUpPage() {
  const standUps = useLoaderData();
  const teams = Array.from(standUps.keys());
  const defaultTeam = teams[0];
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('team') === null && defaultTeam) {
      setSearchParams({ team: defaultTeam });
    }
  }, [searchParams, setSearchParams, defaultTeam]);

  const generateRunStandUpComponent = () => {
    const selectedTeam = searchParams.get('team');

    //If no stand-ups have been created, prompt user to add one
    if (teams && teams.length === 0) {
      return (
        <>
          <h1>No Stand Ups Created</h1>
          <p>Add new stand ups on the 'manage stand-ups' page</p>
        </>
      );
    }

    //If the selected stand up has no participants, prompt user to add them
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
        participants={standUps.get(selectedTeam)}
      />
    );
  };

  return (
    <>
      <SelectStandUp teams={teams} />
      {generateRunStandUpComponent()}
    </>
  );
}

export default RunStandUpPage;
