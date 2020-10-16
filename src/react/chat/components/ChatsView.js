import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, Modal, Dimensions } from 'react-native';

import { Text, TabBar } from '../../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../../redux/ActionTypes';
import * as States from '../../../redux/ActionTypes';

import { Colors, Fonts } from '../../../config';

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth, { firebase } from '@react-native-firebase/auth';

import { Button } from 'react-native-elements';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const { height, width } = Dimensions.get('screen');

class ChatsView extends React.Component {

    state = {
        chats: [],
    }

    componentDidMount() {
        // Chats Listerners
        this.props.listenChats();
    }

    chatClicked = (chatId, userId) => {
        this.props.navigation.navigate('ChatView', { chatId, userId });
    }


    renderChat = ({ item }) => {

        let uid = this.props.chatsById[item].uids.filter(uid => uid != auth().currentUser.uid)[0];

        if (this.props.profileIds.includes(uid) && this.props.profilesById[uid].loaded) {

            let profile = this.props.profilesById[uid];
            let chat = this.props.chatsById[item];
            let read = !chat.lastMessageAt ? true : !chat.lastOpened ? true : !chat.lastOpened[auth().currentUser.uid] ? true : chat.lastOpened[auth().currentUser.uid].toMillis() >= chat.lastMessageAt.toMillis();

            return (
                <TouchableOpacity onPress={() => this.chatClicked(chat.id, uid)}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8.0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={{ uri: profile.images["1"] ? profile.images["1"].url : BLANK_IMAGE_URI }} style={{ borderRadius: 16, height: 64, width: 64, }} />
                            <View style={{ justifyContent: 'center', alignItems: 'flex-start', padding: 8.0 }}>
                                <Text numberOfLines={2} style={{ fontSize: 20.0, textAlign: 'center', fontFamily: read ? Fonts.primary : Fonts.heading }}>{profile.fname} {profile.lname}</Text>
                                <Text numberOfLines={1} style={{ fontSize: 14.0, fontFamily: read ? Fonts.primary : Fonts.heading, maxWidth: width/2 }}>{chat.lastMessageBy == auth().currentUser.uid ? 'You' : profile.fname}: {chat.lastMessage}</Text>
                            </View>
                        </View>
                        <View style={{}}>
                            {
                                !read &&
                                <View style={{ height: 16.0, width: 16.0, borderRadius: 8.0, backgroundColor: Colors.primary }} />
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            )
        }
        else {
            return (
                <ActivityIndicator />
            )
        }
    }

    render() {
        return (
            <View style={{ paddingTop: 16.0 }}>
                <FlatList
                    ListEmptyComponent={<Text style={{ color: Colors.textLightGray, alignSelf: 'center', textAlign: 'center', marginHorizontal: 16.0 }}>No chats found. Start matching to find people to chat with!</Text>}
                    data={this.props.chatsIds}
                    keyExtractor={item => item}
                    renderItem={this.renderChat}
                />
            </View>
        )
    }
}

const mapStateToProps = state => ({
    profileIds: state.profiles.allIds,
    profilesById: state.profiles.byId,

    matchesIds: state.matches.allIds,
    matchesById: state.matches.byId,

    chatsIds: state.chats.allIds,
    chatsById: state.chats.byId,
});

const mapDispatchToProps = dispatch => ({
    getProfile: uid => dispatch({ type: ActionTypes.FETCH_PROFILE.REQUEST, payload: uid }),
    listenMatches: () => dispatch({ type: ActionTypes.LISTEN_MATCHES.REQUEST }),
    listenChats: () => dispatch({ type: ActionTypes.LISTEN_CHATS.REQUEST }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatsView);