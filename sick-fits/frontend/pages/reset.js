import React, {
    Component
} from 'react';

import Reset from '../components/Reset';

class ResetPage extends Component {
    render () {
        return (
            <div>
                <p>Reset your password</p>
                <Reset resetToken={this.props.query.resetToken}/>
            </div>
        );
    }
}

export default ResetPage;
