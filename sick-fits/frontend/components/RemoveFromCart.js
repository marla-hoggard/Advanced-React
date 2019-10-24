import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { CURRENT_USER_QUERY } from './User';

const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;

class RemoveFromCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  // This gets called as soon as we get a response back from the server
  // after a mutation has been performed
  update = (cache, payload) => {
    // 1. Read the cache to get the user's cart
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });

    // 2. Update the data (add new item, update count)
    data.me.cart = data.me.cart.filter(item => item.id !== payload.data.removeFromCart.id)

    // 3. Write our changes to the cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  }

  render() {
    const { id } = this.props;
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id }}
        update={this.update}
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: {
            id,
            __typename: 'CartItem',
          },
        }}
      >
        {(removeFromCart, { loading, error }) => (
          <BigButton
            title="Delete Item"
            onClick={() => {
              removeFromCart().catch(err => alert(err.message));
            }}
            disabled={loading}
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    );
  }
}

export default RemoveFromCart;