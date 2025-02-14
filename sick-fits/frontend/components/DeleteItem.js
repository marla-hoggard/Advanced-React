import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
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

class DeleteItem extends Component {

  // Manually update the cache on the client so it matches the server
  // This will make the data on the page rerender without the deleted item
  update = (cache, payload) => {

    // 1. Read the cache for the items we want
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    const pagination = cache.readQuery({ query: PAGINATION_QUERY });

    // 2. Update the data (remove the item, update the count)
    data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id);
    pagination.itemsConnection.aggregate.count--;

    // 3. Write the updates to the cache
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
    cache.writeQuery({ query: PAGINATION_QUERY, data: pagination });
  }

  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
      >
        {(deleteItem, { error }) => (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this item?')) {
                deleteItem().catch(err => {
                  alert(err.message);
                });
              }
            }}
          >
            {this.props.children}
          </button>
        )}
      </Mutation>
    );
  }
}

export default DeleteItem;