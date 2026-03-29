import { useLoaderData } from 'react-router-dom';
import Participants from '../components/participants/Participants';

export default function ParticipantsPage() {
  const { participants } = useLoaderData();
  return <Participants initialParticipants={participants} />;
}
