import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';

import { Colors } from './src/config';

import { RootNavigator } from './src/react/navigation';
import { createAppContainer } from 'react-navigation';

import { Provider } from 'react-redux';
import { createReduxStore } from './src/redux';

import * as Font from 'expo-font';

const appState = createReduxStore();
const AppContainer = createAppContainer(RootNavigator);

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

  if(fontsLoaded){
    return (
      <View style={{flex: 1}}>
            <StatusBar barStyle={'light-content'} translucent />
            <SafeAreaView style={{flex: 1, backgroundColor: Colors.primary, paddingTop: StatusBar.currentHeight}}>
              <Provider store={appState} style={{flex: 1}}>
                <AppContainer style={{flex: 1}} />
              </Provider>
            </SafeAreaView>
        </View>
    );
  }
  else{
    return(
      <View />
    )
  }
}
