import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, Modal, Dimensions } from 'react-native';

import { Text, TabBar } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Colors, Fonts } from '../../config';

import { TabView, SceneMap } from 'react-native-tab-view';

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth, { firebase } from '@react-native-firebase/auth';

import Animated from 'react-native-reanimated';
import { Button } from 'react-native-elements';

import { MatchesView, ChatsView } from './components';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const { height, width } = Dimensions.get('screen');

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

    renderTabScene = ({ route, focused }) => {
        switch (route.key) {
            case 'matches': {
                return (<MatchesView navigation={this.props.navigation} />)
            }
            case 'chats': {
                return (<ChatsView navigation={this.props.navigation} />)
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        //TODO: go to matches when navigating here to see matches
        // if (prevProps != this.props) {
        //     let screen = this.props.navigation.getParam('screen', -1);
        //     if (screen != -1) {
        //         this.setState({ tabIdx: screen });
        //         this.props.navigation.setParams({screen: null});
        //     }
        // }
    }



    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1, paddingTop: 32.0 }}>
                <TabView
                    navigationState={{ index: this.state.tabIdx, routes: this.state.routes }}
                    renderScene={this.renderTabScene}
                    renderTabBar={props => <TabBar {...props} onChangeTab={i => this.setState({ tabIdx: i })} />}
                    onIndexChange={idx => this.setState({ tabIdx: idx })}
                    swipeEnabled={false}
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

export default connect(mapStateToProps, mapDispatchToProps)(Chats);