import { useState } from 'react';
import Typography from '@mui/material/Typography';
import TeamCard from './TeamCard';
import Grid from '@mui/material/Grid';
import AddTeam from './AddTeam';
import { writeTeams } from '../../utils/db-utils';

export default function ManageTeams(props) {
  const [teams, setTeams] = useState(props.teams);

  const removeParticipant = async (team, participant) => {
    const updatedTeams = await updateTeam(
      'remove-participant',
      teams,
      team,
      participant
    );
    setTeams(updatedTeams);
  };

  const addParticipant = async (team, participant) => {
    const updatedTeams = await updateTeam(
      'add-participant',
      teams,
      team,
      participant
    );
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

  const teamCards = generateTeamCards(
    teams,
    removeParticipant,
    addParticipant,
    removeTeam
  );
  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        display="flex"
      >
        <Typography
          align="center"
          variant="h3"
          component="div"
          sx={{ flexGrow: 1, mt: '1rem' }}
        >
          Manage Teams
        </Typography>
      </Grid>
      {teamCards}
      <Grid item xs={12} display="flex">
        <AddTeam addTeam={addTeam} />
      </Grid>
    </Grid>
  );
}

function generateTeamCards(
  teams,
  removeParticipant,
  addParticipant,
  removeTeam
) {
  let teamCards = [];
  if (teams) {
    for (const teamName of Object.keys(teams)) {
      teamCards.push(
        <TeamCard
          key={teamName}
          teamName={teamName}
          participants={teams[teamName]}
          removeParticipant={removeParticipant}
          addParticipant={addParticipant}
          removeTeam={removeTeam}
        ></TeamCard>
      );
    }
  }
  return teamCards;
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
