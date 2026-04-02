import { useContext } from 'react';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import SelectTeam from '../components/run-stand-up/SelectTeam';
import MessageCard from '../components/run-stand-up/MessageCard';
import RetroBoard from '../components/retro/RetroBoard';
import { AuthContext } from '../components/store/AuthProvider';
import '../components/retro/retro.css';

function resolveTeamParticipants(teamIds, allParticipants) {
  if (!teamIds || !Array.isArray(teamIds)) return [];
  return teamIds.map(id => allParticipants[id]).filter(Boolean);
}

export default function RetroPage() {
  const { teams, participants } = useLoaderData();
  const { isParticipant, participantSession } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  const teamNames = Object.keys(teams).length > 0 ? Object.keys(teams) : null;

  // Participant mode: auto-select first team containing this participant
  if (isParticipant && participantSession) {
    const { participantId, ownerUID } = participantSession;
    const participantTeams = teamNames
      ? teamNames.filter(name => Array.isArray(teams[name]) && teams[name].includes(participantId))
      : [];
    const selectedTeam = participantTeams[0] ?? null;
    const resolvedParticipants = selectedTeam
      ? resolveTeamParticipants(teams[selectedTeam], participants)
      : [];

    if (!selectedTeam) {
      return (
        <MessageCard
          title="No Team Found"
          message="You are not assigned to any team. Ask your team lead to add you."
        />
      );
    }

    return (
      <RetroBoard
        teamName={selectedTeam}
        participants={resolvedParticipants}
        isParticipant={true}
        participantId={participantId}
        ownerUID={ownerUID}
      />
    );
  }

  // Team lead mode (unchanged)
  let selectedTeam = searchParams.get('team');
  if (!selectedTeam && teamNames && teamNames.length > 0) {
    selectedTeam = teamNames[0];
  }

  const resolvedParticipants = selectedTeam
    ? resolveTeamParticipants(teams[selectedTeam], participants)
    : [];

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
          message="Select a team to start a retro!"
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
      <RetroBoard teamName={selectedTeam} participants={resolvedParticipants} />
    </>
  );
}
