import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Router from 'next/router';

import Error from './ErrorMessage';
import { ALL_ITEMS_QUERY } from './Items';
import { PAGINATION_QUERY } from './Pagination';
import Form from './styles/Form';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

const CreateItem = () => {
  const [state, setState] = useState({
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
  });

  const handleChange = (e) => {
    const { name, type, value } = e.target;

    // Inputs always come in as string. If the type needs to be stored as a number, convert it
    const val = type === 'number' && value.length ? parseFloat(value) : value;

    setState({ ...state, [name]: val });
  };

  const handleSubmit = async (e, createItem) => {
    e.preventDefault();

    const res = await createItem();

    Router.push({
      pathname: '/item',
      query: { id: res.data.createItem.id },
    });
  }

  const uploadFile = async e => {
    const files = e.target.files;
    if (files.length) {
      const data = new FormData();
      data.append('file', files[0]);
      data.append('upload_preset', 'sickfits'); // Set in Cloudinary
      const res = await fetch('https://api.cloudinary.com/v1_1/mbglasser/image/upload', {
        method: 'POST',
        body: data,
      });
      const file = await res.json();
      setState({
        ...state,
        image: file.secure_url,
        largeImage: file.eager ? file.eager[0].secure_url : '',
      });
    }
  };

  const update = (cache, payload) => {
    // 1. Read the cache for the items we want
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    const pagination = cache.readQuery({ query: PAGINATION_QUERY });

    // 2. Update the data (add new item, update count)
    const newItem = {
      id: payload.data.createItem.id,
      __typename: "Item",
      ...state,
    }
    data.items = [newItem, ...data.items];
    pagination.itemsConnection.aggregate.count++;

    // 3. Write our changes to the cache
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
    cache.writeQuery({ query: PAGINATION_QUERY, data: pagination });
  }

  const [createItem, { loading, error }] = useMutation(CREATE_ITEM_MUTATION, {
    variables: { ...state },
    update,
  });
  return (
    <Form onSubmit={e => handleSubmit(e, createItem)}>
      <Error error={error} />
      <fieldset disabled={loading} aria-busy={loading}>
        <label htmlFor="file">
          Image
              <input
            type="file"
            id="file"
            name="file"
            placeholder="Upload an Image"
            onChange={uploadFile}
          />
          {state.image && <img src={state.image} alt="Upload Preview" />}
        </label>
        <label htmlFor="title">
          Title
              <input
            type="text"
            id="title"
            name="title"
            placeholder="Title"
            onChange={handleChange}
            value={state.title}
            required
          />
        </label>
        <label htmlFor="price">
          Price
              <input
            type="number"
            id="price"
            name="price"
            placeholder="Price (in cents)"
            onChange={handleChange}
            value={state.price}
            required
          />
        </label>
        <label htmlFor="description">
          Description
              <textarea
            type="text"
            id="description"
            name="description"
            placeholder="Enter a Description"
            onChange={handleChange}
            value={state.description}
            required
          />
        </label>
        <button type="submit">Submit</button>
      </fieldset>
    </Form>
  );
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };