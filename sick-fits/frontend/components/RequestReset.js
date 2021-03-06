import React, { Component } from 'react';
import {
    Mutation
} from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';

const REQUEST_RESET_MUTATION = gql`
    mutation REQUEST_RESET_MUTATION($email: String!) {
        requestReset(email: $email) {
            message
        }
    }
`;

class RequestReset extends Component {
    state = {
        email: ''
    }

    saveToState = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    render() {
        return (
            <Mutation
                mutation={REQUEST_RESET_MUTATION}
                variables={this.state}
            >
                {(reset, {error, loading, called}) => {
                    return (
                        <Form method="post" onSubmit={async (event) => {
                            event.preventDefault();
                            await reset();
                            this.setState({
                                email: ''
                            })
                        }}>
                            <fieldset disabled={loading} aria-busy={loading}>
                                <h2>Request password reset</h2>
                                <ErrorMessage error={error} />
                                {!error && !loading && called && (
                                    <p>Check your email for reset link!</p>
                                )}
                                <label htmlFor="email">
                                    Email
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="email"
                                        value={this.state.email}
                                        onChange={this.saveToState}
                                    />
                                </label>
                                <button type="submit">Request reset</button>
                            </fieldset>
                        </Form>
                    )
                }}
            </Mutation>
        );
    }
}

export default RequestReset;
