import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import SickButton from './styles/SickButton';
import { possiblePermissions } from '../lib/constants';

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION(
    $permissions: [Permission],
    $userId: ID!
  ) {
    updatePermissions(
      permissions: $permissions,
      userId: $userId,
    ) {
      id
      permissions
      name
      email
    }
  }
`;

class UserPermissions extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  };

  state = {
    permissions: this.props.user.permissions,
    updated: false,
  };

  handleChange = e => {
    const perm = e.target.value;
    let permissions;
    if (e.target.checked) {
      permissions = this.state.permissions.concat(perm); // Add permission
    } else {
      permissions = this.state.permissions.filter(p => p !== perm); // Remove permission
    }
    this.setState({ permissions, updated: true });
  }

  handleUpdate = (e, update) => {
    update();
    this.setState({ updated: false });
  }

  render() {
    const { user } = this.props;

    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          permissions: this.state.permissions,
          userId: user.id,
        }}
      >
        {(updatePermissions, { loading, error }) => (
          <>
            {error && <tr><td colSpan="8"><Error error={error} /></td></tr>}

            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map(perm => (
                <td key={perm}>
                  <label htmlFor={`${user.id}-permission-${perm}`}>
                    <input
                      type="checkbox"
                      id={`${user.id}-permission-${perm}`}
                      onChange={this.handleChange}
                      value={perm}
                      checked={this.state.permissions.includes(perm)}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  onClick={e => this.handleUpdate(e, updatePermissions)}
                  type="button"
                  disabled={loading || !this.state.updated}
                >
                  {loading ? 'SAVING...' : 'SAVE'}
                </SickButton>
              </td>
            </tr>
          </>
        )}
      </Mutation>
    );
  }
}

export default UserPermissions;