import React from 'react';
import { View, Animated, Easing, SafeAreaView, Dimensions, NativeModules, Modal, ActivityIndicator, ScrollView, Image, Alert, TouchableOpacity, LayoutAnimation, UIManager } from 'react-native';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { height, width } = Dimensions.get('screen');

import { Text, TabBar } from '../common/components';
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
import { TabView, SceneMap } from 'react-native-tab-view';

import { DistanceFilter, GenderFilter, AgeFilter } from './components';

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
        filterTabIdx: 0,

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
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

        if (this.state.waitingForPartner && this.state.partnerOnCall) {
            this.setState({ waitingForPartner: false })
            Animated.timing(this.callStartAnimation, {
                toValue: 1,
                duration: 1000,
                easing: Easing.bounce,
                useNativeDriver: true,
            }).start();
            this.runTime();
        }
        if (prevState.partnerOnCall && !this.state.waitingForPartner && !this.state.partnerOnCall) {
            this.leaveRoom();
        }
        if (!prevState.enteredPool && this.state.enteredPool) {

            let animationRunner = Animated.loop(Animated.timing(this.loadingAnimation, {
                toValue: 1.0,
                duration: 2000,
                useNativeDriver: true,
            }));

            animationRunner.start();

            this.setState({ animationRunner });

        }
        if (prevState.enteredPool && !this.state.enteredPool) {

            this.state.animationRunner.stop();
            this.loadingAnimation.setValue(0);

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
        this.setState({ enteredPool: false, pairedUid: null });
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
            this.setState({ timer });
        }
        else {
            this.leaveRoom();
        }
    }

    leaveRoom = async () => {
        if (this.state.timer) {
            clearTimeout(this.state.timer);
        }
        RtcEngine.leaveChannel();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ partnerOnCall: false, partnerUid: null, joinedCall: false, timer: null, });
        this.leavePool();
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
        this.leaveRoom();
    }

    extendCall = async () => {

    }

    loadingAnimation = new Animated.Value(0);

    render() {

        // TODO: Review Logic
        let notInPool = this.state.pairingEnabled || !this.state.enteredPool ? true : this.state.pairingEnabled || this.state.enteredPool ? false : false;

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <Image source={{ uri: this.state.backgroundImage }} style={{ height, width }} />
                <View style={{ position: 'absolute', top: 0, left: 0, height: height - 64, width, }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ paddingTop: 32.0, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 24.0 }}>hotminute</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 5 }}>
                        {
                            this.state.pairedUid ?
                                // IF PAIRED
                                this.state.pairedProfile.pictureURL ?
                                    // IF HAS PROFILE PICTURE SHOW PICTURE BLURRED
                                    <Animated.Image blurRadius={12.0} source={{ uri: this.state.pairedProfile.pictureURL }} style={{ height: 196, width: 196, borderRadius: 98.0, borderColor: Colors.primary, borderWidth: 8.0, transform: [{ scale: this.callStartAnimation }] }} />
                                    :
                                    // ELSE JUST USE A CALL ICON
                                    <Icon name={'phone'} color={Colors.primary} size={128} /> : null
                        }
                        {
                            this.state.pairedUid ?
                                // IF PAIRED
                                // SHOW THE TIMER TEXT AND END CALL BUTTON
                                <>
                                    <View style={{ position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ alignSelf: 'center', fontFamily: Fonts.heading, fontSize: 64.0, color: Colors.primary }}>{this.state.timeLeft}</Text>
                                    </View>
                                    <Button title={'End Call'} disabled={!this.state.joinedCall} onPress={this.leaveRoom} containerStyle={{ margin: 2.0 }} />
                                </>
                                :
                                // ELSE JUST SHOW THE HOTMINUTE LOGO AND PAIRING ANIMATION
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                        <Animated.View style={{ backgroundColor: '#fff2f6', borderRadius: 32.0, height: 64.0, width: 64.0, transform: [{ scale: this.loadingAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 5, 0] }) }] }} />
                                    </View>
                                    <Image source={require('../../../assets/img/logo.png')} style={{ height: 128.0, width: 128.0, borderRadius: 8.0 }} />
                                </View>
                        }
                        <Text style={{ alignSelf: 'center', textAlign: 'center' }}>{this.state.waitingForPartner ? 'Waiting For Partner' : ''}</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignSelf: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => this.setState({ filtersVisible: true })} disabled={this.state.pairingEnabled || this.state.enteredPool}>
                            <Icon name={'sort'} size={32} color={Colors.textLightGray} />
                        </TouchableOpacity>
                        <View style={{ marginVertical: 8.0, width, padding: 16.0 }}>
                            <TouchableOpacity onPress={notInPool ? this.joinPool : this.leavePool}>
                                <LinearGradient style={{ margin: 2.0, paddingVertical: 16.0, borderRadius: 64.0, justifyContent: 'center', alignItems: 'center', width: '100%' }} colors={notInPool ? [Colors.primaryDark, Colors.primary] : ['#f55', '#f77']}>
                                    <Text style={{ fontFamily: Fonts.heading, color: Colors.background }}>{notInPool ? 'Find a Match' : 'Cancel'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {
                        this.state.joinedCall ?
                            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 32.0, marginHorizontal: 8.0 }}>
                                    <Button title={'Left'} disabled={!this.state.joinedCall} onPress={this.swipeLeft} containerStyle={{ margin: 2.0, flex: 1 }} />
                                    <Button title={'Extend'} disabled={!this.state.joinedCall} onPress={this.extendCall} containerStyle={{ margin: 2.0, flex: 2 }} />
                                    <Button title={'Right'} disabled={!this.state.joinedCall} onPress={this.swipeRight} containerStyle={{ margin: 2.0, flex: 1 }} />
                                </View>
                            </View>
                            :
                            null
                    }
                </View>

                {/* FILTERS MODAL */}
                <Modal visible={this.state.filtersVisible} transparent animated animationType={'slide'}>
                    <View style={{ justifyContent: 'flex-start', marginTop: height / 3, backgroundColor: Colors.background, flex: 1, elevation: 4.0 }}>
                        <TouchableOpacity onPress={() => this.setState({ filtersVisible: false })}>
                            <Icon name={'arrow-drop-down'} size={32} color={Colors.primary} />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 28.0, alignSelf: 'center', marginBottom: 16.0 }}>Filters</Text>
                        <TabView
                            style={{ flex: 1 }}
                            navigationState={{ index: this.state.filterTabIdx, routes: [{ key: 'distance', title: 'distance' }, { key: 'gender', title: 'gender' }, { key: 'age', title: 'age' }] }}
                            renderScene={SceneMap({distance: DistanceFilter, gender: GenderFilter, age: AgeFilter })}
                            renderTabBar={props => <TabBar {...props} onChangeTab={i => this.setState({filterTabIdx: i})}/> }
                            onIndexChange={idx => this.setState({ filterTabIdx: idx })}
                        />
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