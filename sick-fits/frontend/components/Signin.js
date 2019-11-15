import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Router from 'next/router';

import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`;

const Signin = () => {
  const emptyFormState = {
    email: '',
    password: '',
  }

  const [state, setState] = useState({ ...emptyFormState });
  const [signin, { error, loading }] = useMutation(SIGNIN_MUTATION, {
    variables: { ...state },
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });

  const saveToState = e => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e, signin) => {
    e.preventDefault();
    await signin();

    // Note: If signin() throws an error, the submit function stops and state won't be cleared
    setState({ ...emptyFormState });
    Router.push({
      pathname: '/',
    });
  }

  return (
    <Form method="post" onSubmit={e => handleSubmit(e, signin)}>
      <fieldset disabled={loading} aria-busy={loading}>
        <h2>Sign in to your Account</h2>
        <Error error={error} />
        <label htmlFor="email">
          Email
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={state.email}
            onChange={saveToState}
          />
        </label>
        <label htmlFor="password">
          Password
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={state.password}
            onChange={saveToState}
          />
        </label>
        <button type="submit">Sign In</button>
      </fieldset>
    </Form>
  );
}

export default Signin;