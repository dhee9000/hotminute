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

class ChatView extends React.Component{

    state = {
        messages: []
    }

    componentDidMount(){

    }

    onSend = messages => {
        messages = GiftedChat.append(this.state.messages, messages);
        this.setState(messages);
    }

    render(){
        return(
            <View style={{flex: 1}}>
                <Text onPress={() => this.props.navigation.pop()}>X</Text>
                <GiftedChat
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        id: 1,
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