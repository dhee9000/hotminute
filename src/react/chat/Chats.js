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

        // Chats Listeners
        firestore().collection('chats').where('uids', 'array-contains', auth().currentUser.uid).onSnapshot(snapshot => {
            this.onChatsUpdated(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
        });

        //  Matches Listeners
         firestore().collection('matches').where('uids', 'array-contains', auth().currentUser.uid).onSnapshot(snapshot => {
             this.onMatchesUpdated(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})));
         });
    }

    onChatsUpdated = chats => {
        this.setState({chats});
    }

    onMatchesUpdated = async matchesData => {

        // Get Profiles of Matches
        let matches = [];

        await Promise.all(matchesData.map(match => {
            let otherUid = match.uids.filter(uid => uid != auth().currentUser.uid)[0];

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
                    return true;
                })
                .then(success => {
                    matchesFinal.push({ ...matchData, ...profileData, imageUrl });
                })
        }));

        this.setState({ matches });

    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevState.matches != this.state.matches) {
            let matchesToDisplay = this.state.matches.filter(match => {

                let uid = auth().currentUser.uid;
                let otherUid = match.uids.filter(uid => uid != auth().currentUser.uid)[0];
                let uidInChats = this.state.chats.find(chat => {
                    return chat.uids.includes(otherUid)
                });

                return uidInChats === undefined;

            });
            this.setState({ matchesToDisplay });
        }
    }

    matchClicked = (matchId) => {
        
        let relatedMatch = this.state.matchesToDisplay.filter(match => match.id === matchId)[0];
        let otherUid = relatedMatch.uid1 === auth().currentUser.uid ? relatedMatch.uid2 : relatedMatch.uid1;

        firestore().collection('chats').add({
            uid1: auth().currentUser.uid,
            uid2: otherUid,
            
        });
    }

    renderMatch = ({item}) => {
        return (
            <TouchableOpacity onPress={() => {this.matchClicked(item.id)}}>
                <View style={{ alignItems: 'center', justifyContent: 'center', margin: 8.0, marginTop: 0 }}>
                    <Image source={{ uri: item.imageUrl ? item.imageUrl : BLANK_IMAGE_URI }} style={{ borderRadius: 32, height: 64, width: 64, borderWidth: 2.0, borderColor: Colors.primary }} />
                    <Text numberOfLines={2} style={{ maxWidth: 64.0, fontSize: 12.0, textAlign: 'center' }}>{item.fname}{'\n'}{item.lname}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderChat = ({item}) => {
        return (
            <TouchableOpacity onPress={() => this.chatClicked(item.id)}>
                <View>
                    <Image source={{ uri: item.imageUrl ? item.imageUrl : BLANK_IMAGE_URI }} style={{ borderRadius: 32, height: 64, width: 64, borderWidth: 2.0, borderColor: Colors.primary }} />
                    <Text numberOfLines={2} style={{ maxWidth: 64.0, fontSize: 12.0, textAlign: 'center' }}>{item.fname} {item.lname}</Text>
                </View>
            </TouchableOpacity>
        )
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
                        renderItem={this.renderMatch}
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

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Chats);