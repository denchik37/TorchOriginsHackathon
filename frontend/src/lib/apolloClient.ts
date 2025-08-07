import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: '/api/subgraph',
  }),
  cache: new InMemoryCache(),
});

export default client;
