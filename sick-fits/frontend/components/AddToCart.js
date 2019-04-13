import React from 'react';
import { MdAddShoppingCart } from 'react-icons/md';
import {
    Mutation
  } from 'react-apollo';
import gql from 'graphql-tag';

const ADD_TO_CART_MUTATION = gql`
    mutation addToCart($id: ID!) {
        addToCart(id: $id) {
            id
            quantity
        }
    }
`;

class AddToCart extends React.Component {
    render () {
        const {
            id
        } = this.props;
        return (
            <Mutation
                mutation={ADD_TO_CART_MUTATION}
                variables={{
                    id
                }}
            >
                {(addToCart) => (
                    <button onClick={addToCart}>
                        Add to Cart <MdAddShoppingCart />
                    </button>
                )}
            </Mutation>
        );
    }
}

export default AddToCart;
