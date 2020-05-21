import React from 'react';
import {StyleSheet, View, Text, ImageBackground, ScrollView, TextInput} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { MessageInput } from './MessageInput';
import { Header } from './Header';
import { Message } from './Message';


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

  

  class Chatting extends Component{

    state = {
      chat: '',
    }

    componentDidMount(){
      this.chatSent = this.props.getMessagesQuery.subscribeToMore({
        document: chatSentSubscription,
        updateQuery: (previousState, {subscriptionData}) => {
          const newChat = subscriptionData.data.Chat.node
          const chat = previousState.getMessages.concat([chatSent])
          return{
            getMessages: chats
          }
        },
        onError: (err) => console.error(err),
      })
    }

    render(){
      return(
        Chatting = ({selectedId, selectId}) => (
          <View style={{flex: 1}}>
            <Header selectedId={selectedId} selectId={selectId} data={data} />
            <View style={{flex: 1}}>
              <ImageBackground source={{require('../mocks/images/background.jpg')}} style={{flex: 1, width: null}}>
         <ScrollView bounces={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                  {data[selectedId].messages.map((message, i) => <Message message={message} key={i} />)}
          </ScrollView>
         <MessageInput
            chat={this.state.chat}
            onTextInput={(chat) => this.SetState({chat})}
            onResetText={() => this.SetState({chat: ''})} 
            onSend={this.onSend}/>
         </ImageBackground>
        </View>
          </View>
        )
        
      )
    }

    onSend = () => {
      console.log(`Send: ${this.state.chat}`)
      this.props.sendChatMutation({
        variable: {
          body: this.state.chat,
          from: this.props.id
        }
      })
    }

    _endRef = (element) => {
      this.endRef = element
    }

    componentDidUpdate(prevProps) {
      if(prevProps.getMessagesQuery.getMessages !== this.props.getMessagesQuery.getMessages && this.endRef) {
        this.endRef.scrollIntoView()
      }
    }

   }

