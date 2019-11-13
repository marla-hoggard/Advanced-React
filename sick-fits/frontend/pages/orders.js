import OrdersList from '../components/OrdersList';
import PleaseSignIn from '../components/PleaseSignIn';

const OrdersPage = () => (
  <PleaseSignIn>
    <OrdersList />
  </PleaseSignIn>
);

export default OrdersPage;