import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import styled from 'styled-components';

import Error from './ErrorMessage';
import formatMoney from '../lib/formatMoney';
import OrderItemStyles from './styles/OrderItemStyles';

const USER_ORDERS_QUERY = gql`
  query USER_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
      items {
        id
        title
        price
        description
        quantity
        image
      }
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

const OrdersList = () => {
  return (
    <Query query={USER_ORDERS_QUERY}>
      {({ data, error, loading }) => {
        if (error) return <Error error={error} />;
        if (loading) return <p>Loading...</p>
        if (!data || !data.orders.length) return <p>You have not placed any orders.</p>

        return (
          <>
            <h2>You have {data.orders.length} orders</h2>
            <OrderUl>
              {data.orders.map(order => (
                <OrderItemStyles key={order.id}>
                  <Link href={{
                    pathname: '/order',
                    query: { id: order.id },
                  }}
                  >
                    <a>
                      <div className="order-meta">
                        <p>{order.items.reduce((tally, item) => tally + item.quantity, 0)} Items</p>
                        <p>{order.items.length} Products</p>
                        <p>{formatDistance(order.createdAt, new Date())} ago</p>
                        <p>{formatMoney(order.total)}</p>
                      </div>
                      <div className="images">
                        {order.items.map(item => (
                          <img key={item.id} src={item.image} alt={item.title} />
                        ))}
                      </div>
                    </a>
                  </Link>
                </OrderItemStyles>
              ))}
            </OrderUl>
          </>
        );
      }}
    </Query>
  );
}

export default OrdersList;