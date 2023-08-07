import { React, useState } from "react";
import Typography from "@mui/material/Typography";
import AttendeeCard from "./AttendeeCard";
import StartStandUpCard from "./StartStandUpCard";
import StandUpCompleteCard from "./StandUpCompleteCard";
import { Grid } from "@mui/material";

export default function RunStandUp(props) {
  const [standUpAttendees, setStandUpAttendees] = useState(
    initialiseStandUpAttendees(props.standUp)
  );
  const [standUpStatus, setStandUpStatus] = useState("Ready");

  const passDuckHandler = () => {
    let updatedAttendees = standUpAttendees.slice();
    updatedAttendees.splice(0, 1);
    if (updatedAttendees.length > 0) {
      setStandUpAttendees(updatedAttendees);
    } else {
      setStandUpAttendees(initialiseStandUpAttendees(props.standUp));
      setStandUpStatus("Complete");
    }
  };
  const lateAttendeeHandler = () => {
    let updatedAttendees = standUpAttendees.slice();
    let lateAttendee = updatedAttendees.splice(0, 1);
    updatedAttendees.push(...lateAttendee);
    setStandUpAttendees(updatedAttendees);
  };

  const startStandUpHandler = () => {
    setStandUpStatus("In Progress");
  };

  const resetStandUpHandler = () => {
    setStandUpStatus("Ready");
  };

  return (
    <Grid container>
      <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
        <Typography align="center" variant="h3" component="div" sx={{ flexGrow: 1 }}>
          Run {props.activeStandUp} Stand Up
        </Typography>
      </Grid>
    <Grid item xs={4} />
      <Grid item xs={4}>
        {(() => {
          switch (standUpStatus) {
            case "Ready":
              return (
                <StartStandUpCard
                  startStandUpHandler={startStandUpHandler}
                ></StartStandUpCard>
              );
            case "In Progress":
              return (
                <AttendeeCard
                  attendee={standUpAttendees[0]}
                  passDuckHandler={passDuckHandler}
                  lateAttendeeHandler={lateAttendeeHandler}
                ></AttendeeCard>
              );
            case "Complete":
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

const initialiseStandUpAttendees = (attendees) => {
  let standUpSessionAttendees = [];
  let attendeesToAdd = [...attendees];
  while (attendeesToAdd.length > 0) {
    let randomAttendee = attendeesToAdd.splice(
      Math.floor(Math.random() * attendeesToAdd.length),
      1
    );
    standUpSessionAttendees.push(...randomAttendee);
  }
  return standUpSessionAttendees;
};
