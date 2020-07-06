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

class MatchesView extends React.Component {

    state = {
        matches: [],
    }

    componentDidMount() {
        //  Matches Listeners
        this.props.listenMatches();
    }

    matchClicked = (matchId) => {

        let otherUid = this.props.matchesById[matchId].uids.filter(uid => uid != auth().currentUser.uid)[0];
        this.props.navigation.push('ProfileView', { uid: otherUid });

    }

    unmatchPressed = (matchId) => {
        let otherUid = this.props.matchesById[matchId].uids.filter(uid => uid != auth().currentUser.uid)[0];
        firestore().collection('matches').doc(matchId).delete();
        this.closeMatchMenu();
    }

    reportMatchPressed = (matchId) => {

        let otherUid = this.props.matchesById[matchId].uids.filter(uid => uid != auth().currentUser.uid)[0];

        Alert.prompt(
            'Why are you reporting this user?',
            'Give us a brief description so that we investigate this report. If you don\'t want to report and instead want to block this user, use the block option!',
            text => {
                firestore().collection('reports').add({
                    reportedBy: auth().currentUser.uid,
                    reportedUser: otherUid,
                    reportReason: text,
                    reportedOn: firestore.FieldValue.serverTimestamp(),
                });
            }
        );

        this.unmatchPressed(matchId);

    }

    renderMatch = ({ item }) => {

        let uid = this.props.matchesById[item].uids.filter(uid => uid != auth().currentUser.uid)[0];

        if (this.props.profileIds.includes(uid) && this.props.profilesById[uid].loaded) {
            let profile = this.props.profilesById[uid];
            return (
                <TouchableOpacity onPress={() => { this.matchClicked(item) }} onLongPress={() => { this.matchLongPressed(item) }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', margin: 8.0 }}>
                        <Image blurRadius={4.0} source={{ uri: profile.images["1"] ? profile.images["1"].url : BLANK_IMAGE_URI }} style={{ borderRadius: 8, height: 96, width: '100%' }} />
                        <View style={{ position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'flex-start', padding: 8.0 }}>
                            <Text numberOfLines={2} style={{ fontSize: 24.0, textAlign: 'center', color: Colors.primary, fontFamily: Fonts.heading }}>{profile.fname} {profile.lname}</Text>
                        </View>
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
        let relatedMatch = null;
        let otherUid = null;
        let matchMenuProfile = {};
        if (this.state.showMatchMenu) {
            relatedMatch = this.state.matches.filter(match => match.id === this.state.matchMenuId)[0];
            otherUid = relatedMatch.uids.filter(uid => uid != auth().currentUser.uid)[0];
            matchMenuProfile = this.props.profilesById[otherUid];
        }
        return (
            <View style={{ paddingTop: 16.0 }}>
                <FlatList
                    data={this.props.matchesIds}
                    renderItem={this.renderMatch}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={{ color: Colors.textLightGray, alignSelf: 'center', textAlign: 'center', marginHorizontal: 16.0 }}>No matches found.</Text>}
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

export default connect(mapStateToProps, mapDispatchToProps)(MatchesView);