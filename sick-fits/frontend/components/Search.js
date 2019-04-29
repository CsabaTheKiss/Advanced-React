import React, { Component } from 'react';
import Downshift, { resetIdCounter } from 'downshift';
import Router from 'next/router';
import {
    ApolloConsumer
} from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import {
    DropDown,
    DropDownItem,
    SearchStyles
} from './styles/DropDown';

const SEARCH_ITEM_QUERY = gql`
    query SEARCH_ITEM_QUERY($searchTerm: String!) {
        items (where: {
            OR: [
                { title_contains: $searchTerm, },
                { description_contains: $searchTerm }
            ]
        }) {
            id
            image
            title
        }
    }
`;

function routeToItem (item) {
    Router.push({
        pathname: '/item',
        query: {
            id: item.id
        }
    });
}

class AutoComplete extends Component {
    state = {
        items: [],
        loading: false
    }

    onSearchChange = debounce(async (event, client) => {
        this.setState({
            loading: true
        });
        // Manually query apollo client
        const response = await client.query({
            query: SEARCH_ITEM_QUERY,
            variables: {
                searchTerm: event.target.value
            }
        });
        this.setState({
            items: response.data.items,
            loading: false
        });
    }, 350);

    render() {
        resetIdCounter(); // to prevent server and client side rendered page inconsistency on generated ids

        return (
            <SearchStyles>
                <Downshift
                    itemToString={item => (item === null ? '' : item.title)}
                    onChange={routeToItem}
                >
                    {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
                        <div>
                            <ApolloConsumer>
                                {(client) => (
                                    <input
                                        {...getInputProps({
                                            type: 'search',
                                            placeholder: 'Search for an item',
                                            id: 'search',
                                            className: this.state.loading ? 'loading' : '',
                                            onChange: (event) => {
                                                event.persist();
                                                this.onSearchChange(event, client)
                                            }
                                        })}
                                    />
                                )}
                            </ApolloConsumer>
                            { isOpen && (
                                <DropDown>
                                    {this.state.items.map((item, index) => (
                                        <DropDownItem
                                            key={item.id}
                                            {...getItemProps({item})}
                                            highlighted={ index === highlightedIndex }
                                        >
                                            <img width="50" src={item.image} alt={item.title} />
                                            {item.title}
                                        </DropDownItem>
                                    ))}
                                    {!this.state.items.length && !this.state.loading && (
                                        <DropDownItem>
                                            Nothing found for {inputValue}
                                        </DropDownItem>
                                    )}
                                </DropDown>
                            )}
                        </div>
                    )}
                </Downshift>
            </SearchStyles>
        );
    }
}

export default AutoComplete;