import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: '/api/subgraph', // your API proxy URL
  }),
  cache: new InMemoryCache(),
});

export default client;
