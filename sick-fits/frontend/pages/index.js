import Items from '../components/Items';

const Home = props => (
  <div>
    <Items currentPage={+props.query.page || 1} />
  </div>
);

export default Home;