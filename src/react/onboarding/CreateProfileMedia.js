import React from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Fonts, Colors } from '../../config';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, Button } from 'react-native-elements';

import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker';

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth, { firebase } from '@react-native-firebase/auth';

import ImageResizer from 'react-native-image-resizer';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

class CreateProfileMedia extends React.Component {

    state = {
        uploading: false,
        uploadingText: '',
        uploaded: false,
        images: {},
        numImagesSelected: 0,
    }

    async componentDidMount() {
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if(profileSnapshot.exists && profileData.mediaComplete){
            this.props.navigation.navigate('SelectPreferencesDistance');
        }
    }

    imageTapped = async (id) => {

        // Make sure previous images are filled first
        while(!this.state.images[id-1] && id > 1){
            id--;
        }

        let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        // let { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status === 'granted') {
            try {
                let image = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, aspect: [1, 1] });
                if (!image.cancelled) {

                    let resizedImage = await ImageResizer.createResizedImage(image.uri, 1920, 1920, 'JPEG', 80, 0, null, true);
                    image.uri = resizedImage.uri;

                    newState = {};
                    newState.images = { ...this.state.images };
                    newState.images[id] = image;
                    newState.numImagesSelected = this.state.numImagesSelected + 1;
                    this.setState(newState);
                }
                else {
                    alert("No Image Selected!");
                }
            }
            catch (e) {
                console.error("IMAGE PICKER", e);
            }
        }
        else {
            alert("Camera Roll Permission Required!");
        }
    }

    clearImages = () => {
        this.setState({images: {}, numImagesSelected: 0})
    }

    uploadPressed = async () => {
        let profileRef = firestore().collection('profiles').doc(auth().currentUser.uid);

        Object.keys(this.state.images).forEach(async key => {

            let image = this.state.images[key];

            // Create a record of this image.
            let imageDoc = await profileRef.collection('images').add({
                uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
                originalUri: image.uri,
            });

            let { id } = imageDoc;
            
            // Upload the image.
            let fileName = `${auth().currentUser.uid}_${Date.now().toString()}`.replace(' ', '');
            let fileExtension = image.uri.substr(image.uri.lastIndexOf('.') + 1);
            let storageRef = `profiles/${auth().currentUser.uid}/images/${fileName}.${fileExtension}`
            await storage().ref(storageRef).putFile(image.uri);

            // Set the image on the profile.
            let updateKey = `images.${key}`;
            await profileRef.update({
                [updateKey]: {
                    id,
                    ref: storageRef,
                }
            })

        })

        await profileRef.update({ mediaComplete: true });

        this.props.navigation.navigate('SelectPreferencesDistance');
    }

    ProfileImage = props => {
        return (
            <TouchableOpacity onPress={() => this.imageTapped(props.imageId)}>
                <Image source={{ uri: this.state.images[props.imageId] ? this.state.images[props.imageId].uri : BLANK_IMAGE_URI }} style={{ height: 120, width: 120, backgroundColor: Colors.primary, borderRadius: 8 }} />
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>mirror, mirror on the wall</Text>
                    <Text style={{ color: Colors.text }}>You're the fairest of them all ;)</Text>
                </View>
                <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
                    <Text style={{ color: Colors.text, marginBottom: 16.0 }}>Choose up to 6 pictures (at least 3) of yourself to show on your profile after dates match with you.</Text>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 2.0 }}>
                        <this.ProfileImage imageId={1} />
                        <this.ProfileImage imageId={2} />
                        <this.ProfileImage imageId={3} />

                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 2.0 }}>
                        <this.ProfileImage imageId={4} />
                        <this.ProfileImage imageId={5} />
                        <this.ProfileImage imageId={6} />
                    </View>
                    <View style={{ marginVertical: 16.0, alignItems: 'center'}}>
                        <Text style={{color: Colors.textLightGray}} onPress={this.clearImages}>Clear All</Text>
                    </View>
                    <View style={{ marginVertical: 16.0 }}>
                        {this.state.uploading ?
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <ActivityIndicator />
                                <Text>{this.state.uploadingText}</Text>
                            </View>
                            :
                            this.state.uploaded ?
                                <Text>Done</Text>
                                :
                                null
                        }
                    </View>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                    <Button title="Upload" onPress={this.uploadPressed} disabled={this.state.numImagesSelected < 3} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfileMedia);