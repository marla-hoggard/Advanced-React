import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

export const LOCAL_STATE_QUERY = gql`
  query LOCAL_STATE_QUERY {
    cartOpen @client
  }
`;

export const TOGGLE_CART_MUTATION = gql`
  mutation TOGGLE_CART_MUTATION {
    toggleCart @client
  }
`;

import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';

const Cart = () => {
  return (
    <Mutation mutation={TOGGLE_CART_MUTATION}>
      {toggleCart => (

        <Query query={LOCAL_STATE_QUERY}>
          {({ data, error, loading }) => {

            return (
              <CartStyles open={data.cartOpen}>
                <header>
                  <CloseButton title="close" onClick={toggleCart}>&times;</CloseButton>
                  <Supreme>Your Cart</Supreme>
                  <p>You have __ items in your carts.</p>
                </header>

                <footer>
                  <p>$PRICE</p>
                  <SickButton>Checkout</SickButton>
                </footer>
              </CartStyles>
            );
          }}
        </Query>
      )}
    </Mutation>

  );
};

export default Cart;