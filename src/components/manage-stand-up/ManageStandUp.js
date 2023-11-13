import React from "react";
import Typography from "@mui/material/Typography";
import StandUpCard from "./StandUpCard";
import Grid from "@mui/material/Grid";

export default function ManageStandUp(props) {
  const deleteAttendeeHandler = (standUp, attendee) => {
    let standUps = new Map(props.standUps)
    // let updatedStandUp = standUps.get(standUp);
    let updatedStandUp = standUps.get(standUp).filter(e => e !== attendee);
    standUps.set(standUp, updatedStandUp);
    props.setStandUps(standUps);
  };

  const standUpCards = generateStandUpCards(props.standUps, deleteAttendeeHandler);
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
          Manage Stand Ups
        </Typography>
      </Grid>
      {standUpCards}
    </Grid>
  );
}

function generateStandUpCards(standUps, deleteAttendeeHandler) {
  let standUpCards = [];
  if (standUps) {
    standUps.forEach((attendees, standUpName) => {
      standUpCards.push(
        <StandUpCard
          key={standUpName}
          standUpName={standUpName}
          attendees={attendees}
          deleteAttendeeHandler={deleteAttendeeHandler}
        ></StandUpCard>
      );
    });
  }

  return standUpCards;
}
