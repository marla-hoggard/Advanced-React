import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Router from 'next/router';

import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

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

class ResetPassword extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired,
  };

  emptyFormState = {
    newPassword: '',
    confirmPassword: '',
  };

  state = {...this.emptyFormState};

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <Mutation
        mutation={RESET_PASSWORD_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          newPassword: this.state.newPassword,
          confirmPassword: this.state.confirmPassword,
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      > 
        {(reset, { error, loading, called} ) => {
          return (
            <Form method="post" onSubmit={async e => {
              e.preventDefault();
              await reset();
              // Reroute to home page if reset() is successful
              Router.push({
                pathname: '/',
              });
            }}>
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
                    value={this.state.newPassword} 
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="confirmPassword">
                  Confirm Password
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    placeholder="Confirm Password" 
                    required
                    value={this.state.confirmPassword} 
                    onChange={this.saveToState}
                  />
                </label>
                <button type="submit">Set Password</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default ResetPassword;