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
import * as ActionTypes from '../../redux/ActionTypes';

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

import { DistanceFilter, GenderFilter, AgeFilter, Swiper } from './components';

class Minute extends React.Component {

    state = {

        userProfile: {},
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

        this.props.getUserProfile();
        this.props.getFilters();

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
        if(prevProps.filters.loaded != this.props.filters.loaded){
            this.setState({
                filters: {
                    ...this.props.filters
                }
            });
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
            <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <Swiper />
            </View>
        )
    }
}

const mapStateToProps = state => ({
    filters: state.filters,
    userProfile: state.profiles.byId[auth().currentUser.uid],
});

const mapDispatchToProps = dispatch => ({
    getUserProfile: () => dispatch({type: ActionTypes.FETCH_PROFILE.REQUEST, payload: auth().currentUser.uid}),
    getFilters: () => dispatch({type: ActionTypes.FETCH_FILTERS.REQUEST}),
});

export default connect(mapStateToProps, mapDispatchToProps)(Minute);