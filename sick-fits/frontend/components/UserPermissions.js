import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
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

const UserPermissions = ({ user }) => {
  const [permissions, setPermissions] = useState(user.permissions);
  const [updated, setUpdated] = useState(false);

  const handleChange = e => {
    const perm = e.target.value;
    let perms;
    if (e.target.checked) {
      perms = permissions.concat(perm); // Add permission
    } else {
      perms = permissions.filter(p => p !== perm); // Remove permission
    }
    setPermissions(perms);
    setUpdated(true);
  }

  const handleUpdate = (e) => {
    updatePermissions();
    setUpdated(false);
  }

  const [updatePermissions, { loading, error }] = useMutation(UPDATE_PERMISSIONS_MUTATION, {
    variables: {
      permissions,
      userId: user.id,
    }
  });

  return (
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
                onChange={handleChange}
                value={perm}
                checked={permissions.includes(perm)}
              />
            </label>
          </td>
        ))}
        <td>
          <SickButton
            onClick={handleUpdate}
            type="button"
            disabled={loading || !updated}
          >
            {loading ? 'SAVING' : 'SAVE'}
          </SickButton>
        </td>
      </tr>
    </>
  );
};

UserPermissions.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    id: PropTypes.string,
    permissions: PropTypes.array,
  }).isRequired,
};

export default UserPermissions;