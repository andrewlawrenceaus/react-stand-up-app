import { useRouteError } from 'react-router-dom';
import MessageCard from '../components/run-stand-up/MessageCard';
import Header from '../components/header/Header';

export default function ErrorPage() {
  const error = useRouteError();

  console.log(error);

  let title = 'An error occurred!';
  let message = 'Something went wrong!';

  if (error.status === 500) {
    message = error.data.message;
  }

  if (error.status === 404) {
    title = 'Not found!';
    message = 'Could not find resource or page.';
  }

  return (
    <>
      <Header />
      <MessageCard title={title} message={message} />
    </>
  );
}
