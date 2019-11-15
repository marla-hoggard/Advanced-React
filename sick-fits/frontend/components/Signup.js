import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Router from 'next/router';

import Form from './styles/Form';
import Error from './ErrorMessage';
import CURRENT_USER_QUERY from './User';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`;

const Signup = () => {
  const emptyFormState = {
    email: '',
    name: '',
    password: '',
  }
  const [state, setState] = useState({ ...emptyFormState });

  const saveToState = e => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup();

    // Note: If signup() throws an error, the submit function stops and state won't be cleared
    setState({ ...emptyFormState });
    Router.push({
      pathname: '/',
    });
  }

  const [signup, { error, loading }] = useMutation(SIGNUP_MUTATION, {
    variables: { ...state },
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  })

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <fieldset disabled={loading} aria-busy={loading}>
        <h2>Sign Up for an Account</h2>
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
        <label htmlFor="name">
          Name
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            value={state.name}
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
        <button type="submit">Sign Up!</button>
      </fieldset>
    </Form>
  );
}

export default Signup;