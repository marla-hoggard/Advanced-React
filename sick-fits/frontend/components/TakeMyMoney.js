import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import NProgress from 'nprogress';
import gql from 'graphql-tag';

import calcTotalPrice from '../lib/calcTotalPrice';
import { STRIPE_PUBLIC_KEY } from '../lib/constants';
import User, { CURRENT_USER_QUERY } from './User';

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

function totalItems(cart) {
  return cart.reduce((tally, item) => tally + item.quantity, 0);
}

const TakeMyMoney = props => {
  const [createOrder] = useMutation(CREATE_ORDER_MUTATION, {
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
  });

  const onToken = async (res) => {
    NProgress.start();
    const order = await createOrder({
      variables: {
        token: res.id
      }
    }).catch(err => alert(err.message));

    Router.push({
      pathname: '/order',
      query: { id: order.data.createOrder.id },
    })
  };

  return (
    <User>
      {({ data }) => (
        <StripeCheckout
          amount={calcTotalPrice(data && data.me.cart)}
          name="Sick Fits"
          description={`Order of ${totalItems(data.me.cart)} items`}
          image={data && data.me.cart.length && data.me.cart[0].item && data.me.cart[0].item.image}
          stripeKey={STRIPE_PUBLIC_KEY}
          currency="USD"
          email={data && data.me.email}
          token={onToken}
        >
          {props.children}
        </StripeCheckout>
      )}
    </User>
  );
};

export default TakeMyMoney;