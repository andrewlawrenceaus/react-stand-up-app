import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { Delete as DeleteIcon } from '@mui/icons-material';
import InitialsAvatar from './InitialsAvatar';

export default function ParticipantListItem({ participant, onDelete }) {
  return (
    <ListItem
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => onDelete(participant.id)}
        >
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemAvatar>
        {participant.photoUrl ? (
          <Avatar src={participant.photoUrl} alt={participant.name} />
        ) : (
          <InitialsAvatar name={participant.name} />
        )}
      </ListItemAvatar>
      <ListItemText primary={participant.name} />
    </ListItem>
  );
}
