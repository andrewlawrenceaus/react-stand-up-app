import { useLoaderData } from 'react-router-dom';
import ManageTeams from '../components/manage-teams/ManageTeams';

function ManageStandUpsPage() {
  const teams = useLoaderData();

  return <ManageTeams teams={teams} />;
}

export default ManageStandUpsPage;
