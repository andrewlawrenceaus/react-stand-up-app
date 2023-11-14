import { React, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import AttendeeCard from './AttendeeCard';
import StartStandUpCard from './StartStandUpCard';
import StandUpCompleteCard from './StandUpCompleteCard';
import { Grid } from '@mui/material';

export default function RunStandUp(props) {
  const participants = props.participants;
  const team = props.team;
  const [standUpParticipants, setStandUpParticipants] = useState(
    initialiseParticipants(participants)
  );
  const [standUpStatus, setStandUpStatus] = useState('Ready');

  const passDuckHandler = () => {
    let updatedParticipants = standUpParticipants.slice();
    updatedParticipants.splice(0, 1);
    if (updatedParticipants.length > 0) {
      setStandUpParticipants(updatedParticipants);
    } else {
      setStandUpParticipants(initialiseParticipants(participants));
      setStandUpStatus('Complete');
    }
  };
  const lateParticipantHandler = () => {
    let updatedParticipants = standUpParticipants.slice();
    let lateParticipant = updatedParticipants.splice(0, 1);
    updatedParticipants.push(...lateParticipant);
    setStandUpParticipants(updatedParticipants);
  };

  const startStandUpHandler = () => {
    setStandUpStatus('In Progress');
  };

  const resetStandUpHandler = () => {
    setStandUpStatus('Ready');
  };

  useEffect(() => {
    setStandUpParticipants(initialiseParticipants(participants));
    setStandUpStatus('Ready');
  }, [participants]);

  return (
    <Grid container>
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
          Run {team} Stand Up
        </Typography>
      </Grid>
      <Grid item xs={4} />
      <Grid item xs={4}>
        {(() => {
          switch (standUpStatus) {
            case 'Ready':
              return (
                <StartStandUpCard
                  startStandUpHandler={startStandUpHandler}
                ></StartStandUpCard>
              );
            case 'In Progress':
              return (
                <AttendeeCard
                  attendee={standUpParticipants[0]}
                  passDuckHandler={passDuckHandler}
                  lateAttendeeHandler={lateParticipantHandler}
                ></AttendeeCard>
              );
            case 'Complete':
              return (
                <StandUpCompleteCard
                  resetStandUpHandler={resetStandUpHandler}
                ></StandUpCompleteCard>
              );
            default:
              return null;
          }
        })()}
      </Grid>
      <Grid item xs={4} />
    </Grid>
  );
}

const initialiseParticipants = (participants) => {
  let standUpParticipants = [];
  let participantsToAdd = [...participants];
  while (participantsToAdd.length > 0) {
    let randomParticipant = participantsToAdd.splice(
      Math.floor(Math.random() * participantsToAdd.length),
      1
    );
    standUpParticipants.push(...randomParticipant);
  }
  return standUpParticipants;
};
