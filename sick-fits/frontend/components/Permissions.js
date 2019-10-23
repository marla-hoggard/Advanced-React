import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import Error from './ErrorMessage';
import UserPermissions from './UserPermissions';
import Table from './styles/Table';
import { possiblePermissions } from '../lib/constants';

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => {
  return (
    <Query
      query={ALL_USERS_QUERY}
    >
      {({ data, error, loading }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <Error error={error} />;

        return (
          <>
            <h2>Manage Permissions</h2>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {possiblePermissions.map(perm => <th key={perm}>{perm}</th>)}
                  <th>Save Changes</th>
                </tr>
              </thead>
              {data.users ?
                <tbody>
                  {data.users.map(user => (
                    <UserPermissions key={user.id} user={user} />
                  ))}
                </tbody>
                :
                <tbody><tr><td colSpan="8">No users found</td></tr></tbody>
              }
            </Table>
          </>
        )
      }}
    </Query>
  );
};

export default Permissions;