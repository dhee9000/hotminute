import React from 'react';
import { View, TextInput, Image, Dimensions, ActivityIndicator, KeyboardAvoidingView } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';
import { GiftedChat } from 'react-native-gifted-chat';

import { Input, Icon } from 'react-native-elements';

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { TouchableOpacity } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('screen');

class ChatView extends React.Component {

    state = {
        chatId: undefined,
        userId: undefined,
    }

    componentDidMount() {
        let chatId = this.props.navigation.getParam('chatId', undefined)
        let userId = this.props.navigation.getParam('userId', undefined);
        if (!chatId || !userId) {
            this.props.navigation.pop();
            return;
        }
        this.setState({ chatId, userId });
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

    onContentSizeChange = (e) => {
        const { contentSize } = e.nativeEvent;
        // Support earlier versions of React Native on Android.
        if (!contentSize) {
            return;
        }
        if (!this.contentSize ||
            (this.contentSize &&
                (this.contentSize.width !== contentSize.width ||
                    this.contentSize.height !== contentSize.height))) {
            this.contentSize = contentSize;
            this.props.onInputSizeChanged(this.contentSize);
        }
    };
    onChangeText = (text) => {
        this.props.onTextChanged(text);
    };

    renderComposer = props => {
        return (
            <TextInput
                accessible accessibilityLabel={props.placeholder}
                placeholder={'type a message...'}
                multiline={props.multiline}
                editable={!props.disableComposer}
                onChangeText={text => props.onTextChanged(text)}
                style={{
                    padding: 16.0,
                    borderRadius: 32.0,
                    backgroundColor: '#fff2f6',
                    color: Colors.primary,
                    fontFamily: Fonts.primary,
                }}
                selectionColor={Colors.primaryLight}
                placeHolderTextColor={Colors.primary}
                autoFocus={props.textInputAutoFocus}
                value={props.text}
                enablesReturnKeyAutomatically
                underlineColorAndroid='transparent'
                keyboardAppearance={props.keyboardAppearance}
                {...props.textInputProps} />);
    }

    renderSend = props => {
        const { text, alwaysShowSend } = props;
        let hasText = text.trim().length > 0;
        return (
            <TouchableOpacity disabled={!hasText} onPress={() => props.onSend({ text: text.trim() }, true)}>
                <View style={{ justifyContent: 'center', alignItems: 'center', height: 48.0, width: 48.0, borderRadius: 24.0, backgroundColor: hasText ? Colors.primary : '#fff2f6', borderWidth: 1.0, borderColor: Colors.primary }}>
                    <Icon name={'arrow-upward'} color={hasText ? Colors.background : Colors.primary} />
                </View>
            </TouchableOpacity>
        )
    }

    renderInputToolbar = props => {
        return (
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16.0, }}>
                <View style={{ flex: 5 }}>
                    {this.renderComposer(props)}
                </View>
                <View style={{ flex: 1 }}>
                    {this.renderSend(props)}
                </View>
            </View>
        )
    }

    renderMessageText = props => {
        return (
            <View>
                <Text style={{ color: props.position === 'right' ? Colors.text : Colors.primary, padding: 8.0 }}>{props.currentMessage.text}</Text>
            </View>
        )
    }

    renderBubble = props => {
        return (
            <View style={{ backgroundColor: props.position === 'right' ? Colors.primary : Colors.white, borderRadius: 8.0, marginRight: props.position === 'left' ? 60.0 : 0, marginLeft: props.position === 'right' ? 60.0 : 0 }}>
                {this.renderMessageText(props)}
            </View>
        )
    }

    render() {

        let profile = this.state.userId ? this.props.profilesById[this.state.userId] : {};
        let name = this.state.userId ? profile.fname + " " + profile.lname : '';

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>

                {this.state.chatId ?
                    <>
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 144.0, elevation: 2.0, zIndex: 2, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: width - 64, borderRadius: 64.0, height: 64.0, backgroundColor: Colors.background, shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16.0, }}>
                                <TouchableOpacity onPress={this.props.navigation.pop}>
                                    <Icon name={'chevron-left'} size={32} color={'#f55'} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 24.0, color: Colors.text }}>{name}</Text>
                                <TouchableOpacity onPress={() => this.props.navigation.push('ProfileView', { uid: this.state.userId })}>
                                    <Icon name={'info'} color={Colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <GiftedChat
                            messages={this.props.chatsById[this.state.chatId].messages.allIds.map(id => {
                                
                                console.log("MESSAGES", this.props.chatsById[this.state.chatId].messages);
                                let message = this.props.chatsById[this.state.chatId].messages.byId[id];

                                console.log("MESSAGE", message);

                                return {
                                    _id: message.id,
                                    user: {
                                        _id: message.sentBy,
                                        name: this.props.profilesById[message.sentBy].fname + " " + this.props.profilesById[message.sentBy].lname,
                                        avatar: this.props.profilesById[message.sentBy].images["1"].url,
                                    },
                                    text: message.text,
                                }
                            }).reverse()}
                            onSend={this.onSend}
                            renderInputToolbar={this.renderInputToolbar}
                            renderBubble={this.renderBubble}
                            messagesContainerStyle={{}}
                            minInputToolbarHeight={0}
                            renderFooter={() => <View style={{ height: 90 }} />}
                            showUserAvatar
                            onPressAvatar={() => this.props.push('ProfileView', { uid: this.state.userId })}
                            user={{
                                _id: auth().currentUser.uid,
                                name: this.props.profilesById[auth().currentUser.uid].fname + " " + this.props.profilesById[auth().currentUser.uid].lname
                            }}
                        />
                    </>
                    : <ActivityIndicator />}
            </View>
        )
    }
}

const mapStateToProps = state => ({
    profileIds: state.profiles.allIds,
    profilesById: state.profiles.byId,

    chatIds: state.chats.allIds,
    chatsById: state.chats.byId,
});

const mapDispatchToProps = dispatch => ({
    getProfile: uid => dispatch({ type: ActionTypes.FETCH_PROFILE.REQUEST, payload: uid }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);