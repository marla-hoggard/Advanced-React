import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Router from 'next/router';

import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import Form from './styles/Form';

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION($resetToken: String!, $newPassword: String!, $confirmPassword: String!) {
    resetPassword(
      resetToken: $resetToken
      newPassword: $newPassword
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`;

const ResetPassword = ({ resetToken }) => {
  const emptyFormState = {
    newPassword: '',
    confirmPassword: '',
  };

  const [state, setState] = useState({ ...emptyFormState });
  const [reset, { error, loading }] = useMutation(RESET_PASSWORD_MUTATION, {
    variables: {
      resetToken: resetToken,
      newPassword: state.newPassword,
      confirmPassword: state.confirmPassword,
    },
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });

  const saveToState = e => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await reset();

    // Reroute to home page if reset() is successful
    setState({ ...emptyFormState });
    Router.push({
      pathname: '/',
    });
  };

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <fieldset disabled={loading} aria-busy={loading}>
        <h2>Reset Your Password</h2>
        <Error error={error} />

        <label htmlFor="newPassword">
          Password
          <input
            type="password"
            name="newPassword"
            placeholder="Password"
            required
            value={state.newPassword}
            onChange={saveToState}
          />
        </label>
        <label htmlFor="confirmPassword">
          Confirm Password
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            value={state.confirmPassword}
            onChange={saveToState}
          />
        </label>
        <button type="submit">Set Password</button>
      </fieldset>
    </Form>
  );
}

ResetPassword.propTypes = {
  resetToken: PropTypes.string.isRequired,
};

export default ResetPassword;