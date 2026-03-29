import { useState } from 'react';
import TeamCard from './TeamCard';
import AddTeam from './AddTeam';
import { writeTeams } from '../../utils/db-utils';
import './manage-teams.css';

export default function ManageTeams(props) {
  const [teams, setTeams] = useState(props.teams);
  const participants = props.participants;

  const removeParticipant = async (team, participant) => {
    const updatedTeams = await updateTeam('remove-participant', teams, team, participant);
    setTeams(updatedTeams);
  };

  const addParticipant = async (team, participant) => {
    const updatedTeams = await updateTeam('add-participant', teams, team, participant);
    setTeams(updatedTeams);
  };

  const addTeam = async (team) => {
    const updatedTeams = await updateTeam('add-team', teams, team);
    setTeams(updatedTeams);
  };

  const removeTeam = async (team) => {
    const updatedTeams = await updateTeam('remove-team', teams, team);
    setTeams(updatedTeams);
  };

  const teamCount = Object.keys(teams || {}).length;

  return (
    <div className="teams-page">
      <div className="teams-page__inner">
        <div className="teams-page__header">
          <h1 className="teams-page__title">Manage Teams</h1>
          <span className="teams-page__count">
            {teamCount} {teamCount === 1 ? 'team' : 'teams'}
          </span>
        </div>

        <div className="teams-grid">
          {teams && Object.keys(teams).map((teamName, i) => (
            <TeamCard
              key={teamName}
              teamName={teamName}
              participants={teams[teamName]}
              allParticipants={participants}
              removeParticipant={removeParticipant}
              addParticipant={addParticipant}
              removeTeam={removeTeam}
              animationDelay={i * 60}
            />
          ))}
          <AddTeam addTeam={addTeam} />
        </div>
      </div>
    </div>
  );
}

export async function updateTeam(action, teams, team, participant) {
  const updatedTeams = { ...teams };

  switch (action) {
    case 'add-participant': {
      if (updatedTeams[team]) {
        updatedTeams[team].push(participant);
      } else {
        updatedTeams[team] = [participant];
      }
      break;
    }
    case 'remove-participant': {
      updatedTeams[team] = updatedTeams[team].filter((e) => e !== participant);
      break;
    }
    case 'add-team': {
      updatedTeams[team] = false;
      break;
    }
    case 'remove-team': {
      delete updatedTeams[team];
      break;
    }
    default: {
      console.warn('Unsupported action passed to updateTeam function');
      return;
    }
  }
  writeTeams(updatedTeams);
  return updatedTeams;
}
