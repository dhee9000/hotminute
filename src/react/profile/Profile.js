import React from 'react';
import { View, Image, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Colors, Fonts } from '../../config';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import EditProfile from './EditProfile';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const IMG_DIM = 128;

const TEST_INTERESTS = ["Dance", "Movies", "Bollywood", "TikTok", "Science", "Programming", "Comedy"];

const styles = StyleSheet.create({
    button: {
        fontFamily: Fonts.heading,
        color: Colors.primary,
        fontSize: 24,

    }
});

class Profile extends React.Component {



    state = {
        fname: '',
        lname: '',
        occupation: '',
        bio: '',
        dob: new Date(),
        images: {}
    }

    handlePress = () => {
        this.setState({color: 'pink'});
        this.props.navigation.navigate('Edit', {
            fname: this.state.fname,
            lname: this.state.lname,
            occupation: this.state.occupation,
            bio: this.state.bio,
            saveEditProfile: this.saveEditProfile,
        });
    };

    saveEditProfile = async (fname, lname, occupation, bio) => {
        await firestore().collection('profiles').doc(auth().currentUser.uid).set({
            fname: this.state.fname,
            lname: this.state.lname,
            occupation: this.state.occupation,
            bio: this.state.bio,
            
        });
    };

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
            images: processedImages,
        })
    }

    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1 }}>
                <View style={{ padding: 16.0, flex: 1 }}>
                        <View style={{ paddingTop: 16.0, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 24.0 }}>profile</Text>
                        </View>
                    <ScrollView style={{ flex: 1, marginTop: 16.0 }} contentContainerStyle={{ alignItems: 'center' }}>
                        <Image source={{ uri: this.state.images[Object.keys(this.state.images)[0]] ? this.state.images[Object.keys(this.state.images)[0]].uri : BLANK_IMAGE_URI }} resizeMode={'cover'} style={{ height: IMG_DIM, width: IMG_DIM, backgroundColor: Colors.primary, borderRadius: IMG_DIM / 2, margin: 2.0 }} />
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 28.0, marginTop: 16.0, }}>{this.state.fname} {this.state.lname}</Text>
                        <Text style={{ fontSize: 18, color: Colors.textLightGray }}>{new Date().getFullYear() - this.state.dob.getFullYear()}</Text>
                        <Text style={{ fontSize: 18, color: Colors.textLightGray }}>{this.state.occupation}</Text>
                        <Text style={{ fontSize: 18, color: Colors.textLightGray }}>{this.state.bio}</Text>
                        <Text style={{ alignSelf: 'flex-start', fontFamily: Fonts.heading }}>Interests</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {TEST_INTERESTS.map(interest => (
                                <View key={interest} style={{ backgroundColor: Colors.primary, paddingHorizontal: 8.0, borderRadius: 16.0, margin: 2.0 }}>
                                    <Text style={{ color: Colors.background }}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity onPress={this.handlePress}>
                            <View style={{
                                backgroundColor: this.state.color, alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderWidth: 1, borderColor: 'white', margin: 5,
                            }}>
                                <Text style={styles.button}>Edit Profile</Text>
                                </View>
                                </TouchableOpacity>
                        <Text style={{ alignSelf: 'flex-start', fontFamily: Fonts.heading, marginTop: 16.0 }}>Pictures</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                            {Object.keys(this.state.images).map(key => (
                                <Image key={key} source={{ uri: this.state.images[key].uri }} resizeMode={'cover'} style={{ height: 120, width: 120, backgroundColor: Colors.primary, borderRadius: 8, margin: 2.0 }} />
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

export default connect(mapStateToProps, mapDispatchToProps)(Profile);