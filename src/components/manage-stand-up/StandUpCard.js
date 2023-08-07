import React from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { lightBlue } from "@mui/material/colors";

export default function StandUpCard(props) {
  return (
    <Grid item xs={6}>
      <Box sx={{ width: "100%", maxWidth: 350, bgcolor: lightBlue }}>
        <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
          {props.standUpName}
        </Typography>
        <List sx={{ bgcolor: lightBlue }}>
          {props.attendees.map((attendee) => {
            return (
              <ListItem
                key={attendee}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() =>
                      props.deleteAttendeeHandler(props.standUpName, attendee)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{ bgcolor: lightBlue }}
              >
                <ListItemText primary={attendee} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Grid>
  );
}
