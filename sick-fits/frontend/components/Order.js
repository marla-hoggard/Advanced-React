import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { format } from 'date-fns';
import Head from 'next/head';

import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import OrderItem from './OrderItem';
import OrderStyles from './styles/OrderStyles';

const SINGLE_ORDER_QUERY = gql`
  query SINGLE_ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      charge
      total
      createdAt
      user {
        id
      }
      items {
        id
        title
        description
        price
        image
        quantity
      }
    }
  }
`;

const Order = ({ id }) => {
  const { data, error, loading } = useQuery(SINGLE_ORDER_QUERY, {
    variables: { id },
  });

  if (error) return <Error error={error} />;
  if (loading) return <p>Loading...</p>

  const order = data.order;
  return (
    <OrderStyles>
      <Head>
        <title>Sick Fits - Order {order.id}</title>
      </Head>

      <p><span>Order Id:</span> <span>{id}</span></p>
      <p><span>Charge:</span> <span>{order.charge}</span></p>
      <p><span>Date:</span> <span>{format(order.createdAt, 'MMMM d, YYYY, h:mm a')}</span></p>
      <p><span>Order Total:</span> <span>{formatMoney(order.total)}</span></p>
      <p><span>Item Count:</span> <span>{order.items.length}</span></p>

      <div className="items">
        {order.items.map(item => <OrderItem key={item.id} item={item} />)}
      </div>
    </OrderStyles>
  );
};

Order.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Order;