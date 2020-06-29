import React from 'react';
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Colors, Fonts } from '../../config';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const IMG_DIM = 128;

const TEST_INTERESTS = ["Dance", "Movies", "Bollywood", "TikTok", "Science", "Programming", "Comedy"];

import { Button, Icon } from 'react-native-elements';

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


class ProfileView extends React.Component {

    state = {
        fname: '',
        lname: '',
        occupation: '',
        bio: '',
        dob: new Date(),
        interests: [],
        images: {},
        chatExists: true,
        uid: '',
    }

    async componentDidMount() {
        let uid = this.props.navigation.getParam('uid', undefined);
        if (!uid) {
            this.props.navigation.pop();
            return;
        }
        this.setState({ uid });
        let profileRef = firestore().collection('profiles').doc(uid);
        let profileSnapshot = await profileRef.get();

        let profileData = profileSnapshot.data();

        let processedImages = {};

        Object.keys(profileData.images).map(async (id) => {

            let image = profileData.images[id];
            let downloadURL = await storage().ref(image.ref).getDownloadURL();

            processedImages[id] = {
                ...image,
                uri: downloadURL,
            }

            this.setState({ images: processedImages });
        });

        let chatDoc = await firestore().collection('chats').doc(generateCombinedDocId(auth().currentUser.uid, uid)).get();

        this.setState({
            fname: profileData.fname,
            lname: profileData.lname,
            occupation: profileData.occupation,
            bio: profileData.bio,
            dob: profileData.dob.toDate(),
            interests: profileData.interests,
            images: processedImages,
            chatExists: chatDoc.exists,
        });
    }

    createChatPressed = async () => {
        await firestore().collection('chats').doc(generateCombinedDocId(auth().currentUser.uid, this.state.uid)).set({
            uids: [auth().currentUser.uid, this.state.uid],
        });
        this.props.navigation.navigate('ChatView', { chatId: generateCombinedDocId(auth().currentUser.uid, this.state.uid), userId: this.state.uid });
    }

    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1 }}>
                <View style={{ padding: 16.0, flex: 1 }}>
                    <View style={{ flexDirection: 'row', paddingTop: 16.0, alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity onPress={() => this.props.navigation.pop()}>
                                <Text style={{ color: '#f55', fontSize: 32.0 }}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 24.0 }}>match</Text>
                        </View>
                        <View style={{ flex: 1 }} />
                    </View>

                    <ScrollView style={{ flex: 1, marginTop: 16.0 }} contentContainerStyle={{ alignItems: 'center' }}>
                        <Image source={{ uri: this.state.images[Object.keys(this.state.images)[0]] ? this.state.images[Object.keys(this.state.images)[0]].uri : BLANK_IMAGE_URI }} resizeMode={'cover'} style={{ height: IMG_DIM, width: IMG_DIM, backgroundColor: Colors.primary, borderRadius: IMG_DIM / 2, margin: 2.0 }} />
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 32.0, marginTop: 16.0, textAlign: 'center' }}>{this.state.fname}{'\n'}{this.state.lname}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            {!this.state.chatExists && <Button title={'Start Chat'} onPress={this.createChatPressed} />}
                            <Button icon={<Icon name={'message'} color={Colors.background} />} containerStyle={{ margin: 4.0 }} />
                            <Button icon={<Icon name={'more-horiz'} color={Colors.primary} />} type={'outline'} containerStyle={{ margin: 4.0 }} />
                        </View>
                        <Text style={{ fontSize: 18, color: Colors.textLightGray }}>{new Date().getFullYear() - this.state.dob.getFullYear()}</Text>
                        <Text style={{ fontSize: 18, color: Colors.textLightGray }}>{this.state.occupation}</Text>
                        <Text style={{ fontSize: 18, color: Colors.textLightGray }}>{this.state.bio}</Text>
                        <Text style={{ alignSelf: 'flex-start', fontFamily: Fonts.heading }}>Interests</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', width: '100%', marginVertical: 8.0 }}>
                            {this.state.interests.map(interest => (
                                <View key={interest} style={{ backgroundColor: Colors.primary, paddingHorizontal: 8.0, borderRadius: 16.0, margin: 2.0 }}>
                                    <Text style={{ color: Colors.background }}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={{ alignSelf: 'flex-start', fontFamily: Fonts.heading, marginTop: 16.0 }}>Pictures</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                            {Object.keys(this.state.images).map(key => (
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('ViewImage', {imageUri: this.state.images[key].uri})}>
                                    <Image key={key} source={{ uri: this.state.images[key].uri }} resizeMode={'cover'} style={{ height: 120, width: 120, backgroundColor: Colors.primary, borderRadius: 8, margin: 2.0 }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);