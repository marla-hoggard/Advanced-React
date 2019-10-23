import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
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

class Signin extends Component {
  emptyFormState = {
    email: '',
    password: '',
  }
  state = { ...this.emptyFormState };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit = async (e, signin) => {
    e.preventDefault();
    await signin();

    // Note: If signin() throws an error, the submit function stops and state won't be cleared
    this.setState({ ...this.emptyFormState });
    Router.push({
      pathname: '/',
    });
  }

  render() {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signin, { error, loading }) => {

          return (
            <Form method="post" onSubmit={e => this.handleSubmit(e, signin)}>
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
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    value={this.state.password}
                    onChange={this.saveToState}
                  />
                </label>
                <button type="submit">Sign In</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Signin;