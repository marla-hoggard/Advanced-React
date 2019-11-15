import Link from 'next/link';
import { useMutation } from '@apollo/react-hooks';

import CartCount from './CartCount';
import Signout from './Signout';
import User from './User';
import NavStyles from './styles/NavStyles';
import { TOGGLE_CART_MUTATION } from './Cart';
import countItems from '../lib/countItems';

const Nav = () => {
  const [toggleCart] = useMutation(TOGGLE_CART_MUTATION);

  return (
    <User>
      {({ data }) => (
        <NavStyles>
          <Link href="/items">
            <a>Shop</a>
          </Link>
          {(data && data.me) ? (
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
              <button onClick={toggleCart}>
                My Cart
                <CartCount count={countItems(data.me.cart)} />
              </button>
              <Signout />
            </>
          ) : (
              <Link href="/signup">
                <a>Sign In</a>
              </Link>
            )}
        </NavStyles>
      )}
    </User>
  );
};

export default Nav;