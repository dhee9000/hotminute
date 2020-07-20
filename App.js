import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, Alert, Dimensions } from 'react-native';

import { Colors, Fonts } from './src/config';

import { RootNavigator } from './src/react/navigation';
import { createAppContainer } from 'react-navigation';

import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from './src/redux';

const appState = createReduxStore();
const AppContainer = createAppContainer(RootNavigator);

import { ThemeProvider } from 'react-native-elements';
import * as Font from 'expo-font';

import RemoteConfig from '@react-native-firebase/remote-config';

const { height, width } = Dimensions.get('screen');

const theme = {
  colors: {
    primary: Colors.primary,
  },
  Button: {
    titleStyle: { fontFamily: Fonts.primary }
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

      await Font.loadAsync('Jost', require('./assets/fonts/Jost/Jost-Regular.ttf'));
      await Font.loadAsync('JostBold', require('./assets/fonts/Jost/Jost-Bold.ttf'));
      await Font.loadAsync('JostSemiBold', require('./assets/fonts/Jost/Jost-SemiBold.ttf'));
      await Font.loadAsync('JostLight', require('./assets/fonts/Jost/Jost-ExtraLight.ttf'));
    }
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    try {
      RemoteConfig().setDefaults(
        {
          supported_region_codes: ['TX']
        }
      )
        .then(RemoteConfig().fetchAndActivate)
        .then(
          activated => {
            if (activated) {
              console.log("Activated Remote Config");
            }
            else {
              console.log("Could not activate Remote Config");
            }
          }
        )
    }
    catch (e) {
      console.log(e);
    }
  })

  if (fontsLoaded) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} translucent />
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
          <ReduxProvider store={appState} style={{ flex: 1 }}>
            <ThemeProvider theme={theme} style={{ flex: 1 }}>
              <AppContainer style={{ flex: 1 }} />
            </ThemeProvider>
          </ReduxProvider>
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
  <>
    <View pointerEvents={'none'} style={{ position: 'absolute', top: 24, left: 0, padding: 2.0, }}>
      <Text style={{ color: '#555', fontSize: 8.0, }}>ALPHA BUILD v0.0.1</Text>
      <Text style={{ color: '#555', fontSize: 8.0, }}>NOT FOR PUBLIC RELEASE</Text>
      <Text style={{ color: '#555', fontSize: 8.0, }}>Hot Minute LLC</Text>
    </View>
    <View pointerEvents={'none'} style={{ position: 'absolute', bottom: 24, right: 0, padding: 2.0, }}>
      <Text style={{ color: '#555', fontSize: 8.0, }}>ALPHA BUILD v0.0.1</Text>
      <Text style={{ color: '#555', fontSize: 8.0, }}>NOT FOR PUBLIC RELEASE</Text>
      <Text style={{ color: '#555', fontSize: 8.0, }}>Hot Minute LLC</Text>
    </View>
  </>
)
