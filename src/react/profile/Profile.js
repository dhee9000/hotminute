import React from 'react';
import { View, Image, ScrollView, TouchableOpacity, Modal, Dimensions, Animated, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';

import { Colors, Fonts } from '../../config';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const IMG_DIM = 128;

const TEST_INTERESTS = ["Dance", "Movies", "Bollywood", "TikTok", "Science", "Programming", "Comedy"];

import { Button, Icon, Input } from 'react-native-elements';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';

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
        editingProfile: false,

        asking: false,
        askQuestion: '',
        askAnswer: '',
        askCb: () => { },
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

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.editingProfile && this.state.editingProfile) {

            // IF ENTERED EDIT MODE

            let animRunner =
                Animated.parallel([
                    Animated.loop(
                        Animated.sequence([
                            Animated.timing(this.editingWiggle, {
                                toValue: 1,
                                duration: 500,
                                useNativeDriver: true
                            }),
                            Animated.timing(this.editingWiggle, {
                                toValue: -1,
                                duration: 500,
                                useNativeDriver: true,
                            }),
                        ])
                    ),
                    Animated.loop(
                        Animated.sequence([
                            Animated.timing(this.editingJitter, {
                                toValue: 1,
                                duration: 100,
                                useNativeDriver: true
                            }),
                            Animated.timing(this.editingJitter, {
                                toValue: -1,
                                duration: 100,
                                useNativeDriver: true,
                            }),
                        ])
                    )
                ]);
            animRunner.start();
            this.setState({ editingAnimRunner: animRunner });
        }
        if (prevState.editingProfile && !this.state.editingProfile) {

            this.props.updateProfile({
                fname: this.state.fname,
                lname: this.state.lname,
                occupation: this.state.occupation,
                bio: this.state.bio,
                interests: this.state.interests,
            })
            this.state.editingAnimRunner.stop();
            Animated.timing(this.editingWiggle, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }).start();
            Animated.timing(this.editingJitter, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    }

    showSettingsMenu = () => {
        this.setState({ showSettings: true });
    }

    editProfile = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (!this.state.editingProfile) {
            this.setState({ editingProfile: true });
        }
        else {
            this.setState({ editingProfile: false });
        }
    }

    editFname = () => {
        this.askForField('First Name', this.state.fname, fname => this.setState({ fname }));
    }

    editLname = () => {
        this.askForField('Last Name', this.state.lname, lname => this.setState({ lname }));
    }

    editOccupation = () => {
        this.askForField('Occupation', this.state.occupation, occupation => this.setState({ occupation }));
    }

    editBio = () => {
        this.askForField('Bio', this.state.bio, bio => this.setState({ bio }));
    }

    addInterest = () => {
        this.askForField('Add Interest', '', interest => this.setState({ interests: [...this.state.interests, interest] }));
    }

    deleteInterest = (interest) => {
        this.setState({ interests: this.state.interests.filter(i => i !== interest) });
    }

    addImage = async () => {
        let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        id = 6;

        while (!this.state.images[id - 1] && id > 1) {
            id--;
        }

        // let { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status === 'granted') {
            try {
                let image = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, aspect: [1, 1] });
                if (!image.cancelled) {
                    let newImages = {};
                    newImages = { ...this.state.images };
                    newImages[id] = image;
                    this.setState({ images: newImages });
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

    askForField = (prompt, defAns, cb) => {
        let askCb = () => {
            cb(this.state.askAnswer);
            this.setState({ asking: false });
        }
        this.setState({ asking: true, askQuestion: prompt, askAnswer: defAns, askCb });
    }

    logoutPressed = async () => {
        await auth().signOut();
        this.props.navigation.navigate('Start');
    }

    editingWiggle = new Animated.Value(0);
    editingJitter = new Animated.Value(0);

    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1 }}>
                <View style={{ padding: 16.0, flex: 1 }}>
                    <View style={{ paddingTop: 16.0, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 24.0 }}>profile</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alingItems: 'center', marginVertical: 8.0 }}>
                        <TouchableOpacity onPress={this.showSettingsMenu}>
                            <Icon name={'settings'} size={32} color={Colors.textLightGray} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.editProfile}>
                            <Animated.View style={{ transform: [{ rotate: this.editingWiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-35deg', '35deg'] }) }] }}>
                                <Icon name={'edit'} size={32} color={this.state.editingProfile ? Colors.primary : Colors.textLightGray} />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                    {this.state.editingProfile ? <Text style={{ alignSelf: 'center', color: Colors.textLightGray, fontSize: 12.0 }}>tap something below to change it</Text> : null}
                    <ScrollView style={{ flex: 1, marginTop: 16.0 }} contentContainerStyle={{ alignItems: 'center' }}>
                        <Image source={{ uri: this.state.images[Object.keys(this.state.images)[0]] ? this.state.images[Object.keys(this.state.images)[0]].uri : BLANK_IMAGE_URI }} resizeMode={'cover'} style={{ height: IMG_DIM, width: IMG_DIM, backgroundColor: Colors.primary, borderRadius: IMG_DIM / 2, margin: 2.0 }} />
                        <View style={{ flexDirection: 'row', marginTop: 16.0 }}>
                            <TouchableOpacity disabled={!this.state.editingProfile} onPress={this.editFname} >
                                <Animated.View style={{ transform: [{ translateX: this.editingJitter.interpolate({ inputRange: [-1, 1], outputRange: [-1, 1] }) }] }}>
                                    <Text style={{ fontFamily: Fonts.heading, fontSize: 28.0, }}>{this.state.fname} </Text>
                                </Animated.View>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={!this.state.editingProfile} onPress={this.editLname}>
                                <Animated.View style={{ transform: [{ translateX: this.editingJitter.interpolate({ inputRange: [-1, 1], outputRange: [-1, 1] }) }] }}>
                                    <Text style={{ fontFamily: Fonts.heading, fontSize: 28.0, }}>{this.state.lname}</Text>
                                </Animated.View>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 16, color: Colors.textLightGray }}>{new Date().getFullYear() - this.state.dob.getFullYear()}</Text>
                        <TouchableOpacity disabled={!this.state.editingProfile} onPress={this.editOccupation}>
                            <Animated.View style={{ transform: [{ translateX: this.editingJitter.interpolate({ inputRange: [-1, 1], outputRange: [-1, 1] }) }] }}>
                                <Text style={{ fontSize: 16, color: Colors.textLightGray }}>{this.state.occupation}</Text>
                            </Animated.View>
                        </TouchableOpacity>
                        <TouchableOpacity disabled={!this.state.editingProfile} onPress={this.editBio}>
                            <Animated.View style={{ transform: [{ translateX: this.editingJitter.interpolate({ inputRange: [-1, 1], outputRange: [-1, 1] }) }] }}>
                                <Text style={{ fontSize: 16, color: Colors.textLightGray }}>{this.state.bio}</Text>
                            </Animated.View>
                        </TouchableOpacity>
                        <Text style={{ alignSelf: 'flex-start', fontFamily: Fonts.heading }}>Interests</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', width: '100%', marginVertical: 8.0 }}>
                            {this.state.interests.map(interest => (
                                <TouchableOpacity key={interest} disabled={!this.state.editingProfile} onPress={() => this.deleteInterest(interest)}>
                                    <View style={{ backgroundColor: Colors.primary, paddingHorizontal: 8.0, borderRadius: 16.0, margin: 2.0 }}>
                                        <Text style={{ color: Colors.background }}>{this.state.editingProfile ? 'X ' : ''}{interest}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.editingProfile ?
                                <TouchableOpacity disabled={!this.state.editingProfile} onPress={this.addInterest}>
                                    <View style={{ backgroundColor: Colors.background, borderColor: Colors.primary, borderStyle: 'dashed', borderWidth: 2.0, paddingHorizontal: 8.0, borderRadius: 16.0, margin: 2.0 }}>
                                        <Text style={{ color: Colors.primary }}>+ Add</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                null
                            }
                        </View>
                        <Text style={{ alignSelf: 'flex-start', fontFamily: Fonts.heading, marginTop: 16.0 }}>Pictures</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', width: '100%', marginVertical: 16.0 }}>
                            {Object.keys(this.state.images).map(key => (
                                <View key={key}>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('ViewImage', { imageUri: this.state.images[key].uri })} >
                                        <Image source={{ uri: this.state.images[key].uri }} resizeMode={'cover'} style={{ height: width / 3 - 16, width: width / 3 - 16, backgroundColor: Colors.primary, borderRadius: 8, margin: 2.0 }} />
                                    </TouchableOpacity>
                                    {
                                        this.state.editingProfile ?
                                            <View style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', alignItems: 'center', justifyContent: 'flex-start', }}>
                                                <View style={{ borderRadius: 8, backgroundColor: '#E63462AA', height: 120, width: 120, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 32.0, fontFamily: Fonts.heading, color: Colors.background }}>X</Text>
                                                </View>
                                            </View>
                                            :
                                            null
                                    }
                                </View>
                            ))}
                            {this.state.editingProfile ?
                                <TouchableOpacity disabled={!this.state.editingProfile} onPress={this.addImage}>
                                    <View style={{ backgroundColor: Colors.background, borderColor: Colors.primary, borderStyle: 'dashed', height: 120, width: 120, borderWidth: 2.0, paddingHorizontal: 8.0, borderRadius: 16.0, margin: 2.0, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.primary }}>+</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                null
                            }
                        </View>
                    </ScrollView>
                </View>
                <Modal visible={this.state.showSettings} transparent animated animationType={'slide'}>
                    <View style={{ justifyContent: 'flex-start', padding: 16.0, marginTop: height / 2, backgroundColor: Colors.background, flex: 1, elevation: 4.0 }}>
                        <TouchableOpacity onPress={() => this.setState({ showSettings: false })}>
                            <Icon name={'arrow-drop-down'} size={32} color={Colors.primary} />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 28.0, alignSelf: 'center', marginBottom: 16.0 }}>Settings</Text>
                        <View>
                            <Button title={'Log Out'} onPress={this.logoutPressed} />
                        </View>
                    </View>
                </Modal>
                <Modal visible={this.state.asking} transparent animated animationType={'slide'}>
                    <View style={{ justifyContent: 'flex-start', marginTop: height / 2, backgroundColor: Colors.background, flex: 1, elevation: 4.0 }}>
                        <TouchableOpacity onPress={() => this.setState({ asking: false })}>
                            <Icon name={'arrow-drop-down'} size={32} color={Colors.primary} />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 28.0, alignSelf: 'center', marginBottom: 16.0 }}>{this.state.askQuestion}</Text>
                        <View>
                            <Input
                                containerStyle={{ marginBottom: 32.0 }}
                                inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                                inputContainerStyle={{ borderColor: Colors.accent }}
                                labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                                keyboardType={'default'}
                                placeholder={this.state.askQuestion}
                                placeholderTextColor={Colors.textLightGray}
                                onChangeText={text => this.setState({ askAnswer: text })}
                                value={this.state.askAnswer}
                            />
                            <Button title={'Save'} onPress={this.state.askCb} />
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
    updateProfile: newProfile => dispatch({ type: ActionTypes.UPDATE_PROFILE.REQUEST, payload: { ...newProfile, updateId: new Date().getTime().toString() } })
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);