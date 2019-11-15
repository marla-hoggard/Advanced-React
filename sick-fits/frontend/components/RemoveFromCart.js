import React, { Component } from 'react';
import { useMutation } from '@apollo/react-hooks';
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

const RemoveFromCart = ({ id }) => {
  // This gets called as soon as we get a response back from the server
  // after a mutation has been performed
  const update = (cache, payload) => {
    // 1. Read the cache to get the user's cart
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });

    // 2. Update the data (add new item, update count)
    data.me.cart = data.me.cart.filter(item => item.id !== payload.data.removeFromCart.id)

    // 3. Write our changes to the cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  };

  const [removeFromCart, { loading }] = useMutation(REMOVE_FROM_CART_MUTATION, {
    variables: { id },
    update,
    optimisticResponse: {
      __typename: 'Mutation',
      removeFromCart: {
        id,
        __typename: 'CartItem',
      },
    }
  });

  return (
    <BigButton
      title="Delete Item"
      onClick={() => removeFromCart().catch(err => alert(err.message))}
      disabled={loading}
    >
      &times;
    </BigButton>
  );
};

RemoveFromCart.propTypes = {
  id: PropTypes.string.isRequired,
};

export default RemoveFromCart;