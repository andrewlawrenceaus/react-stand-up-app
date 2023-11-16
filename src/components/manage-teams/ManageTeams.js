import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import TeamCard from './TeamCard';
import Grid from '@mui/material/Grid';

export default function ManageTeams(props) {

  const [teams, setTeams] = useState(props.teams);


  const deleteParticipant = (team, participant) => {
    const updatedTeams = new Map(teams)
    const updatedParticipants = teams.get(team).filter((e) => e !== participant);
    updatedTeams.set(team, updatedParticipants);
    setTeams(updatedTeams);
  };

  const addParticipant = (team, participant) => {
    const updatedTeams = new Map(teams);
    console.log(updatedTeams)
    updatedTeams.get(team).push(participant);
    setTeams(updatedTeams);
  };

  const addTeam = (team) => {
    const newTeam = {[team]: []}
    const updatedTeams = new Map(teams)
    updatedTeams.push(newTeam)
    setTeams(updatedTeams);
  }

  const removeTeam = (team) => {
    const updatedTeams = new Map(teams)
    updatedTeams.delete(team);
    setTeams(updatedTeams);
  }

  const teamCards = generateTeamCards(
    teams,
    deleteParticipant,
    addParticipant,
    removeTeam
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

function generateTeamCards(
  teams,
  removeParticipant,
  addParticipant,
  removeTeam
) {
  let teamCards = [];
  if (teams) {
    teams.forEach((participants, teamName) => {
      teamCards.push(
        <TeamCard
          key={teamName}
          teamName={teamName}
          participants={participants}
          removeParticipant={removeParticipant}
          addParticipant={addParticipant}
          removeTeam={removeTeam}
        ></TeamCard>
      );
    });
  }

  return teamCards;
}
