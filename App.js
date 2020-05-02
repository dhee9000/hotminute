import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';

import { Colors, Firebase } from './src/config';

import { RootNavigator } from './src/react/navigation';
import { createAppContainer } from 'react-navigation';

import { Provider } from 'react-redux';
import { createReduxStore } from './src/redux';

import { AppRegistry } from 'react-native';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

import firebase from '@react-native-firebase/app';

try{
 firebase.initializeApp(Firebase);
}
catch(e){
  console.log("Firebase Init Error: ", e);
}

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink(
    {
      uri: 'http://your.graphql.url/graphql'
    })
  });

import { ThemeProvider } from 'react-native-elements';

import * as Font from 'expo-font';

const appState = createReduxStore();
const AppContainer = createAppContainer(RootNavigator);

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
