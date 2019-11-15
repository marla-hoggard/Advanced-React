import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Router from 'next/router';

import Error from './ErrorMessage';
import Form from './styles/Form';

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
    $image: String
    $largeImage: String
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
      title
      description
      price
      image
    }
  }
`;

const UpdateItem = ({ id }) => {
  const [state, setState] = useState({});

  const query = useQuery(SINGLE_ITEM_QUERY, {
    variables: { id },
  });
  const { data } = query;

  const [updateItem, mutation] = useMutation(UPDATE_ITEM_MUTATION, {
    variables: { ...state },
  });

  const handleChange = (e) => {
    const { name, type, value } = e.target;

    // Inputs always come in as string. If the type needs to be stored as a number, convert it
    const val = type === 'number' && value.length ? parseFloat(value) : value;

    setState({
      ...state,
      [name]: val,
    });
  };

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

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    const res = await updateItem({
      variables: {
        id,
        ...state,
      }
    });
    Router.push({
      pathname: '/item',
      query: { id: res.data.updateItem.id },
    });
  };

  if (query.loading) return <p>Loading...</p>;
  if (!data.item) return <p>No item found for ID: {id}</p>

  return (
    <Form onSubmit={handleUpdateItem}>
      <Error error={query.error} />
      <Error error={mutation.error} />
      <fieldset disabled={mutation.loading} aria-busy={mutation.loading}>
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
            defaultValue={data.item.title}
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
            defaultValue={data.item.price}
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
            defaultValue={data.item.description}
            required
          />
        </label>
        <button type="submit">{mutation.loading ? 'Saving...' : 'Save Changes'}</button>
      </fieldset>
    </Form>
  );
};

export { UPDATE_ITEM_MUTATION };
export default UpdateItem;