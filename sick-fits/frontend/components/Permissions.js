import { Query, Mutation } from 'react-apollo';
import Error from './ErrorMessage';
import gql from 'graphql-tag';
import Table from './styles/Table';
import SickButton from './styles/SickButton';
import PropTypes from 'prop-types';

const possiblePermissions = [
    'ADMIN',
    'USER',
    'ITEM_CREATE',
    'ITEM_UPDATE',
    'ITEM_DELETE',
    'PERMISSION_UPDATE',
];

const UPDATE_PERMISSIONS_MUTATION = gql`
    mutation updatePermissions($permissions: [Permission], $userId: ID!) {
        updatePermissions(permissions: $permissions, userId: $userId) {
            id
            name
            email
            permissions
        }
    }
`;

const ALL_USERS_QUERY = gql`
    query {
        users {
            id
            name
            email
            permissions
        }
    }
`;

const Permissions = props => {
    return (
        <Query
            query={ALL_USERS_QUERY}
        >
            {({ data, loading, error }) => {
                return (
                    <div>
                        <Error error={error} />
                        <div>
                            <h2>Manage Permissions</h2>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        {possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
                                        <th>I</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.users.map(user => <UserPermissions key={user.id} user={user} />)}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                );
            }}
        </Query>
    )
}

class UserPermissions extends React.Component {
    static propTypes = {
        user: PropTypes.shape({
            name: PropTypes.string,
            email: PropTypes.string,
            permissions: PropTypes.array
        }).isRequired,
    };

    state = {
        permissions: this.props.user.permissions
    };

    handlePermissionChange = (event) => {
        const checkbox = event.target;
        let updatedPermissions = [ ...this.state.permissions ];
        if (checkbox.checked) {
            updatedPermissions.push(checkbox.value);
        } else {
            updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value);
        }
        this.setState({
            permissions: updatedPermissions
        });
    }

    render () {
        const user = this.props.user;
        return (
            <Mutation
                mutation={UPDATE_PERMISSIONS_MUTATION}
                variables={{
                    permissions: this.state.permissions,
                    userId: this.props.user.id
                }}
            >
                {(updatePermissions, { loading, error }) => {
                    return (
                        <>
                            {error && <tr><td colspan="8"><Error error={error} /></td></tr>}
                            <tr>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                {possiblePermissions.map(permission => (
                                    <td key={`${user.id}-permission-${permission}`}>
                                        <label htmlFor={`${user.id}-permission-${permission}`}>
                                            <input
                                                id={`${user.id}-permission-${permission}`}
                                                type="checkbox"
                                                checked={this.state.permissions.includes(permission)}
                                                value={permission}
                                                onChange={this.handlePermissionChange}
                                            />
                                        </label>
                                    </td>
                                ))}
                                <td>
                                    <SickButton
                                        type="button"
                                        disabled={loading}
                                        onClick={updatePermissions}
                                    >
                                        Updat{loading ? 'ing' : 'e'}
                                    </SickButton>
                                </td>
                            </tr>
                        </>
                    );
                }}
            </Mutation>
        )
    }
}

export default Permissions;
