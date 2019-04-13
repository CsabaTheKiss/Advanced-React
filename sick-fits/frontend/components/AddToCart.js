import React from 'react';
import { MdAddShoppingCart } from 'react-icons/md';
import {
    CURRENT_USER_QUERY
} from './User';
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
                refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
                {(addToCart, { loading }) => (
                    <button
                        onClick={addToCart}
                        disabled={loading}
                    >
                        Add{loading && 'ing'} to Cart <MdAddShoppingCart />
                    </button>
                )}
            </Mutation>
        );
    }
}

export default AddToCart;
