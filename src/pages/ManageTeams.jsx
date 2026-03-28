import { useLoaderData } from 'react-router-dom';
import ManageTeams from '../components/manage-teams/ManageTeams';

function ManageStandUpsPage() {
  const { teams, participants } = useLoaderData();
  return <ManageTeams teams={teams} participants={participants} />;
}

export default ManageStandUpsPage;
