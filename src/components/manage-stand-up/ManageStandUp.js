import React from "react";
import Typography from "@mui/material/Typography";
import StandUpCard from "./StandUpCard";
import Grid from "@mui/material/Grid";

export default function ManageStandUp(props) {
  console.log(props.standUps);
  const standUpCards = generateStandUpCards(props.standUps);
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

function generateStandUpCards(standUps) {
  let standUpCards = [];
  if (standUps) {
    standUps.forEach((attendees, standUpName) => {
      standUpCards.push(
        <StandUpCard
          key={standUpName}
          standUpName={standUpName}
          attendees={attendees}
        ></StandUpCard>
      );
    });
  }

  return standUpCards;
}
