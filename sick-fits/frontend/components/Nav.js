import Link from 'next/link';
import { Mutation } from 'react-apollo';

import CartCount from './CartCount';
import Signout from './Signout';
import User from './User';
import NavStyles from './styles/NavStyles';
import { TOGGLE_CART_MUTATION } from './Cart';
import countItems from '../lib/countItems';

const Nav = () => (
  <User>
    {({ data: { me } }) => (
      <NavStyles>
        <Link href="/items">
          <a>Shop</a>
        </Link>
        {me && (
          <>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/orders">
              <a>Orders</a>
            </Link>
            <Link href="/me">
              <a>Account</a>
            </Link>
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {toggleCart => (
                <button
                  onClick={toggleCart}
                >
                  My Cart
                  <CartCount count={countItems(me.cart)} />
                </button>
              )}
            </Mutation>
            <Signout />
          </>
        )}
        {!me && (
          <Link href="/signup">
            <a>Sign In</a>
          </Link>
        )}

      </NavStyles>
    )}
  </User>
);

export default Nav;