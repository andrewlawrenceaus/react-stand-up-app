import React from 'react';
import Typography from '@mui/material/Typography';
import TeamCard from './TeamCard';
import Grid from '@mui/material/Grid';

export default function ManageTeams(props) {
  const deleteParticipantHandler = (team, attendee) => {
    let teams = new Map(props.teams);
    let updatedTeam = teams.get(team).filter((e) => e !== attendee);
    teams.set(team, updatedTeam);
    props.setTeams(teams);
  };

  const teamCards = generateTeamCards(
    props.teams,
    deleteParticipantHandler
  );
  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography
          align="center"
          variant="h3"
          component="div"
          sx={{ flexGrow: 1 }}
        >
          Manage Teams
        </Typography>
      </Grid>
      {teamCards}
    </Grid>
  );
}

function generateTeamCards(teams, deleteParticipantHandler) {
  let teamCards = [];
  if (teams) {
    teams.forEach((participants, teamName) => {
      teamCards.push(
        <TeamCard
          key={teamName}
          teamName={teamName}
          participants={participants}
          deleteParticipantHandler={deleteParticipantHandler}
        ></TeamCard>
      );
    });
  }

  return teamCards;
}
