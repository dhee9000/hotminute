import ApolloClient, { gql } from 'apollo-boost';

import auth from '@react-native-firebase/auth';

const client = new ApolloClient({
    uri: 'https://192.168.1.18/graphql',
    request: async (operation) => {
      const token = await auth().currentUser.getIdToken();
      operation.setContext({
        headers: {
          authorization: token ? `${token}` : ''
        }
      })
    }
});

export default client;