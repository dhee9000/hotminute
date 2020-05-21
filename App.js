import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';

import { Colors, Firebase } from './src/config';

import { RootNavigator } from './src/react/navigation';
import { createAppContainer } from 'react-navigation';

import { Provider } from 'react-redux';
import { createReduxStore } from './src/redux';

import ApolloClient, { gql } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

import auth from '@react-native-firebase/auth';

const client = new ApolloClient({
      uri: 'http://192.168.1.18/graphql',
      request: (operation) => {
        const token = auth().currentUser.getIdToken();
        operation.setContext({
          headers: {
            authorization: token ? `Bearer ${token}` : ''
          }
        })
      }
});


const appState = createReduxStore();
const AppContainer = createAppContainer(RootNavigator);

import { ThemeProvider } from 'react-native-elements';
import * as Font from 'expo-font';

const theme = {
  colors: {
    primary: Colors.primary,
  }
}

export default function App() {

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync('Poppins', require('./assets/fonts/Poppins/Poppins-Regular.ttf'));
      await Font.loadAsync('PoppinsBold', require('./assets/fonts/Poppins/Poppins-Bold.ttf'));
      await Font.loadAsync('PoppinsSemiBold', require('./assets/fonts/Poppins/Poppins-SemiBold.ttf'));
      await Font.loadAsync('PoppinsLight', require('./assets/fonts/Poppins/Poppins-Light.ttf'));
    }
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  if (fontsLoaded) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} translucent />
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
          <ApolloProvider client={client}>
            <Provider store={appState} style={{ flex: 1 }}>
              <ThemeProvider theme={theme} style={{ flex: 1 }}>
                <AppContainer style={{ flex: 1 }} />
              </ThemeProvider>
            </Provider>
          </ApolloProvider>
          <AlphaWarning />
        </SafeAreaView>
      </View>
    );
  }
  else {
    return (
      <View />
    )
  }
}

const AlphaWarning = props => (
  <View style={{ position: 'absolute', top: 24, left: 0, padding: 2.0, }}>
    <Text style={{ color: '#555', fontSize: 8.0, }}>ALPHA BUILD v0.0.1</Text>
    <Text style={{ color: '#555', fontSize: 8.0, }}>NOT FOR PUBLIC RELEASE</Text>
    <Text style={{ color: '#555', fontSize: 8.0, }}>Hot Minute LLC</Text>
  </View>
)
