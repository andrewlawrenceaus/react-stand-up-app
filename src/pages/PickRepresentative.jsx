import { useState } from 'react';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import SelectTeam from '../components/run-stand-up/SelectTeam';
import MessageCard from '../components/run-stand-up/MessageCard';
import SpinningWheel from '../components/pick-representative/SpinningWheel';
import WinnerDisplay from '../components/pick-representative/WinnerDisplay';
import { resolveTeamParticipants } from '../utils/team-utils';
import '../components/pick-representative/pick-representative.css';

export default function PickRepresentativePage() {
  const { teams, participants } = useLoaderData();
  const teamNames = Object.keys(teams).length > 0 ? Object.keys(teams) : null;
  const [searchParams] = useSearchParams();
  const [winner, setWinner] = useState(null);

  let selectedTeam = searchParams.get('team');
  if (!selectedTeam && teamNames && teamNames.length > 0) {
    selectedTeam = teamNames[0];
  }

  const resolvedParticipants = selectedTeam
    ? resolveTeamParticipants(teams[selectedTeam], participants)
    : [];

  const handleSpinComplete = (selected) => {
    setWinner(selected);
  };

  const handleReset = () => {
    setWinner(null);
  };

  if (!teamNames) {
    return (
      <MessageCard
        title="No Teams Created!"
        message="Add new teams on the 'manage teams' page"
      />
    );
  }

  if (!selectedTeam) {
    return (
      <>
        <SelectTeam teams={teamNames} />
        <MessageCard
          title="Select Team"
          message="Select a team to pick a representative!"
        />
      </>
    );
  }

  if (resolvedParticipants.length === 0) {
    return (
      <>
        <SelectTeam teams={teamNames} />
        <MessageCard
          title="No Participants!"
          message={`The ${selectedTeam} team does not have any participants! Add them on the 'manage teams' page`}
        />
      </>
    );
  }

  return (
    <>
      <SelectTeam teams={teamNames} />
      <div className="pick-rep__page">
        <div className="pick-rep__inner">
          <div className="standup-header">
            <h2 className="standup-header__title">Pick a Rep</h2>
          </div>
          {winner ? (
            <WinnerDisplay winner={winner} onReset={handleReset} />
          ) : (
            <SpinningWheel
              participants={resolvedParticipants}
              onSpinComplete={handleSpinComplete}
            />
          )}
        </div>
      </div>
    </>
  );
}
