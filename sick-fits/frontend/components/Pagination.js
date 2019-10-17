import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Head from 'next/head';
import Link from 'next/link';

import PaginationStyles from './styles/PaginationStyles';
import { perPage } from '../config';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => (
    <Query query={PAGINATION_QUERY}>
      {({ data, error, loading }) => {
        if (loading) return <p>Loading...</p>;

        const count = data.itemsConnection.aggregate.count;
        const currentPage = props.currentPage;
        const numPages = Math.ceil(count / perPage);
        return (
          <PaginationStyles>
            <Head>
              <title>Sick Fits! | Page {currentPage} of {numPages}</title>
            </Head>

            <Link 
              prefetch
              href={{
                pathname: '/items',
                query: { page: currentPage - 1},
              }}
            >
              <a className="prev" aria-disabled={currentPage <= 1}>← Prev</a>
            </Link>

            <p>Page {currentPage} of {numPages}</p>
            <p>{count} Total Items</p>

            <Link
              prefetch
              href={{
                pathname: '/items',
                query: { page: currentPage + 1},
              }}
            >
              <a className="next" aria-disabled={currentPage >= numPages}>Next →</a>
            </Link>
          </PaginationStyles>
      )}}
    </Query>
);

export default Pagination;