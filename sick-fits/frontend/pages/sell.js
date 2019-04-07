import React, {
    Component
} from 'react';

import PleaseSingIn from '../components/PleaseSignIn';
import CreateItem from '../components/CreateItem';

class Sell extends Component {
    render () {
        return (
            <div>
                <PleaseSingIn>
                    <CreateItem />
                </PleaseSingIn>
            </div>
        );
    }
}

export default Sell;
