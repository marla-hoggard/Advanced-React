import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import styled from 'styled-components';

import Error from './ErrorMessage';
import Item from './Item';
import Pagination from './Pagination';
import { perPage } from '../config';

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY(
    $skip: Int = 0,
    $first: Int = ${perPage}
    ) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

const Items = ({ currentPage }) => {
  const { data, error, loading } = useQuery(ALL_ITEMS_QUERY, {
    variables: { skip: currentPage * perPage - perPage },
  });

  return (
    <Center>
      <Pagination currentPage={currentPage}></Pagination>
      {loading ? <p>Loading...</p>
        : error ? <Error error={error} />
          : (
            <ItemsList>
              {data.items.map(item => <Item item={item} key={item.id} />)}
            </ItemsList>
          )
      }
      <Pagination currentPage={currentPage}></Pagination>
    </Center>
  );
};

export { ALL_ITEMS_QUERY };
export default Items;