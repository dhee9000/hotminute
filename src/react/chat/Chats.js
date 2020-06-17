import React from 'react';
import { View, FlatList, Image, TouchableOpacity } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Colors, Fonts } from '../../config';

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const BLANK_IMAGE_URI = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fya-webdesign.com%2Fexplore%2Fsvg-artwork-icon-vector%2F&psig=AOvVaw3ZF6RKqDGx8HUSe1ho4leA&ust=1583049630546000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCLDPxMml9ucCFQAAAAAdAAAAABAD';

class Chats extends React.Component {

    state = {
        chats: [],
        matches: [],
        matchesToDisplay: [],
    }

    async componentDidMount() {
        await this.getChats();
        await this.getMatches();
    }

    getChats = async () => {
        let snapshotA = await firestore().collection('chats').where('uid1', '==', auth().currentUser.uid).get();
        let snapshotB = await firestore().collection('chats').where('uid2', '==', auth().currentUser.uid).get();
        
        let chats = [];
        snapshotA.docs.forEach(doc => chats.push({...doc.data(), id: doc.id}));
        snapshotB.docs.forEach(doc => chats.push({...doc.data(), id: doc.id}));

        this.setState({chats});
    }

    getMatches = async () => {
        let matchesSnapshotA = await firestore().collection('matches').where('uid1', '==', auth().currentUser.uid).get();
        let matchesSnapshotB = await firestore().collection('matches').where('uid2', '==', auth().currentUser.uid).get();
        
        let matches = [];
        matchesSnapshotA.docs.forEach(doc => matches.push({...doc.data(), id: doc.id}));
        matchesSnapshotB.docs.forEach(doc => matches.push({...doc.data(), id: doc.id}));

        this.setState({matches});
    }

    async componentDidUpdate(prevProps, prevState){
        if(prevState.matches != this.state.matches){
            let matchesToDisplay = this.state.matches.filter(match => {

                let uid = auth().currentUser.uid;
                let otherUid = match.uid1 == uid ? match.uid2 : match.uid1;
                let uidInChats = chats.find(chat => {
                    return chat.uid1 == otherUid || chat.uid2 == otherUid;
                });
    
                return uidInChats === -1;
    
            });
            this.setState({matchesToDisplay});
        }
    }

    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1 }}>
                <View style={{ padding: 16.0, }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 32.0 }}>Chats</Text>
                </View>
                <View>
                    <FlatList
                        horizontal
                        data={this.state.matchesToDisplay}
                        contentContainerStyle={{margin:8.0}}
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
                                        <View style={{flex: 1}}>
                                            <Text style={{ fontFamily: Fonts.heading, fontSize: 18.0 }}>{item.fname} {item.lname}</Text>
                                            <Text style={{ fontSize: 14.0, color: Colors.textLightGray }} numberOfLines={1}>{item.mostRecentMessage}</Text>
                                        </View>
                                        <Text style={{color: Colors.textLightGray}}>1d</Text>
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