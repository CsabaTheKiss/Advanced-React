import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Mutation
} from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import {
    CURRENT_USER_QUERY
} from './User';

const RESET_MUTATION = gql`
    mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
        resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
            id
            email
            name
        }
    }
`;

class Reset extends Component {
    static propTypes = {
        resetToken: PropTypes.string
    }

    state = {
        password: '',
        confirmPassword: ''
    }

    saveToState = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    render() {
        return (
            <Mutation
                mutation={RESET_MUTATION}
                variables={{
                    resetToken: this.props.resetToken,
                    password: this.state.password,
                    confirmPassword: this.state.confirmPassword
                }}
                refetchQueries={[{
                    query: CURRENT_USER_QUERY
                }]}
            >
                {(reset, {error, loading, called}) => {
                    return (
                        <Form method="post" onSubmit={async (event) => {
                            event.preventDefault();
                            await reset();
                            this.setState({
                                password: '',
                                confirmPassword: ''
                            })
                        }}>
                            <fieldset disabled={loading} aria-busy={loading}>
                                <h2>Reset your password</h2>
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
                                <label htmlFor="confirm-password">
                                    Confirm password
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="confirm password"
                                        value={this.state.confirmPassword}
                                        onChange={this.saveToState}
                                    />
                                </label>
                                <button type="submit">Reset your password</button>
                            </fieldset>
                        </Form>
                    )
                }}
            </Mutation>
        );
    }
}

export default Reset;
