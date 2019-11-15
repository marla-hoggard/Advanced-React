import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { ALL_ITEMS_QUERY } from './Items';
import { PAGINATION_QUERY } from './Pagination';

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

const DeleteItem = (props) => {
  // Manually update the cache on the client so it matches the server
  // This will make the data on the page rerender without the deleted item
  const update = (cache, payload) => {
    // 1. Read the cache for the items we want
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    const pagination = cache.readQuery({ query: PAGINATION_QUERY });

    // 2. Update the data (remove the item, update the count)
    data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id);
    pagination.itemsConnection.aggregate.count--;

    // 3. Write the updates to the cache
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
    cache.writeQuery({ query: PAGINATION_QUERY, data: pagination });
  };

  const [deleteItem] = useMutation(DELETE_ITEM_MUTATION, {
    variables: { id: props.id },
    update,
  });

  return (
    <button
      onClick={() => {
        if (confirm('Are you sure you want to delete this item?')) {
          deleteItem().catch(err => {
            alert(err.message);
          });
        }
      }}
    >
      {props.children}
    </button>
  );
}

export default DeleteItem;