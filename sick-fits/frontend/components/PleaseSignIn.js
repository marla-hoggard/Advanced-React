import { useQuery } from '@apollo/react-hooks';

import { CURRENT_USER_QUERY } from './User';
import Signin from './Signin';

const PleaseSignIn = props => {
  const { data, loading } = useQuery(CURRENT_USER_QUERY);

  if (loading) return <p>Loading...</p>;

  if (!data || !data.me) {
    return (
      <div>
        <p>You must be signed in to continue.</p>
        <Signin />
      </div>
    );
  }

  return props.children;
};

export default PleaseSignIn;