import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import Error from './ErrorMessage';
import Form from './styles/Form';

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

const RequestReset = () => {
  const [email, setEmail] = useState('');
  const [reset, { error, loading, called }] = useMutation(REQUEST_RESET_MUTATION, {
    variables: { email },
  });

  const saveToState = e => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await reset();
    // Note: If reset() throws an error, the submit function stops and state won't be cleared
    setEmail('');
  };

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <fieldset disabled={loading} aria-busy={loading}>
        <h2>Reset Your Password</h2>

        <Error error={error} />
        {!error && !loading && called && <p>Success! Check your email for a reset link.</p>}

        <label htmlFor="email">
          Email
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={saveToState}
          />
        </label>
        <button type="submit">Request Reset</button>
      </fieldset>
    </Form>
  );
};

export default RequestReset;