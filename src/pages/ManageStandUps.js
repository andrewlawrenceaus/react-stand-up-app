import { useRouteLoaderData } from 'react-router-dom';
import ManageStandUp from '../components/manage-stand-up/ManageStandUp';

function ManageStandUpsPage() {
  const standUps = useRouteLoaderData('root');

  return <ManageStandUp standUps={standUps} />;
}

export default ManageStandUpsPage;
