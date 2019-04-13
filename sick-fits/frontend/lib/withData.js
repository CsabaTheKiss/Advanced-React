import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';

import {
  LOCAL_STATE_QUERY
} from '../components/Cart';

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    // local data
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart (_, variables, apolloClient) {
            // read the cartOpen value from cache
            const {
              cartOpen
            } = apolloClient.cache.readQuery({
              query: LOCAL_STATE_QUERY
            });
            // write the cart state to the opposite
            const data = {
              data: {
                cartOpen: !cartOpen
              }
            };
            apolloClient.cache.writeData(data);
            return data;
          }
        }
      },
      defaults: {
        cartOpen: false
      }
    }
  });
}

export default withApollo(createClient);
