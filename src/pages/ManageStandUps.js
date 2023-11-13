import { useLoaderData } from 'react-router-dom';
import ManageStandUp from '../components/manage-stand-up/ManageStandUp';

function ManageStandUpsPage() {
  const standUps = useLoaderData();

  return <ManageStandUp standUps={standUps} />;
}

export default ManageStandUpsPage;
