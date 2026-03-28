import { useState } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import AddParticipant from './AddParticipant';
import ParticipantListItem from './ParticipantListItem';
import { writeParticipants } from '../../utils/db-utils';

export default function Participants({ initialParticipants }) {
  const [participants, setParticipants] = useState(initialParticipants || {});

  const handleAdd = (participant) => {
    const updatedParticipants = { ...participants, [participant.id]: participant };
    setParticipants(updatedParticipants);
    writeParticipants(updatedParticipants);
  };

  const handleDelete = (participantId) => {
    const updatedParticipants = { ...participants };
    delete updatedParticipants[participantId];
    setParticipants(updatedParticipants);
    writeParticipants(updatedParticipants);
  };

  const participantList = Object.values(participants);

  return (
    <div>
      <Typography
        align="center"
        variant="h5"
        component="div"
        sx={{ mt: '1rem', mb: '1rem' }}
      >
        Participants
      </Typography>
      <AddParticipant onAdd={handleAdd} />
      {participantList.length === 0 ? (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          No participants yet. Add one above!
        </Typography>
      ) : (
        <List>
          {participantList.map((participant) => (
            <ParticipantListItem
              key={participant.id}
              participant={participant}
              onDelete={handleDelete}
            />
          ))}
        </List>
      )}
    </div>
  );
}
