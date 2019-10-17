import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';

import Error from './ErrorMessage';
import { ALL_ITEMS_QUERY } from './Items';
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

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
  };

  handleChange = (e) => {
    const { name, type, value} = e.target;

    // Inputs always come in as string. If the type needs to be stored as a number, convert it 
    const val = type === 'number' && value.length ? parseFloat(value) : value;

    this.setState({ [name]: val });
  };

  uploadFile = async e => {
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
      this.setState({
        image: file.secure_url,
        largeImage: file.eager ? file.eager[0].secure_url : '',
      });
    }
  };

  update = (cache, payload) => {

    // 1. Read the cache for the items we want
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });

    // 2. Add the new item
    data.items.push({
      id: payload.data.createItem.id,
      __typename: "Item",
      ...this.state,
    });

    // 3. Put the items back
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
  }

  render() {
    return (
      <Mutation 
        mutation={CREATE_ITEM_MUTATION}
        variables={this.state}
        update={this.update}
      >
        {(createItem, {loading, error}) => (
          <Form onSubmit={async e => {
            e.preventDefault();
            // Call the mutation
            const res = await createItem();
            // Go to the single-item page for the new item
            Router.push({
              pathname: '/item',
              query: { id: res.data.createItem.id },
            });
          }}>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
            <label htmlFor="file">
                Image
                <input 
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an Image"
                  onChange={this.uploadFile}
                />
                {this.state.image && <img src={this.state.image} alt="Upload Preview" />}
              </label>
              <label htmlFor="title">
                Title
                <input 
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  onChange={this.handleChange}
                  value={this.state.title}
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
                  onChange={this.handleChange}
                  value={this.state.price}
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
                  onChange={this.handleChange}
                  value={this.state.description}
                  required  
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };