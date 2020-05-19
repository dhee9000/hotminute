import React from 'react';
import {StyleSheet, View, Text, ImageBackground, ScrollView, TextInput} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { MessageInput } from './MessageInput';
import { Header } from './Header';
import { Message } from './Message';

import { data } from '../mocks/data';

const styles = StyleSheet.create({
    scrollContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    scrollContent: {
      flex: 1,
      alignSelf: 'stretch',
      justifyContent: 'flex-end'
    }
  });


export const Chatting = ({selectedId, selectId}) => (
  <View style={{flex: 1}}>
    <Header selectedId={selectedId} selectId={selectId} data={data} />
    <View style={{flex: 1}}>
      <ImageBackground source={{require('../mocks/images/background.jpg')}} style={{flex: 1, width: null}}>
 <ScrollView bounces={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {data[selectedId].messages.map((message, i) => <Message message={message} key={i} />)}
  </ScrollView>
 <MessageInput />
 </ImageBackground>
</View>
  </View>
);

