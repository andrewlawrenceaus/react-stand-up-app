import { useState } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import { Box, Button, Divider, TextField } from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { lightBlue } from '@mui/material/colors';
import { Link } from 'react-router-dom';
import useInput from '../../hooks/use-input';

export default function TeamCard(props) {
  const {
    teamName,
    participants,
    addParticipant,
    removeParticipant,
    removeTeam
  } = props;

  const [editMode, setEditMode] = useState(false);

  const {
    value: enteredName,
    isValid: enteredNameIsValid,
    hasError: nameInputHasError,
    valueChangeHandler: nameChangeHandler,
    inputBlurHandler: nameInputBlurHandler,
    reset: resetNameInput,
  } = useInput((value) => value.trim() !== '');

  const editButtonHandler = () => {
    setEditMode(!editMode);
  };

  const addParticipantHandler = () => {
    if (enteredNameIsValid && !nameInputHasError) {
      addParticipant(teamName, enteredName);
      resetNameInput();
    }
  };

  const deleteParticipantHandler = (participant) => {
    removeParticipant(
      teamName,
      participant
    );
  }

  const deleteTeamHandler = () => {
    removeTeam(teamName)
  }

  return (
    <Grid item xs={6}>
      <Box
        sx={{
          width: '100%',
          maxWidth: 350,
          border: '1px dashed',
          bgcolor: 'lightgrey',
          borderRadius: '16px',
          borderColor: 'black',
        }}
      >
        <Typography
          sx={{ mt: 1, mb: 2, textAlign: 'center' }}
          variant="h6"
          component="div"
        >
          {teamName}
        </Typography>
        <div>
          <Button component={Link} to={`/?team=${teamName}`}>
            Start Stand-Up
          </Button>
          <Button sx={{ float: 'inline-end' }} onClick={editButtonHandler}>
            {editMode ? <CloseIcon /> : <EditIcon />}
          </Button>
        </div>
        <Divider />
        <List sx={{ bgcolor: lightBlue }}>
          {participants && participants.map((participant) => {
            return (
              <ListItem
                key={participant}
                secondaryAction={
                  editMode && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteParticipantHandler(participant)
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
                }
                sx={{ bgcolor: lightBlue }}
              >
                <ListItemText primary={participant} />
              </ListItem>
            );
          })}
        </List>
        <Divider />
        {editMode && (
          <div>
            <div>
              <TextField
                id="name"
                label="Name"
                variant="outlined"
                color="primary"
                focused
                onChange={nameChangeHandler}
                value={enteredName}
                onBlur={nameInputBlurHandler}
                sx={{m: 1}}
              ></TextField>
            </div>
            <Divider />
            <div>
              <Button variant="outlined" onClick={addParticipantHandler} sx={{m: 1}}>
                Add Participant
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{ float: 'inline-end', m:1}}
                onClick={deleteTeamHandler}
              >
                Delete Team
              </Button>
            </div>
          </div>
        )}
      </Box>
    </Grid>
  );
}
