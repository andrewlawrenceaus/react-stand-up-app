import { useLoaderData } from 'react-router-dom';
import ManageTeams from '../components/manage-teams/ManageTeams';

function ManageStandUpsPage() {
  const teams = useLoaderData();
  console.log(teams);

  return <ManageTeams teams={teams} />;
}

export default ManageStandUpsPage;
