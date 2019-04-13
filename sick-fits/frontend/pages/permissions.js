import React, {
    Component
} from 'react';

import PleaseSingIn from '../components/PleaseSignIn';
import Permissions from '../components/Permissions';

class PermissionsPage extends Component {
    render () {
        return (
            <div>
                <PleaseSingIn>
                    <Permissions />
                </PleaseSingIn>
            </div>
        );
    }
}

export default PermissionsPage;
