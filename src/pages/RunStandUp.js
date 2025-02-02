import { useLoaderData, useSearchParams } from 'react-router-dom';
import RunStandUp from '../components/run-stand-up/RunStandUp';
import SelectTeam from '../components/run-stand-up/SelectTeam';
import MessageCard from '../components/run-stand-up/MessageCard';

function RunStandUpPage() {
  const teams = useLoaderData();
  const teamNames = (Object.keys(teams).length > 0) ? Object.keys(teams) : null;
  const [searchParams] = useSearchParams();

  const generateRunStandUpComponent = () => {
    let selectedTeam = searchParams.get('team');
    if (!selectedTeam && teamNames.length > 0){
      selectedTeam = teamNames[0];
    }

    //If no teams have been created, prompt user to add one
    if (!teamNames) {
      return (
        <MessageCard
          title="No Teams Created!"
          message="Add new teams on the 'manage teams' page"
        />
      );
    }

    //Prompt user to select team if team search parameter not set
    if (!selectedTeam) {
      return (
        <MessageCard
          title="Select Team"
          message="Select a team to start a stand-up!"
        />
      );
    }

    //If the selected team has no participants, prompt user to add them
    if (!teams[selectedTeam] || teams[selectedTeam].length === 0) {
      return (
        <MessageCard
          title="No Participants!"
          message={`The ${selectedTeam} team does not have any participants! Add them on
        the 'manage stand-ups' page`}
        />
      );
    }

    return (
      <RunStandUp team={selectedTeam} participants={teams[selectedTeam]} />
    );
  };

  return (
    <>
      {teamNames && <SelectTeam teams={teamNames} />}
      {generateRunStandUpComponent()}
    </>
  );
}

export default RunStandUpPage;
