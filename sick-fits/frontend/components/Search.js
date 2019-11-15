import React, { useState } from 'react';
import { ApolloConsumer } from '@apollo/react-common';
import Downshift, { resetIdCounter } from 'downshift';
import Router from 'next/router';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';

import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(where: {
      OR: [
        { title_contains: $searchTerm },
        { description_contains: $searchTerm },
      ]
    }) {
      id
      title
      image
    }
  }
`;

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: { id: item.id },
  });
}

const AutoComplete = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce to limit searches on quick typing
  const onChange = debounce(async (e, client) => {
    setIsLoading(true);

    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value }
    });

    setItems(res.data.items);
    setIsLoading(false);
  }, 350);

  // Fixes a weird Downshift aria-label bug
  resetIdCounter();

  return (
    <SearchStyles>
      <Downshift
        itemToString={item => item ? item.title : ''}
        onChange={routeToItem}
      >
        {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
          <div>
            <ApolloConsumer>
              {(client) => (
                <input
                  {...getInputProps({
                    placeholder: "Search...",
                    type: "search",
                    id: "search",
                    className: isLoading ? 'loading' : '',
                    onChange: e => {
                      e.persist();
                      onChange(e, client);
                    }
                  })}
                />
              )}
            </ApolloConsumer>
            {isOpen && (
              <DropDown>
                {items.map((item, index) => (
                  <DropDownItem
                    {...getItemProps({ item })}
                    key={item.id}
                    highlighted={index === highlightedIndex}
                  >
                    <img width="50" src={item.image} alt={item.title} />
                    {item.title}
                  </DropDownItem>
                ))}
                {!items.length && !isLoading &&
                  <DropDownItem>Nothing found for "{inputValue}"</DropDownItem>
                }
              </DropDown>
            )}
          </div>
        )}
      </Downshift>
    </SearchStyles>
  );
};

export default AutoComplete;