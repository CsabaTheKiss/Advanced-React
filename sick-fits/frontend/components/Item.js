import React, {
    Component
} from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import formatMoney from '../lib/formatMoney';

import Title from './styles/Title';
import ItemStyles from './styles/ItemStyles';
import PriceTag from './styles/PriceTag';

class Item extends Component {
    render() {
        const {
            item
        } = this.props;
        
        return (
            <ItemStyles>
                {item.image && <img src={item.image} alt={item.title} />}
                <Title>
                    <Link href={{
                        pathname: '/item',
                        query: { id: item.id }
                    }}>
                        <a>{item.title}</a>
                    </Link>
                    <PriceTag>
                        {formatMoney(item.price)}
                    </PriceTag>
                    <p>{item.description}</p>
                    <div className="buttonList">
                        <Link href={{
                            pathname: 'update',
                            query: { id: item.id }
                        }}>
                            <a>Edit</a>
                        </Link>
                        <button>Add to cart</button>
                        <button>Delete</button>
                    </div>
                </Title>
            </ItemStyles>        
        );
    }
}

Item.propTypes = {
    item: PropTypes.object.isRequired
};

export default Item;