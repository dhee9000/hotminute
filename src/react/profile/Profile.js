import React from 'react';
import { View, Image, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';

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

const { height, width } = Dimensions.get('screen');

class Profile extends React.Component {

    state = {
        fname: '',
        lname: '',
        occupation: '',
        bio: '',
        dob: new Date(),
        interests: [],
        images: {},

        showSettings: false,
    }

    async componentDidMount() {
        let { uid } = auth().currentUser;
        let profileRef = firestore().collection('profiles').doc(uid);
        let profileSnapshot = await profileRef.get();

        if (!profileSnapshot.exists) {
            this.props.navigation.navigate('CreateProfileBio');
        }

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

        this.setState({
            fname: profileData.fname,
            lname: profileData.lname,
            occupation: profileData.occupation,
            bio: profileData.bio,
            dob: profileData.dob.toDate(),
            interests: profileData.interests,
            images: processedImages,
        })
    }

    showSettingsMenu = () => {
        this.setState({ showSettings: true });
    }

    logoutPressed = async () => {
        await auth().signOut();
        this.props.navigation.navigate('Start');
    }

    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1 }}>
                <View style={{ padding: 16.0, flex: 1 }}>
                    <View style={{ paddingTop: 16.0, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 24.0 }}>profile</Text>
                    </View>
                    <TouchableOpacity onPress={this.showSettingsMenu}>
                        <Icon name={'settings'} size={32} color={Colors.textLightGray} />
                    </TouchableOpacity>
                    <ScrollView style={{ flex: 1, marginTop: 16.0 }} contentContainerStyle={{ alignItems: 'center' }}>
                        <Image source={{ uri: this.state.images[Object.keys(this.state.images)[0]] ? this.state.images[Object.keys(this.state.images)[0]].uri : BLANK_IMAGE_URI }} resizeMode={'cover'} style={{ height: IMG_DIM, width: IMG_DIM, backgroundColor: Colors.primary, borderRadius: IMG_DIM / 2, margin: 2.0 }} />
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 28.0, marginTop: 16.0, }}>{this.state.fname} {this.state.lname}</Text>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', width: '100%', marginVertical: 16.0 }}>
                            {Object.keys(this.state.images).map(key => (
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('ViewImage', { imageUri: this.state.images[key].uri })} key={key}>
                                    <Image source={{ uri: this.state.images[key].uri }} resizeMode={'cover'} style={{ height: 120, width: 120, backgroundColor: Colors.primary, borderRadius: 8, margin: 2.0 }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
                <Modal visible={this.state.showSettings} transparent animated animationType={'slide'}>
                    <View style={{ justifyContent: 'flex-start', marginTop: height / 2, backgroundColor: Colors.background, flex: 1, elevation: 4.0 }}>
                        <TouchableOpacity onPress={() => this.setState({ showSettings: false })}>
                            <Icon name={'arrow-drop-down'} size={32} color={Colors.primary} />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 28.0, alignSelf: 'center', marginBottom: 16.0 }}>Settings</Text>
                        <View>
                            <Button title={'Log Out'} onPress={this.logoutPressed} />
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);