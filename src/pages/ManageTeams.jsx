import { useLoaderData } from 'react-router-dom';
import ManageTeams from '../components/manage-teams/ManageTeams';
import '../components/manage-teams/manage-teams.css';

function ManageStandUpsPage() {
  const { teams, participants } = useLoaderData();
  return <ManageTeams teams={teams} participants={participants} />;
}

export default ManageStandUpsPage;
