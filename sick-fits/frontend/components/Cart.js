import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';

import User from './User';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import CartItem from './CartItem';
import TakeMyMoney from './TakeMyMoney';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';

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

// This saves us from render prop hell!
// Without this, we had <User>...<Mutation>...<Query>...</Query></Mutation></User>
const ComposedCart = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>,
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
})

const Cart = () => {
  return (
    <ComposedCart>
      {({ user, toggleCart, localState }) => {
        const me = user && user.data ? user.data.me : undefined;
        if (!me) return null;

        return (
          <CartStyles open={localState.data.cartOpen}>
            <header>
              <CloseButton title="close" onClick={toggleCart}>&times;</CloseButton>
              <Supreme>{me.name}'s Cart</Supreme>
              <p>You have {me.cart.length} item{me.cart.length > 1 ? 's' : 's'} in your cart.</p>
            </header>
            <ul>
              {me.cart.map(cartItem => <CartItem key={cartItem.id} cartItem={cartItem} />)}
            </ul>

            <footer>
              <p>{formatMoney(calcTotalPrice(me.cart))}</p>
              {!!me.cart.length && (
                <TakeMyMoney>
                  <SickButton>Checkout</SickButton>
                </TakeMyMoney>
              )}
            </footer>
          </CartStyles>

        );
      }}
    </ComposedCart>

  );
};

export default Cart;