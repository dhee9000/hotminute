import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, Alert } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Colors, Fonts } from '../../config';

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

class Chats extends React.Component {

    state = {
        chats: [],
        matches: [],
        matchesToDisplay: [],
    }

    componentDidMount() {
        this.getChats();
        this.getMatches();
    }

    getChats = async () => {
        let snapshotA = await firestore().collection('chats').where('uid1', '==', auth().currentUser.uid).get();
        let snapshotB = await firestore().collection('chats').where('uid2', '==', auth().currentUser.uid).get();

        let chats = [];
        snapshotA.docs.forEach(doc => chats.push({ ...doc.data(), id: doc.id }));
        snapshotB.docs.forEach(doc => chats.push({ ...doc.data(), id: doc.id }));

        this.setState({ chats });
    }

    getMatches = async () => {
        // Get Matches
        let matchesSnapshotA = await firestore().collection('matches').where('uid1', '==', auth().currentUser.uid).get();
        let matchesSnapshotB = await firestore().collection('matches').where('uid2', '==', auth().currentUser.uid).get();

        let matches = [];
        matchesSnapshotA.docs.forEach(doc => matches.push({ ...doc.data(), id: doc.id }));
        matchesSnapshotB.docs.forEach(doc => matches.push({ ...doc.data(), id: doc.id }));

        // Get Profiles of Matches
        let matchesFinal = [];
        let matchesPromises = [];

        await Promise.all(matches.map(match => {
            let otherUid = match.uid1 == auth().currentUser.uid ? match.uid2 : match.uid1;

            let matchData = match;
            let profileData = {};
            let imageUrl = '';

            return firestore().collection('profiles').doc(otherUid).get()
                .then(snapshot => {
                    profileData = snapshot.data();
                    return snapshot;
                })
                .then(async snapshot => {
                    imageUrl = await storage().ref(snapshot.data().images["1"].ref).getDownloadURL();
                    console.log(imageUrl);
                    return true;
                })
                .then(success => {
                    matchesFinal.push({ ...matchData, ...profileData, imageUrl});
                })
        }));

        this.setState({matches: matchesFinal});
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevState.matches != this.state.matches) {
            let matchesToDisplay = this.state.matches.filter(match => {

                let uid = auth().currentUser.uid;
                let otherUid = match.uid1 == uid ? match.uid2 : match.uid1;
                let uidInChats = this.state.chats.find(chat => {
                    return chat.uid1 == otherUid || chat.uid2 == otherUid;
                });

                return uidInChats === undefined;

            });
            this.setState({ matchesToDisplay });
        }
    }

    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1 }}>
                <View style={{ paddingTop: 16.0, paddingLeft: 16.0 }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 32.0 }}>Chats</Text>
                </View>
                <View>
                    <FlatList
                        horizontal
                        data={this.state.matchesToDisplay}
                        renderItem={Match}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={<Text style={{ color: Colors.textLightGray, alignSelf: 'center', textAlign: 'center', marginHorizontal: 16.0 }}>No matches found.</Text>}
                    />
                </View>
                <View>
                    <FlatList
                        ListEmptyComponent={<Text style={{ color: Colors.textLightGray, alignSelf: 'center', textAlign: 'center', marginHorizontal: 16.0 }}>No chats found. Start matching to find people to chat with!</Text>}
                        data={this.state.chats}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => {
                            return (
                                <TouchableOpacity>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8.0, elevation: 2.0 }}>
                                        <Image source={{ uri: item.displayImageURL }} style={{ height: 48, width: 48, borderRadius: 24, marginRight: 8.0 }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: Fonts.heading, fontSize: 18.0 }}>{item.fname} {item.lname}</Text>
                                            <Text style={{ fontSize: 14.0, color: Colors.textLightGray }} numberOfLines={1}>{item.mostRecentMessage}</Text>
                                        </View>
                                        <Text style={{ color: Colors.textLightGray }}>1d</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                    />
                </View>
            </View>
        )
    }
}

const Match = props => {
    const { item } = props;
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', margin: 8.0, marginTop: 0 }}>
            <Image source={{ uri: item.imageUrl ? item.imageUrl : BLANK_IMAGE_URI }} style={{ borderRadius: 32, height: 64, width: 64, borderWidth: 2.0, borderColor: Colors.primary }} />
            <Text numberOfLines={2} style={{ maxWidth: 64.0, fontSize: 12.0, textAlign: 'center' }}>{item.fname}{'\n'}{item.lname}</Text>
        </View>
    )
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Chats);