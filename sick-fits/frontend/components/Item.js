import Link from 'next/link';
import React from 'react';
import PropTypes from 'prop-types';

import AddToCart from './AddToCart';
import DeleteItem from './DeleteItem';
import ItemStyles from './styles/ItemStyles';
import Title from './styles/Title';
import PriceTag from './styles/PriceTag';
import formatMoney from '../lib/formatMoney';

const Item = ({ item }) => (
  <ItemStyles>
    {item.image && <img src={item.image} alt={item.title} />}

    <Title>
      <Link
        href={{
          pathname: '/item',
          query: { id: item.id },
        }}
      >
        <a>{item.title}</a>
      </Link>
    </Title>
    <PriceTag>{formatMoney(item.price)}</PriceTag>
    <p>{item.description}</p>

    <div className="buttonList">
      <Link
        href={{
          pathname: 'update',
          query: { id: item.id },
        }}
      >
        <a>✏️ Edit</a>
      </Link>
      <AddToCart id={item.id} />
      <DeleteItem id={item.id}>Delete This Item</DeleteItem>
    </div>
  </ItemStyles>
);

Item.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
    largeImage: PropTypes.string,
  }),
};

export default Item;