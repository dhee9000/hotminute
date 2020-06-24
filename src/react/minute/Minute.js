import React from 'react';
import { View, Animated, Easing, SafeAreaView, Dimensions, NativeModules, Modal, ActivityIndicator, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';

const { height, width } = Dimensions.get('screen');

import { Text } from '../common/components';
import { Fonts, Colors, AgoraConfig } from '../../config';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import { Input, Button, Icon, Slider, CheckBox } from 'react-native-elements';

import { RtcEngine, AgoraView } from 'react-native-agora'
const { Agora } = NativeModules;
const { FPS30, AudioProfileDefault, AudioScenarioDefault, Host, Adaptative } = Agora;

import * as Permissions from 'expo-permissions';

import { LinearGradient } from 'expo-linear-gradient';

class Minute extends React.Component {

    state = {

        userProfile: {},

        filters: {
            maxDistance: 100,
            genders: {
                male: false,
                female: true,
                other: false,
            },
            minAge: '18',
            maxAge: '24',
        },

        pairingEnabled: false,
        filtersVisible: false,

        paired: false,
        pairedUid: '',
        pairedProfile: {},
        enteredPool: false,

        timeLeft: 60,
        waitingForPartner: false,

        // AGORA STATE VARIABLES
        channelName: "TestRoom",
        joinedCall: false,
        partnerUid: null,
        partnerOnCall: false,
        vidMute: false,
        audMute: false,
    }

    callStartAnimation = new Animated.Value(0);

    async componentDidMount() {

        Permissions.askAsync(Permissions.AUDIO_RECORDING);
        RtcEngine.init(AgoraConfig);
        RtcEngine.setEnableSpeakerphone(true);
        RtcEngine.setDefaultAudioRouteToSpeakerphone(true);
        RtcEngine.registerLocalUserAccount(auth().currentUser.uid.toString());
        RtcEngine.on('userJoined', data => this.setState({ partnerUid: data.uid, partnerOnCall: true })); // When a user joins the call
        RtcEngine.on('userOffline', data => this.setState({ partnerUid: null, partnerOnCall: false }));
        RtcEngine.on('joinChannelSuccess', data => {    // When user joins channel
            RtcEngine.startPreview();
            this.setState({ joinedCall: true });
        });
        RtcEngine.on('error', data => {
            switch (data.errorCode) {
                case 17: case 110: {
                    this.joinRoom();
                    break;
                }
                case 11: break;
                default: {
                    console.log(data);
                }
            }
        });

        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        this.setState({ userProfile: { ...profileData } });

        let filtersSnapshot = await firestore().collection('filters').doc(auth().currentUser.uid).get();
        let filtersData = filtersSnapshot.data();
        this.setState({ filters: { ...filtersData } });
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            (prevState.pairingEnabled != this.state.pairingEnabled || prevState.paired != this.state.paired) &&
            (this.state.pairingEnabled && !this.state.paired)
        ) {
            this.joinPool();
        }

        if(this.state.waitingForPartner && this.state.partnerOnCall){
            this.setState({ waitingForPartner: false })
            Animated.timing(this.callStartAnimation, {
                toValue: 1,
                duration: 1000,
                easing: Easing.bounce,
                useNativeDriver: true,
            }).start();
            this.runTime();
        }
        if(prevState.partnerOnCall && !this.state.waitingForPartner && !this.state.partnerOnCall){
            this.leaveRoom();
        }
        if(!prevState.enteredPool && this.state.enteredPool){
            
            let animationRunner = Animated.loop(Animated.timing(this.loadingAnimation, {
                toValue: 1.0,
                duration: 2000,
                useNativeDriver: true,
            }));

            animationRunner.start();

            this.setState({animationRunner});

        }
        if(prevState.enteredPool && !this.state.enteredPool){
            
           this.state.animationRunner.stop();

        }
    }

    joinPool = async () => {

        await this.leavePool();

        // Enter the pool
        let poolEntrySnapshot = await firestore().collection('pairingPool').add({
            uid: auth().currentUser.uid,
            genders: {
                ...this.state.filters.genders
            },
            maxDistance: parseInt(this.state.filters.maxDistance),
            maxAge: parseInt(this.state.filters.maxAge),
            minAge: parseInt(this.state.filters.minAge),
            gender: this.state.userProfile.gender,
            dob: this.state.userProfile.dob,
            enteredAt: firebase.firestore.FieldValue.serverTimestamp(),
            active: true,
        });

        // Listen for changes to entry
        let unsubscribePoolEntry = firestore().collection('pairingPool').doc(poolEntrySnapshot.id).onSnapshot(async docSnapshot => {
            let data = docSnapshot.data();
            if (data.paired) {
                let pairedProfileSnapshot = await firestore().collection('profiles').doc(data.pairedUid).get();
                let pairedProfile = pairedProfileSnapshot.data();
                let pairedProfilePictureURL = await storage().ref(pairedProfile.images["1"].ref).getDownloadURL();
                pairedProfile.pictureURL = pairedProfilePictureURL;
                alert(`Paired With ${pairedProfile.fname} ${pairedProfile.lname}`);
                this.setState({ roomId: data.roomId, roomToken: data.roomToken, pairedUid: data.pairedUid, pairedProfile, paired: true }, this.joinRoom)
            }
            if (!data.active) {
                this.setState({ enteredPool: false });
                this.state.unsubscribePoolEntry();
            }
        });
        this.setState({ unsubscribePoolEntry: () => unsubscribePoolEntry(), enteredPool: true });
    }

    leavePool = async () => {
        // Remove existing pool entries
        let existingPoolEntriesSnapshot = await firestore().collection('pairingPool').where('uid', '==', auth().currentUser.uid).where('active', '==', true).get();
        let batch = firestore().batch();
        existingPoolEntriesSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { active: false });
        })
        await batch.commit();
        if (this.state.unsubscribePoolEntry) {
            this.state.unsubscribePoolEntry();
        }
        this.setState({ enteredPool: false });
    }

    joinRoom = async () => {
        RtcEngine.leaveChannel();
        Alert.alert('Join Call', `Are you ready to join this call? Your partner's name is ${this.state.pairedProfile.fname} ${this.state.pairedProfile.lname}.`, [
            {
                text: 'Join',
                onPress: () => {
                    RtcEngine.registerLocalUserAccount(auth().currentUser.uid.toString());
                    this.setState({ partnerOnCall: false, partnerUid: '', joinedCall: false, timeLeft: 61, waitingForPartner: true });
                    setTimeout(() => {
                        RtcEngine.joinChannelWithUserAccount(this.state.roomId, auth().currentUser.uid, this.state.roomToken);  //Join Channel
                        RtcEngine.enableAudio();
                        RtcEngine.disableVideo();
                    }, 1000)
                }
            },
            {
                text: 'Cancel',
                onPress: () => {
                    return;
                }
            }
        ])
    }

    runTime = () => {
        if (this.state.timeLeft > 0) {
            this.setState({ timeLeft: this.state.timeLeft - 1 });
            let timer = setTimeout(() => {
                this.runTime();
            }, 1000);
            this.setState({timer});
        }
        else{
            this.leaveRoom();
        }
    }

    leaveRoom = async () => {
        if(this.state.timer){
            clearTimeout(this.state.timer);
        }
        RtcEngine.leaveChannel();
        this.setState({ partnerOnCall: false, partnerUid: '', joinedCall: false, timer: null });
    }

    swipeRight = async () => {
        firestore().collection('swipes').doc(`${auth().currentUser.uid}_${this.state.pairedUid}`).set({
            uid: auth().currentUser.uid,
            swipedOn: this.state.pairedUid,
            direction: 'right',
        });
    }

    swipeLeft = async () => {
        firestore().collection('swipes').doc(`${auth().currentUser.uid}_${this.state.pairedUid}`).set({
            uid: auth().currentUser.uid,
            swipedOn: this.state.pairedUid,
            direction: 'left',
        });
    }

    extendCall = async () => {

    }

    loadingAnimation = new Animated.Value(0);

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <Image source={{ uri: this.state.backgroundImage }} style={{ height, width }} />
                <View style={{ position: 'absolute', top: 0, left: 0, height: height - 64, width, }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ paddingTop: 32.0, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 24.0 }}>hotminute</Text>
                        </View>
                    </View>
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        {
                            this.state.pairedUid ? 
                            this.state.pairedProfile.pictureURL ? 
                            <Animated.Image blurRadius={12.0} source={{uri: this.state.pairedProfile.pictureURL}} style={{height: 196, width: 196, borderRadius: 98.0, borderColor: Colors.primary, borderWidth: 8.0, transform: [{scale: this.callStartAnimation}]}} />
                            :
                            <Icon name={'phone'} color={Colors.primary} size={128} /> :  null
                        }
                        {
                            this.state.pairedUid ? 
                            <>
                        <View style={{ position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ alignSelf: 'center', fontFamily: Fonts.heading, fontSize: 64.0, color: Colors.primary }}>{this.state.timeLeft}</Text>
                        </View>
                        <Button title={'End Call'} disabled={!this.state.joinedCall} onPress={this.leaveRoom} containerStyle={{ margin: 2.0 }} />
                        </>
                         : 
                         <View style={{alignItems: 'center', justifyContent: 'center'}}>
                            <View style={{ position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <Animated.View style={{ backgroundColor: '#fff2f6', borderRadius: 32.0, height: 64.0, width: 64.0, transform: [{scale: this.loadingAnimation.interpolate({inputRange: [0,0.5,1], outputRange: [0, 5, 0]})}] }} />
                            </View>
                            <Image source={require('../../../assets/img/logo.png')} style={{height: 128.0, width: 128.0, borderRadius: 8.0}} />
                         </View>
                        }
                        
                    </View>                    
                    <Text style={{alignSelf: 'center', textAlign: 'center'}}>{this.state.waitingForPartner ? 'Waiting For Partner' : ''}</Text>
                    <View style={{ flex: 2, justifyContent: 'flex-end', alignSelf: 'center', alignItems: 'center' }}>
                        <Button title={'Edit Filters'} onPress={() => this.setState({ filtersVisible: true })} disabled={this.state.pairingEnabled || this.state.enteredPool} containerStyle={{ margin: 4.0 }} />
                        <View style={{ marginVertical: 8.0, width, padding: 16.0 }}>
                            <TouchableOpacity onPress={this.joinPool} disabled={this.state.pairingEnabled || this.state.enteredPool} onLongPress={() => this.props.navigation.navigate('GodMode')}>
                                <LinearGradient 
                                    style={{ margin: 2.0, paddingVertical: 16.0, borderRadius: 64.0, justifyContent: 'center', alignItems: 'center', width: '100%', opacity: !this.state.enteredPool ? 1 : 0.5 }} 
                                    colors={[Colors.primaryDark, Colors.primary]}                                    
                                >
                                    <Text style={{ fontFamily: Fonts.heading, color: Colors.background }}>Find a Match</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.leavePool} disabled={this.state.pairingEnabled || !this.state.enteredPool} onLongPress={() => this.props.navigation.navigate('GodMode')}>
                                <LinearGradient 
                                    style={{ margin: 2.0, paddingVertical: 16.0, borderRadius: 64.0, justifyContent: 'center', alignItems: 'center', width: '100%', opacity: this.state.enteredPool ? 1 : 0.5 }} 
                                    colors={[Colors.primaryDark, Colors.primary]}                                    
                                >
                                    <Text style={{ fontFamily: Fonts.heading, color: Colors.background }}>Cancel</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 32.0, marginHorizontal: 8.0 }}>
                            <Button title={'Left'} disabled={!this.state.joinedCall} onPress={this.swipeLeft} containerStyle={{ margin: 2.0, flex: 1 }} />
                            <Button title={'Extend'} disabled={!this.state.joinedCall} onPress={this.extendCall} containerStyle={{ margin: 2.0, flex: 2 }} />
                            <Button title={'Right'} disabled={!this.state.joinedCall} onPress={this.swipeRight} containerStyle={{ margin: 2.0, flex: 1 }} />
                        </View>
                    </View>
                </View>

                {/* FILTERS MODAL */}
                <Modal visible={this.state.filtersVisible} transparent animated animationType={'slide'}>
                    <View style={{ justifyContent: 'flex-start', padding: 16.0, marginTop: height / 2, backgroundColor: Colors.background, flex: 1, elevation: 4.0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: Fonts.heading, fontSize: 28.0, }}>Filters</Text>
                            <Text style={{ fontFamily: Fonts.heading, marginRight: 16.0, color: Colors.primary, fontSize: 24 }} onPress={() => this.setState({ filtersVisible: false })}>X</Text>
                        </View>
                        <ScrollView>
                            <View>
                                <Text style={{ fontFamily: Fonts.heading }}>Distance</Text>
                                <Slider
                                    value={this.state.distanceFilter}
                                    onValueChange={value => this.setState({ distanceFilter: value })}
                                    minimumValue={0}
                                    maximumValue={100}
                                    onValueChange={value => this.setState({ filters: { ...this.state.filters, maxDistance: Math.round(value) } })}
                                    value={this.state.filters.maxDistance}
                                    thumbTintColor={Colors.primary}
                                />
                                <Text>{this.state.filters.maxDistance} mi</Text>
                                <Text style={{ fontFamily: Fonts.heading }}>Gender</Text>
                                <CheckBox
                                    title={'Male'}
                                    checked={this.state.filters.genders.male}
                                    onPress={() => this.setState({ filters: { ...this.state.filters, genders: { ...this.state.filters.genders, male: !this.state.filters.genders.male } } })}
                                />
                                <CheckBox
                                    title={'Female'}
                                    checked={this.state.filters.genders.female}
                                    onPress={() => this.setState({ filters: { ...this.state.filters, genders: { ...this.state.filters.genders, female: !this.state.filters.genders.female } } })}
                                />
                                <CheckBox
                                    title={'Other'}
                                    checked={this.state.filters.genders.other}
                                    onPress={() => this.setState({ filters: { ...this.state.filters, genders: { ...this.state.filters.genders, other: !this.state.filters.genders.other } } })}
                                />
                                <Input
                                    containerStyle={{ marginBottom: 32.0 }}
                                    inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                                    inputContainerStyle={{ borderColor: Colors.accent }}
                                    label={'Max Age'}
                                    labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                                    keyboardType={'numeric'}
                                    placeholder={'25'}
                                    placeholderTextColor={Colors.textLightGray}
                                    onChangeText={maxAge => this.setState({ filters: { ...this.state.filters, maxAge } })}
                                    value={this.state.filters.maxAge}
                                />
                                <Input
                                    containerStyle={{ marginBottom: 32.0 }}
                                    inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                                    inputContainerStyle={{ borderColor: Colors.accent }}
                                    label={'Min Age'}
                                    labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                                    keyboardType={'numeric'}
                                    placeholder={'18'}
                                    placeholderTextColor={Colors.textLightGray}
                                    onChangeText={minAge => this.setState({ filters: { ...this.state.filters, minAge } })}
                                    value={this.state.filters.minAge}
                                />
                            </View>
                        </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(Minute);