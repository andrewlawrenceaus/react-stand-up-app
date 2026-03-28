import { useState } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import { Box, Button, Divider, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { lightBlue } from '@mui/material/colors';
import { Link, Link as RouterLink } from 'react-router-dom';
import InitialsAvatar from '../participants/InitialsAvatar';

export default function TeamCard(props) {
  const {
    teamName,
    participants,
    allParticipants,
    addParticipant,
    removeParticipant,
    removeTeam
  } = props;

  const [editMode, setEditMode] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);

  const editButtonHandler = () => {
    setEditMode(!editMode);
  };

  const addParticipantHandler = () => {
    if (selectedParticipantId) {
      addParticipant(teamName, selectedParticipantId);
      setSelectedParticipantId(null);
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

  const availableParticipants = allParticipants
    ? Object.values(allParticipants).filter(p => !participants || !participants.includes(p.id))
    : [];

  const noParticipantsAtAll = !allParticipants || Object.keys(allParticipants).length === 0;

  return (
    <Grid item xs={6} align='center'>
      <Box
        sx={{
          width: '100%',
          maxWidth: 350,
          border: '1px solid',
          borderRadius: '16px',
          borderColor: 'black',
          m: '1rem'
        }}
      >
        <Typography
          sx={{ mt: 1, mb: 2, textAlign: 'center'}}
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
            const p = allParticipants ? allParticipants[participant] : null;
            return (
              <ListItem
                key={participant}
                secondaryAction={
                  editMode && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteParticipantHandler(participant)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
                }
                sx={{ bgcolor: lightBlue }}
              >
                <ListItemAvatar>
                  {p?.photoUrl
                    ? <Avatar src={p.photoUrl} />
                    : <InitialsAvatar name={p?.name || participant} />
                  }
                </ListItemAvatar>
                <ListItemText primary={p?.name || participant} />
              </ListItem>
            );
          })}
        </List>
        <Divider />
        {editMode && (
          <div>
            <div>
              {noParticipantsAtAll ? (
                <Typography sx={{ m: 1 }}>
                  No participants yet — add them on the{' '}
                  <RouterLink to="/participants">Participants page</RouterLink>
                </Typography>
              ) : availableParticipants.length === 0 ? (
                <Typography sx={{ m: 1 }}>
                  All participants are already in this team
                </Typography>
              ) : (
                <Autocomplete
                  options={availableParticipants}
                  getOptionLabel={(option) => option.name}
                  value={availableParticipants.find(p => p.id === selectedParticipantId) || null}
                  onChange={(_, newValue) => setSelectedParticipantId(newValue ? newValue.id : null)}
                  renderInput={(params) => <TextField {...params} label="Add Participant" />}
                  sx={{ m: 1 }}
                />
              )}
            </div>
            <Divider />
            <div>
              <Button
                variant="outlined"
                onClick={addParticipantHandler}
                disabled={!selectedParticipantId}
                sx={{m: 1}}
              >
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
