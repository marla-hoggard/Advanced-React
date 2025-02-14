import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';

import Page from '../components/Page';
import withData from '../lib/withData';

class MyApp extends App {
  // This is a special Next.js lifecycle
  // This is going to fetch all the queries and mutations from the page
  static async getInitialProps({ Component, ctx}) {
    let pageProps = {};
    if(Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    // This exposes the query to the user
    pageProps.query = ctx.query;
    return { pageProps };
  }
  render() {
    const { Component, apollo, pageProps } = this.props;

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    )
  }
}

export default withData(MyApp);