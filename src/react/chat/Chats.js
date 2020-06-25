import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Colors, Fonts } from '../../config';

import { TabView, SceneMap } from 'react-native-tab-view';

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

import Animated from 'react-native-reanimated';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

generateCombinedDocId = function (uid1, uid2) {
    if (uid1.localeCompare(uid2) < 0) {
        return `${uid1}_${uid2}`;
    }
    else if (uid1.localeCompare(uid2) > 0) {
        return `${uid2}_${uid1}`;
    }
    else {
        throw (new Error("cannot create combined id for same user"));
    }
}

class Chats extends React.Component {

    state = {
        tabIdx: 0,
        routes: [
            { key: 'matches', title: 'matches' },
            { key: 'chats', title: 'chats' },
        ]
    }

    renderTabScene = ({route, focused}) => {
        switch(route.key){
            case 'matches': {
                return (<ConnectedMatchesView navigation={this.props.navigation} />)
            }
            case 'chats': {
                return (<ConnectedChatsView navigation={this.props.navigation} />)
            }
        }
    }

    _renderTabBar = props => {
        const inputRange = props.navigationState.routes.map((x, i) => i);

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                {props.navigationState.routes.map((route, i) => {
                    const color = Animated.color(
                        Animated.round(
                            Animated.interpolate(props.position, {
                                inputRange,
                                outputRange: inputRange.map(inputIndex =>
                                    inputIndex === i ? 255 : 230
                                ),
                            })
                        ),
                        Animated.round(
                            Animated.interpolate(props.position, {
                                inputRange,
                                outputRange: inputRange.map(inputIndex =>
                                    inputIndex === i ? 255 : 52
                                ),
                            })
                        ),
                        Animated.round(
                            Animated.interpolate(props.position, {
                                inputRange,
                                outputRange: inputRange.map(inputIndex =>
                                    inputIndex === i ? 255 : 98
                                ),
                            })
                        )
                    );

                    const backgroundColor = Animated.color(
                        Animated.round(
                            Animated.interpolate(props.position, {
                                inputRange,
                                outputRange: inputRange.map(inputIndex =>
                                    inputIndex === i ? 230 : 255
                                ),
                            })
                        ),
                        Animated.round(
                            Animated.interpolate(props.position, {
                                inputRange,
                                outputRange: inputRange.map(inputIndex =>
                                    inputIndex === i ? 52 : 255
                                ),
                            })
                        ),
                        Animated.round(
                            Animated.interpolate(props.position, {
                                inputRange,
                                outputRange: inputRange.map(inputIndex =>
                                    inputIndex === i ? 98 : 255
                                ),
                            })
                        )
                    );

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => this.setState({ tabIdx: i })}>
                            <Animated.View style={{ backgroundColor, paddingVertical: 4.0, paddingHorizontal: 8.0, borderRadius: 24.0 }}>
                                <Animated.Text style={{ color, fontSize: 16.0, fontFamily: Fonts.heading }}>{route.title}</Animated.Text>
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };



    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1, paddingTop: 32.0 }}>
                <TabView
                    navigationState={{ index: this.state.tabIdx, routes: this.state.routes }}
                    renderScene={this.renderTabScene}
                    renderTabBar={this._renderTabBar}
                    onIndexChange={idx => this.setState({ tabIdx: idx })}
                    swipeEnabled={false}
                />
            </View>
        )
    }
}

class MatchesView extends React.Component {

    state = {
        matches: [],
    }

