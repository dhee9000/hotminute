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
        let userId = this.props.navigation.getParam('userId', '');
        if (!chatId) {
            this.props.navigation.pop();
        }
        this.setState({ chatId, userId });
        firestore().collection('chats').doc(chatId).collection('messages').limit(25).orderBy('sentAt', 'desc').onSnapshot(snapshot => {
            let messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            messages = messages.map(msg => {
                let senderProfile = this.props.profilesById[msg.sentBy];
                if(senderProfile){
                    return {...msg, _id: msg.id, createdAt: msg.sentAt.toDate(), user: {_id: msg.sentBy, name: `${senderProfile.fname} ${senderProfile.lname}`}}
                }
                else{
                    return {...msg, _id: msg.id, createdAt: msg.sentAt.toDate()};
                }
            })
            this.setState({ messages })
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
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16.0}}>
                    <Text style={{fontFamily: Fonts.heading, color: '#f55', fontSize: 32.0}} onPress={() => this.props.navigation.pop()}>X</Text>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 32, color: Colors.primary}}>{this.state.userId ? this.props.profilesById[this.state.userId].fname + " " + this.props.profilesById[this.state.userId].lname : ''}</Text>
                </View>
                <GiftedChat
                    messages={this.state.messages}
                    onSend={this.onSend}
                    user={{
                        _id: auth().currentUser.uid,
                        name: 'Dheeraj Yalamanchili'
                    }}
                />
            </View>
        )
    }
}

const mapStateToProps = state => ({
    profileIds: state.profiles.allIds,
    profilesById: state.profiles.byId,
});

const mapDispatchToProps = dispatch => ({
    getProfile: uid => dispatch({ type: ActionTypes.FETCH_PROFILE.REQUEST, payload: uid }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);