import React from 'react';
import { View, Animated, Easing, SafeAreaView, Dimensions, NativeModules, Modal, ActivityIndicator, ScrollView, Image, Alert, TouchableOpacity, LayoutAnimation, UIManager, Linking, TouchableWithoutFeedback, AppState } from 'react-native';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { height, width } = Dimensions.get('screen');

import { Text, TabBar } from '../common/components';
import { Fonts, Colors, AgoraConfig, GoogleMaps } from '../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';

import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import RemoteConfig from '@react-native-firebase/remote-config';

import { Input, Button, Icon, Slider, CheckBox, SocialIcon } from 'react-native-elements';

import { RtcEngine, AgoraView } from 'react-native-agora'
const { Agora } = NativeModules;
const { FPS30, AudioProfileDefault, AudioScenarioDefault, Host, Adaptative } = Agora;

import * as Permissions from 'expo-permissions';

import { LinearGradient } from 'expo-linear-gradient';
import Location from 'react-native-location';
import LottieView from 'lottie-react-native';

import { FiltersModal, InstructionsModal, Swiper } from './components';

import Heart from '../../../assets/svg/heart.svg';

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
        poolEntryId: null,

        timeLeft: 60,
        waitingForPartner: false,
        bothExtended: false,

        showInstructionsPopup: false,

        // Checks
        preCheckCompleted: false,
        hasAudioPermission: false,
        hasLocationPermission: false,
        locationCheckSuccessful: true,
        userLocation: {},

        // AGORA STATE VARIABLES
        channelName: "TestRoom",
        joinedCall: false,
        partnerUid: null,
        partnerOnCall: false,
        vidMute: false,
        audMute: false,

        timerPressCount: 0,
        influencerModeActive: false,

        showSecondChance: false,
        secondChanceTimeout: {},

        datingPeriodActive: false,
        showDatingPeriodInfo: false,
    }

    callStartAnimation = new Animated.Value(0);

    async componentDidMount() {

        this.props.getUserProfile();
        this.props.getFilters();

        RtcEngine.init(AgoraConfig);
        RtcEngine.setEnableSpeakerphone(true);
        RtcEngine.setDefaultAudioRouteToSpeakerphone(true);
        RtcEngine.registerLocalUserAccount(auth().currentUser.uid.toString());
        RtcEngine.on('userJoined', data => this.setState({ partnerUid: data.uid, partnerOnCall: true, showInstructionsPopup: true })); // When a user joins the call
        RtcEngine.on('userOffline', data => this.setState({ partnerUid: null, partnerOnCall: false }));
        RtcEngine.on('joinChannelSuccess', data => {    // When user joins channel
            RtcEngine.startPreview();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            this.setState({ joinedCall: true });
            setTimeout(() => {
                if (this.state.waitingForPartner && !this.state.partnerOnCall) {
                    alert('Your partner didn\'t join the call!');
                    this.leaveRoom();
                }
            }, 5000)
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


        // Check Audio Permission
        try {
            let { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
            if (status !== 'granted') {
                this.setState({ preCheckCompleted: true, hasRecordingPermission: false });
                return;
            }
            console.log("PRE CHECK", "AUDIO RECORDING CHECK COMPLETED");
            this.setState({ hasRecordingPermission: true });
        }
        catch (e) {
            console.log("AUDIO PERMISSION CHECK FAILED", e);
        }

        // Check Location Permission
        let granted = await Location.requestPermission({ ios: "whenInUse", android: { detail: "fine" } });
        if (!granted) {
            this.setState({ preCheckCompleted: true, hasLocationPermission: false });
            return;
        }
        console.log("PRE CHECK", "LOCATION CHECK COMPLETED");
        this.setState({ hasLocationPermission: true });

        // Check Location in Supported Region
        let currentLocation = await Location.getLatestLocation();
        let { longitude, latitude } = currentLocation;
        let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GoogleMaps.key}`);
        let addressLookup = await response.json();
        let regionCode = addressLookup.results[0].address_components.filter(component => component.types.includes('administrative_area_level_1'))[0].short_name;
        this.setState({ preCheckCompleted: true, userLocation: { location: currentLocation, address: addressLookup, regionCode } });
        console.log("PRE CHECK", "REGION CHECK COMPLETED");

        this.datingPeriodCheck();

        Animated.loop(
            Animated.sequence([
                Animated.timing(this.dpPulseAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true
                }),
                Animated.timing(this.dpPulseAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true
                })
            ])
        ).start();

        AppState.addEventListener("change", this._handleAppStateChange);

    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === "inactive" || nextAppState === "background") {
            if (this.state.enteredPool) {
                this.leavePool();
            }
        }
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
                easing: Easing.cubic,
                useNativeDriver: true,
            }).start();
            this.runTime();
        }
        if (prevState.partnerOnCall && !this.state.waitingForPartner && !this.state.partnerOnCall && !(prevState.joinedCall && !this.state.joinedCall)) {
            this.onTimeFinish();
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
        if (prevProps.filters.loaded != this.props.filters.loaded) {
            this.setState({
                filters: {
                    ...this.props.filters
                }
            });
        }

        if (!prevState.datingPeriodActive && this.state.datingPeriodActive) {
            Animated.timing(this.datingPeriodAnimation, {
                duration: 1000,
                toValue: 1,
                useNativeDriver: false,
            }).start();
        }
        if (prevState.datingPeriodActive && !this.state.datingPeriodActive) {
            Animated.timing(this.datingPeriodAnimation, {
                duration: 1000,
                toValue: 0,
                useNativeDriver: false,
            }).start();
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
            location: this.state.userLocation.location,
            enteredAt: firebase.firestore.FieldValue.serverTimestamp(),
            active: true,
        });

        this.setState({ poolEntryId: poolEntrySnapshot.id })

        // Listen for changes to entry
        let unsubscribePoolEntry = firestore().collection('pairingPool').doc(poolEntrySnapshot.id).onSnapshot(async docSnapshot => {
            let data = docSnapshot.data();
            if (data.paired && !data.matched && !data.extended && !data.partnerExtended) {
                let pairedProfileSnapshot = await firestore().collection('profiles').doc(data.pairedUid).get();
                let pairedProfile = pairedProfileSnapshot.data();
                let pairedProfilePictureURL = await storage().ref(pairedProfile.images["1"].ref).getDownloadURL();
                pairedProfile.pictureURL = pairedProfilePictureURL;
                this.setState({ roomId: data.roomId, roomToken: data.roomToken, pairedUid: data.pairedUid, pairedProfile, paired: true }, this.joinRoom);
                this.confettiAnimation.setValue(0);
            }
            if (data.partnerExtended && data.extended) {
                this.setState({ timeLeft: this.state.timeLeft + 30, bothExtended: true });
                this.playConfetti();
            }
            if (data.matched) {
                this.leaveRoom();
                this.props.navigation.navigate('Matches');
                this.state.unsubscribePoolEntry();
                this.playConfetti();
            }
            if (!data.active) {
                this.setState({ enteredPool: false });
            }
        });

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ unsubscribePoolEntry: () => unsubscribePoolEntry(), enteredPool: true });
        this.showUnableToFindPairMessage();
    }

    showUnableToFindPairMessage = () => {
        let timeout = setTimeout(() => {

            if (!this.state.joinedCall) {
                Animated.timing(this.messageAnimation, {
                    duration: 500,
                    toValue: 1,
                    useNativeDriver: true
                }).start();
            }

        }, 5000);

        this.setState({ unableToFindPairTimeout: timeout });
    }

    hideUnableToFindPairMessage = () => {
        clearTimeout(this.state.unableToFindPairTimeout);
        Animated.timing(this.messageAnimation, {
            duration: 100,
            toValue: 0,
            useNativeDriver: true
        }).start();
    }

    leavePool = async () => {
        this.setState({ showSecondChance: false });
        clearTimeout(this.state.secondChanceTimeout);
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

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ enteredPool: false, pairedUid: null });
        this.hideUnableToFindPairMessage();
    }

    playConfetti = () => {
        this.confettiAnimation.setValue(0);
        Animated.timing(this.confettiAnimation, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
        }).start();
    }

    joinRoom = async () => {
        RtcEngine.leaveChannel();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        RtcEngine.registerLocalUserAccount(auth().currentUser.uid.toString());
        this.setState({ partnerOnCall: false, partnerUid: '', joinedCall: false, timeLeft: 61, waitingForPartner: true });
        setTimeout(() => {
            RtcEngine.joinChannelWithUserAccount(this.state.roomId, auth().currentUser.uid, this.state.roomToken);  //Join Channel
            RtcEngine.enableAudio();
            RtcEngine.disableVideo();
        }, 1000)
        this.hideUnableToFindPairMessage();
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
            this.onTimeFinish();
        }
    }

    onTimeFinish = async () => {
        this.leaveRoom(false);
        let secondChanceTimeout = setTimeout(() => {
            this.leavePool();
        }, 5000);
        this.setState({ showSecondChance: true, secondChanceTimeout });
    }

    leaveRoom = async (leavePool = true) => {
        this.setState({ showInstructionsPopup: false });
        if (this.state.timer) {
            clearTimeout(this.state.timer);
        }
        RtcEngine.leaveChannel();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ partnerOnCall: false, partnerUid: null, joinedCall: false, timer: null, waitingForPartner: false });
        if (leavePool) {
            this.leavePool();
        }
    }

    swipeRight = async () => {
        firestore().collection('swipes').doc(`${auth().currentUser.uid}_${this.state.pairedUid}_${Date.now().toString()}`).set({
            uid: auth().currentUser.uid,
            swipedOn: this.state.pairedUid,
            swipedAt: firestore.FieldValue.serverTimestamp(),
            pairingId: this.state.poolEntryId,
            direction: 'right',
        });
    }

    swipeLeft = async () => {
        firestore().collection('swipes').doc(`${auth().currentUser.uid}_${this.state.pairedUid}_${Date.now().toString()}`).set({
            uid: auth().currentUser.uid,
            swipedOn: this.state.pairedUid,
            swipedAt: firestore.FieldValue.serverTimestamp(),
            pairingId: this.state.poolEntryId,
            direction: 'left',
        });
        this.state.unsubscribePoolEntry();
        this.leaveRoom();
    }

    extendCall = async () => {
        firestore().collection('pairingPool').doc(this.state.poolEntryId).update({
            extended: true,
        });
    }

    timerPressed = () => {
        if (this.state.timerPressCount + 1 == 10) {
            Animated.timing(this.influencerAnimation, {
                duration: 500,
                toValue: 1,
                useNativeDriver: true,
                easing: Easing.bounce,
            }).start();
        }
        this.setState({ timerPressCount: this.state.timerPressCount + 1 });
    }

    onHMPress = () => {
        if (this.state.timerPressCount == 10) {
            this.setState({ influencerModeActive: true });
            alert('Influencer Mode Activated!');
        }
    }

    onReport = () => {
        Alert.alert('Report User', 'Are you sure you want to report this user?', [
            {
                text: 'Report',
                onPress: async () => {
                    await firestore().collection('callReport').add({
                        uid: this.state.pairedUid,
                        reportedAt: firestore.Timestamp.now(),
                    });
                    this.swipeLeft();
                }
            },
            {
                text: 'Cancel',
                onPress: () => { }
            }
        ]);
    }

    datingPeriodCheck = () => {
        // TODO: ACTUALLY CHECK FOR DATING PERIODS
        if (true) {
            this.setState({ datingPeriodActive: false });
        }
    }

    loadingAnimation = new Animated.Value(0);
    confettiAnimation = new Animated.Value(0);
    influencerAnimation = new Animated.Value(0);
    messageAnimation = new Animated.Value(0);
    datingPeriodAnimation = new Animated.Value(0);
    dpPulseAnim = new Animated.Value(0);

    render() {

        if (!this.state.preCheckCompleted) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Heart height={196} width={196} />
                    <Text>Loading</Text>
                </View>
            )
        }

        if (!this.state.hasRecordingPermission) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../../../assets/img/audio-permission.png')} style={{ height: 196, width: 196 }} />
                    <Text style={{ color: Colors.primary, fontFamily: Fonts.heading, fontSize: 32.0, textAlign: 'center', marginVertical: 16.0 }}>Oops!</Text>
                    <Text style={{ fontSize: 24.0, marginBottom: 16.0 }}>Recording Permission</Text>
                    <Text style={{ textAlign: 'center' }}>It looks like you denied the audio recording permission. hotminute works by putting you on a call with potential matches so we need access to your mic. Please go into your phone's Settings, find HotMinute and enable the microphone permission!</Text>
                </View>
            )
        }

        if (!this.state.hasLocationPermission) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../../../assets/img/location-permission.png')} style={{ height: 196, width: 196 }} />
                    <Text style={{ color: Colors.primary, fontFamily: Fonts.heading, fontSize: 32.0, textAlign: 'center', marginVertical: 16.0 }}>Oops!</Text>
                    <Text style={{ fontSize: 24.0, marginBottom: 16.0 }}>Location Permission</Text>
                    <Text style={{ textAlign: 'center' }}>It looks like you denied the location permission. hotminute works by putting you on a call with potential matches so we need access to your mic. Please go into your phone's Settings, find HotMinute and enable the location permission!</Text>
                </View>
            )
        }

        if (!this.state.locationCheckSuccessful) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../../../assets/img/location-permission.png')} style={{ height: 196, width: 196 }} />
                    <Text style={{ color: Colors.primary, fontFamily: Fonts.heading, fontSize: 32.0, textAlign: 'center', marginVertical: 16.0 }}>Oops!</Text>
                    <Text style={{ fontSize: 24.0, marginBottom: 16.0 }}>We're not available in {this.state.userLocation.regionCode} yet!</Text>
                    <Text style={{ textAlign: 'center' }}>Thanks for downloading hotminute! We don't serve your region yet but we'd love to have you on the app!</Text>
                    <Text style={{ textAlign: 'center' }}>hotminute is slowly expanding to other regions and you can make it happen in {this.state.userLocation.regionCode}. Just submit your email below and we'll make it happen as soon as possible!</Text>
                </View>
            )
        }

        let notInPool = this.state.pairingEnabled || !this.state.enteredPool ? true : this.state.pairingEnabled || this.state.enteredPool ? false : false;
        let datingPeriodColor = this.datingPeriodAnimation.interpolate({ inputRange: [0, 1], outputRange: [Colors.background, '#22222200'] });
        let hotminuteColor = this.datingPeriodAnimation.interpolate({ inputRange: [0, 1], outputRange: [Colors.primary, Colors.text] });

        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <LinearGradient style={{ flex: 1 }} colors={[Colors.primary, Colors.background]}>
                    <Animated.View style={{ flex: 1, backgroundColor: datingPeriodColor }}>
                        {
                            this.state.joinedCall && !this.state.waitingForPartner ?
                                // IF JOINED CALL
                                <Animated.View style={{ flex: 1, transform: [{ scale: this.callStartAnimation }] }}>
                                    <Swiper pictureURL={this.state.pairedProfile.pictureURL} timeLeft={this.state.timeLeft} onSwipeLeft={this.swipeLeft} onSwipeRight={this.swipeRight} onExtend={this.extendCall} onReport={this.onReport} onEndCall={this.leaveRoom} extended={this.state.bothExtended} />
                                    <View pointerEvents={'none'} style={{ position: 'absolute', height, width, top: 0, left: 0 }}>
                                        <LottieView source={require('../../../assets/animations/confetti.json')} style={{ height, width, position: 'absolute', top: 0, left: 0 }} progress={this.confettiAnimation} />
                                    </View>
                                </Animated.View>
                                :
                                <>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ paddingTop: 32.0, alignItems: 'center', justifyContent: 'center' }}>
                                            <Animated.Text style={{ fontFamily: Fonts.heading, color: hotminuteColor, fontSize: 24.0 }}>hotminute</Animated.Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 5, alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                            <View style={{ position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                                <Animated.View style={{ backgroundColor: '#fff2f622', borderRadius: 32.0, height: 64.0, width: 64.0, transform: [{ scale: this.loadingAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 5, 0] }) }] }} />
                                            </View>
                                            <Heart style={{ width: 196, height: 196 }} />
                                        </View>
                                        <Text style={{ alignSelf: 'center', textAlign: 'center', color: Colors.textLightGray, marginVertical: 2.0 }}>{this.state.waitingForPartner ? 'Waiting For Partner' : ''}</Text>
                                        {
                                            !this.state.datingPeriodActive &&
                                            <Animated.View style={{ opacity: this.messageAnimation }}>
                                                <TouchableOpacity onPress={() => this.setState({ showDatingPeriodInfo: true })}>
                                                <Icon name={'info'} size={12} color={Colors.text} />
                                                    <Text style={{ textAlign: 'center', marginHorizontal: 16.0 }}>Not getting paired with anyone? Try coming back when a <Text style={{ color: Colors.primary }}>dating period</Text> is active!</Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        }
                                        <Animated.View style={{ opacity: this.datingPeriodAnimation }}>
                                            <Animated.View style={{ transform: [{ scale: this.dpPulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }], opacity: this.dpPulseAnim }}>
                                                <TouchableOpacity onPress={() => this.setState({ showDatingPeriodInfo: true })}>
                                                    <Icon name={'info'} size={12} color={Colors.text} />
                                                    <Text style={{ textAlign: 'center', marginHorizontal: 16.0, marginVertical: 4.0, fontSize: 12.0 }}>dating period active</Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        </Animated.View>
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'flex-end', alignSelf: 'center', alignItems: 'center' }}>
                                        {
                                            !this.state.enteredPool && !this.state.joinedCall && !this.state.waitingForPartner ?
                                                <TouchableOpacity onPress={() => this.setState({ filtersVisible: true })} disabled={this.state.pairingEnabled || this.state.enteredPool}>
                                                    <Icon name={'sort'} size={32} color={Colors.textLightGray} />
                                                    <Text style={{ color: Colors.textLightGray, fontSize: 10.0 }}>FILTERS</Text>
                                                </TouchableOpacity>
                                                :
                                                null
                                        }
                                        {
                                            this.state.waitingForPartner ? null :

                                                <View style={{ marginVertical: 8.0, width, padding: 16.0 }}>
                                                    <TouchableOpacity onPress={notInPool ? this.joinPool : this.leavePool}>
                                                        <LinearGradient style={{ margin: 2.0, paddingVertical: 8.0, borderRadius: 28.0, height: 48, justifyContent: 'center', alignItems: 'center', width: '100%' }} colors={[Colors.primaryDark, Colors.primary]}>
                                                            <Animated.Text style={{ fontFamily: Fonts.heading, color: notInPool ? this.state.datingPeriodActive ? hotminuteColor : Colors.background : Colors.text }}>{notInPool ? 'Find a Match' : 'Cancel'}</Animated.Text>
                                                        </LinearGradient>
                                                    </TouchableOpacity>
                                                </View>
                                        }
                                    </View>
                                </>
                        }
                    </Animated.View>
                </LinearGradient>

                {/* MODALS GO HERE */}
                <View>
                    {/* FILTERS MODAL */}
                    <FiltersModal showModal={this.state.filtersVisible} onClose={() => this.setState({ filtersVisible: false })} />

                    {/* INSTRUCTIONS MODAL */}
                    <InstructionsModal showModal={this.state.showInstructionsPopup} onClose={() => this.setState({ showInstructionsPopup: false })} />

                    {/* SECOND CHANCE MODAL */}
                    <Modal visible={this.state.showSecondChance} transparent animationType={'slide'}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16.0 }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#212121', padding: 16.0, borderRadius: 8.0, shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 2, }}>
                                <LottieView style={{ height: 48.0, width: 48.0, margin: 8.0 }} source={require('../.././../assets/animations/SwipeClock.json')} autoPlay loop />
                                <Text style={{ fontFamily: Fonts.heading, marginTop: 16.0 }}>Uh Oh! Looks like you ran out of time!</Text>
                                <Text style={{ color: Colors.primary, marginBottom: 16.0 }}>here's a second chance</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={this.swipeLeft} style={{ flex: 1, margin: 4.0 }}><View style={{ backgroundColor: '#f55', padding: 8.0, borderRadius: 4.0 }}><Text>NOPE</Text></View></TouchableOpacity>
                                    <TouchableOpacity onPress={this.leavePool} style={{ flex: 1, margin: 4.0 }}><View style={{ backgroundColor: '#afafaf', padding: 8.0, borderRadius: 4.0 }}><Text style={{ color: Colors.background }}>CANCEL</Text></View></TouchableOpacity>
                                    <TouchableOpacity onPress={this.swipeRight} style={{ flex: 1, margin: 4.0 }}><View style={{ backgroundColor: Colors.primary, padding: 8.0, borderRadius: 4.0 }}><Text style={{ color: Colors.background }}>MATCH</Text></View></TouchableOpacity>
                                </View>
                                <Text style={{ fontSize: 10.0, marginTop: 4.0 }}>you have 5 seconds.</Text>
                            </View>
                        </View>
                    </Modal>

                    {/* DATING PERIOD INFO MODAL */}
                    <Modal visible={this.state.showDatingPeriodInfo} transparent animationType={'slide'}>
                        <View style={{ flex: 1, padding: 16.0, backgroundColor: Colors.background }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: Fonts.heading, fontSize: 32.0, }}>dating periods</Text>
                                <Text>get more matches!</Text>

                                <View style={{ flexDirection: 'row', marginVertical: 32.0 }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Image source={require('../../../assets/img/DPActive.png')} style={{ width: 128, height: 128 / 1080 * 1500, margin: 4.0, borderRadius: 8.0 }} resizeMode={'contain'} />
                                        <Text>active</Text>
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Image source={require('../../../assets/img/DPInactive.png')} style={{ width: 128, height: 128 / 1080 * 1500, margin: 4.0, borderRadius: 8.0 }} resizeMode={'contain'} />
                                        <Text>inactive</Text>
                                    </View>
                                </View>

                                <Text style={{ textAlign: 'center' }}>tired of seeing that heart pulse? introducing dating periods! special events where everyone can find more matches!</Text>

                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8.0 }}>
                                    <Image source={{ uri: 'https://media.giphy.com/media/L3KJjjqtoyzCuIVF7e/giphy.gif' }} style={{ height: 48, width: 48 }} />
                                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.primary }}>6PM</Text>
                                    <Text> Hot Chai Minute</Text>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8.0 }}>
                                    <Image source={{ uri: 'https://media.giphy.com/media/gGrKBu0MLQ4AwkJMay/giphy.gif' }} style={{ height: 48, width: 48 }} />
                                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.primary }}>9PM</Text>
                                    <Text> Dum Biryani Hour</Text>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8.0 }}>
                                    <Image source={{ uri: 'https://media.giphy.com/media/f3GQ9j5er6gyi08blo/giphy.gif' }} style={{ height: 48, width: 48 }} />
                                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.primary }}>12AM</Text>
                                    <Text> Midnight Masala Time</Text>
                                </View>
                            </View>

                            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                <Button containerStyle={{ alignSelf: 'stretch' }} title={'Continue'} onPress={() => this.setState({ showDatingPeriodInfo: false })} />
                            </View>
                        </View>
                    </Modal>
                </View>

            </View>
        )
    }
}

const mapStateToProps = state => ({
    filters: state.filters,
    userProfile: state.profiles.byId[auth().currentUser.uid],
});

const mapDispatchToProps = dispatch => ({
    getUserProfile: () => dispatch({ type: ActionTypes.FETCH_PROFILE.REQUEST, payload: auth().currentUser.uid }),
    getFilters: () => dispatch({ type: ActionTypes.FETCH_FILTERS.REQUEST }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Minute);