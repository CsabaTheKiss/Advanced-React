import Link from 'next/link';
import {
  Fragment
} from 'react';

import NavStyles from './styles/NavStyles';
import User from './User';

const Nav = () => (

    <User>
      {({ data: { me } }) => {
        return (
          <NavStyles>
            <Link href="/items">
              <a>Shop</a>
            </Link>
            {me && (
              <Fragment>
                <Link href="/sell">
                  <a>Sell</a>
                </Link>
                <Link href="/orders">
                  <a>Orders</a>
                </Link>
                <Link href="/me">
                  <a>Account</a>
                </Link>
              </Fragment>
            )}
            {!me && (
              <Link href="/signup">
                <a>Signin</a>
              </Link>
            )}
          </NavStyles>
        )
      }}
    </User>

);

export default Nav;
