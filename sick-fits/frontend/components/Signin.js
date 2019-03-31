import React, { Component } from 'react';
import {
    Mutation
} from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';
import {
    CURRENT_USER_QUERY
} from './User';

const SIGNIN_MUTATION = gql`
    mutation SIGNIN_MUTATION($email: String!, $password: String!) {
        signin(email: $email, password: $password) {
            id
            email
            name
        }
    }
`;

class Signin extends Component {
    state = {
        name: '',
        passowrd: '',
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
                mutation={SIGNIN_MUTATION}
                variables={this.state}
                refetchQueries={[
                    { query: CURRENT_USER_QUERY }
                ]}
            >
                {(signin, {error, loading}) => {
                    return (
                        <Form method="post" onSubmit={async (event) => {
                            event.preventDefault();
                            await signin();
                            this.setState({
                                name: '',
                                email: '',
                                passowrd: ''
                            })
                        }}>
                            <fieldset disabled={loading} aria-busy={loading}>
                                <h2>Sing in with existing Account</h2>
                                <ErrorMessage error={error} />
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
                                <label htmlFor="password">
                                    Password
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="password"
                                        value={this.state.password}
                                        onChange={this.saveToState}
                                    />
                                </label>
                                <button type="submit">Sing In!</button>
                            </fieldset>
                        </Form>
                    )
                }}
            </Mutation>
        );
    }
}

export default Signin;