    componentDidMount() {
        // TODO: Remove this line
        this.props.getProfile(auth().currentUser.uid);
        //  Matches Listeners
        firestore().collection('matches').where('uids', 'array-contains', auth().currentUser.uid).onSnapshot(snapshot => {
            this.onMatchesUpdated(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
    }

    onMatchesUpdated = async matchesData => {

        // Get Profiles of Matches
        let matches = [];

        matchesData.map(match => {

            let otherUid = match.uids.filter(uid => uid != auth().currentUser.uid)[0];
            let matchData = match;

            this.props.getProfile(otherUid);

            matches.push({ ...matchData, uid: otherUid });

        });

        this.setState({ matches });

    }

    matchClicked = (matchId) => {
        
        let relatedMatch = this.state.matches.filter(match => match.id === matchId)[0];
        let otherUid = relatedMatch.uids.filter(uid => uid != auth().currentUser.uid)[0];
        
        this.props.navigation.push('ProfileView', {uid: otherUid});
    }

    renderMatch = ({ item }) => {

        if (this.props.profilesById[item.uid].loaded) {
            let profile = this.props.profilesById[item.uid];
            return (
                <TouchableOpacity onPress={() => { this.matchClicked(item.id) }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', margin: 8.0, marginTop: 0 }}>
                        <Image source={{ uri: profile.images["1"] ? profile.images["1"].url : BLANK_IMAGE_URI }} style={{ borderRadius: 32, height: 64, width: 64, borderWidth: 2.0, borderColor: Colors.primary }} />
                        <Text numberOfLines={2} style={{ maxWidth: 64.0, fontSize: 12.0, textAlign: 'center' }}>{profile.fname}{'\n'}{profile.lname}</Text>
                    </View>
                </TouchableOpacity>
            );
        }
        else {
            return (
                <ActivityIndicator />
            )
        }
    }

    render() {
        return (
            <View style={{paddingTop: 16.0}}>
                <FlatList
                    horizontal
                    data={this.state.matches}
                    renderItem={this.renderMatch}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={{ color: Colors.textLightGray, alignSelf: 'center', textAlign: 'center', marginHorizontal: 16.0 }}>No matches found.</Text>}
                />
            </View>
        )
    }
}

class ChatsView extends React.Component {

    state = {
        chats: [],
    }

    componentDidMount() {
        // TODO: Remove this line
        this.props.getProfile(auth().currentUser.uid);

        // Chats Listeners
        firestore().collection('chats').where('uids', 'array-contains', auth().currentUser.uid).onSnapshot(snapshot => {
            this.onChatsUpdated(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
    }

    onChatsUpdated = chats => {
        chats = chats.map(chat => {
            let otherUid = chat.uids.filter(uid => uid != auth().currentUser.uid)[0];
            return { ...chat, uid: otherUid }
        })

        console.log(chats);
        this.setState({ chats });
    }

    chatClicked = (chatId, userId) => {
        this.props.navigation.navigate('ChatView', { chatId, userId });
    }


    renderChat = ({ item }) => {
        if (this.props.profilesById[item.uid].loaded) {
            let profile = this.props.profilesById[item.uid];
            return (
                <TouchableOpacity onPress={() => this.chatClicked(item.id, item.uid)}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8.0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={{ uri: profile.images["1"] ? profile.images["1"].url : BLANK_IMAGE_URI }} style={{ borderRadius: 16, height: 32, width: 32, }} />
                            <View style={{ justifyContent: 'center', alignItems: 'flex-start', padding: 8.0 }}>
                                <Text numberOfLines={2} style={{ fontSize: 16.0, textAlign: 'center' }}>{profile.fname} {profile.lname}</Text>
                                <Text style={{ fontSize: 10.0 }}>{item.lastMessageBy == auth().currentUser.uid ? 'You' : profile.fname}: {item.lastMessage}</Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 16.0, color: Colors.textLightGray, }}>1d</Text>
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
            <View style={{paddingTop:16.0}}>
                <FlatList
                    ListEmptyComponent={<Text style={{ color: Colors.textLightGray, alignSelf: 'center', textAlign: 'center', marginHorizontal: 16.0 }}>No chats found. Start matching to find people to chat with!</Text>}
                    data={this.state.chats}
                    keyExtractor={item => item.id}
                    renderItem={this.renderChat}
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

const ConnectedMatchesView = connect(mapStateToProps, mapDispatchToProps)(MatchesView);
const ConnectedChatsView = connect(mapStateToProps, mapDispatchToProps)(ChatsView);

export default connect(mapStateToProps, mapDispatchToProps)(Chats);