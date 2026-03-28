import { useLoaderData } from 'react-router-dom';
import Container from '@mui/material/Container';
import Participants from '../components/participants/Participants';

function ParticipantsPage() {
  const { participants } = useLoaderData();
  return (
    <Container>
      <Participants initialParticipants={participants} />
    </Container>
  );
}

export default ParticipantsPage;
