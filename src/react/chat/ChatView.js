import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';
import { GiftedChat } from 'react-native-gifted-chat';

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

class ChatView extends React.Component {

    state = {
        messages: []
    }

    componentDidMount() {
        let chatId = this.props.navigation.getParam('chatId', undefined)
        if (!chatId) {
            this.props.navigation.pop();
        }
        this.setState({ chatId });
        firestore().collection('chats').doc(chatId).collection('messages').limit(25).orderBy('sentAt', 'desc').onSnapshot(snapshot => {
            
            this.setState({ messages: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) })
        });
    }

    onSend = messages => {
        messages.map(msg => {
            firestore().collection('chats').doc(this.state.chatId).collection('messages').add({
                sentAt: firestore.FieldValue.serverTimestamp(),
                sentBy: auth().currentUser.uid,
                text: msg.text,
            })
        });
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Text onPress={() => this.props.navigation.pop()}>X</Text>
                <GiftedChat
                    messages={this.state.messages}
                    onSend={this.onSend}
                    user={{
                        id: auth().currentUser.uid,
                    }}
                />
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);