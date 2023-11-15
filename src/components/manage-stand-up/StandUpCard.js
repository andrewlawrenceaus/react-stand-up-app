import React from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import { Box, Button, Divider, TextField } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { lightBlue } from "@mui/material/colors";

export default function StandUpCard(props) {
  return (
    <Grid item xs={6}>
      <Box sx={{ width: "100%", maxWidth: 350, border: '1px dashed', bgcolor: 'lightgrey', borderRadius: '16px', borderColor: 'black' }}>
        <Typography sx={{ mt: 1, mb: 2, textAlign: 'center' }} variant="h6" component="div">
          {props.standUpName}
        </Typography>
        <div>
          <Button>Start Stand-Up</Button>
          <Button sx={{ float: 'inline-end' }}><EditIcon /></Button>
        </div>
        <Divider />
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
        <Divider />
        <div>
          <TextField id='name' label='Name' variant="outlined" color="primary" focused></TextField>
        </div>
        <Divider />
        <div>
          <Button variant="outlined">Add Attendee</Button>
          <Button variant="outlined" color='error' sx={{ float: 'inline-end' }}>Delete Team</Button>
        </div>
      </Box>
    </Grid>
  );
}
