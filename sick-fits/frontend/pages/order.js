import Order from '../components/Order';
import PleaseSignIn from '../components/PleaseSignIn';

const OrderPage = props => (
  <PleaseSignIn>
    <Order id={props.query.id} />
  </PleaseSignIn>
);

export default OrderPage;