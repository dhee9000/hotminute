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

const LAUNCH_DATE = new Date(1601604000000);

function dateDiffInDays(date1, date2) {
    // round to the nearest whole number
    return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
}

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
        showMarketingPopup: false,

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
        if (prevProps.filters.loaded != this.props.filters.loaded) {
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

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ enteredPool: false, pairedUid: null });
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
        Alert.alert('Join Call', `Are you ready to join this call? Your partner's name is ${this.state.pairedProfile.fname} ${this.state.pairedProfile.lname}.`, [
            {
                text: 'Join',
                onPress: () => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
        this.setState({ showInstructionsPopup: false });
        if (this.state.timer) {
            clearTimeout(this.state.timer);
        }
        RtcEngine.leaveChannel();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ partnerOnCall: false, partnerUid: null, joinedCall: false, timer: null, waitingForPartner: false });
        this.leavePool();
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

    loadingAnimation = new Animated.Value(0);
    confettiAnimation = new Animated.Value(0);
    influencerAnimation = new Animated.Value(0);

    render() {

        let currentTime = new Date();
        if (currentTime < LAUNCH_DATE && !this.state.influencerModeActive) {
            return (
                <View style={{ flex: 1, padding: 16.0, justifyContent: 'center', alignItems: 'center' }}>
                    <LottieView source={require('../../../assets/animations/confetti.json')} style={{ height, width, position: 'absolute', top: 0, left: 0, transform: [{ scale: 1.25 }] }} pointerEvents={'none'} autoPlay speed={0.5} loop={false} />
                    <TouchableWithoutFeedback onPress={this.onHMPress}>
                        <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 32.0 }}>hotminute</Text>
                    </TouchableWithoutFeedback>
                    <Text>welcome to hotminute!</Text>
                    <View style={{ margin: 32.0, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row', margin: 16.0 }}>
                            <TouchableWithoutFeedback onPress={this.timerPressed}>
                                <Animated.View style={{ backgroundColor: Colors.primary, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', transform: [{ scale: this.influencerAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] }) }] }}>
                                    <Text style={{ fontSize: 48.0 }}>{dateDiffInDays(currentTime, LAUNCH_DATE)}</Text>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>
                        <Text style={{ fontSize: 32.0 }}>DAYS</Text>
                    </View>
                    <Text style={{ textAlign: 'center' }}><Text style={{ color: Colors.primary }}>GRAND RELEASE</Text> on October 1st at 9:00PM CST to start matching! in the meantime, you can check out our instagram to stay updated!</Text>
                    <View style={{ marginTop: 16.0 }}>
                        <SocialIcon type={'instagram'} light onPress={() => { Linking.openURL('https://instagram.com/hotminuteapp') }} />
                    </View>
                </View>
            )
        }


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


        // TODO: Review Logic
        let notInPool = this.state.pairingEnabled || !this.state.enteredPool ? true : this.state.pairingEnabled || this.state.enteredPool ? false : false;
        
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <View style={{ flex: 1 }}>
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
                                        <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 24.0 }}>hotminute</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 5 }}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Animated.View style={{ backgroundColor: '#fff2f622', borderRadius: 32.0, height: 64.0, width: 64.0, transform: [{ scale: this.loadingAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 5, 0] }) }] }} />
                                        </View>
                                        {/* <Image source={require('../../../assets/img/logo.png')} style={{ height: 128.0, width: 128.0, borderRadius: 8.0 }} /> */}
                                        <Heart style={{ width: 196, height: 196 }} />
                                    </View>
                                    <Text style={{ alignSelf: 'center', textAlign: 'center', color: Colors.textLightGray, marginVertical: 2.0 }}>{this.state.waitingForPartner ? 'Waiting For Partner' : ''}</Text>
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
                                                        <Text style={{ fontFamily: Fonts.heading, color: notInPool ? Colors.background : Colors.text }}>{notInPool ? 'Find a Match' : 'Cancel'}</Text>
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            </View>
                                    }
                                </View>
                            </>
                    }
                </View>

                {/* FILTERS MODAL */}
                <FiltersModal showModal={this.state.filtersVisible} onClose={() => this.setState({ filtersVisible: false })} />

                {/* INSTRUCTIONS MODAL */}
                <InstructionsModal showModal={this.state.showInstructionsPopup} onClose={() => this.setState({ showInstructionsPopup: false })} />

                {/* MARKETING PROMO MODAL */}
                <Modal visible={this.state.showMarketingPopup} transparent animated animationType={'fade'}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, }}>
                        <View style={{ backgroundColor: Colors.background, justifyContent: 'flex-start', alignItems: 'center', borderRadius: 16.0, elevation: 4.0, marginHorizontal: 16.0 }}>
                            <TouchableOpacity onPress={() => this.setState({ showMarketingPopup: false })} style={{ position: 'absolute', top: 8.0, left: 8.0, margin: 4.0, backgroundColor: Colors.primary, borderRadius: 16, elevation: 1.0, zIndex: 2 }}>
                                <Icon name={'close'} size={32} color={Colors.background} />
                            </TouchableOpacity>
                            <Image source={{ uri: 'https://img.rawpixel.com/s3fs-private/rawpixel_images/website_content/v346-filmful-16-confettibackground_2.jpg?bg=transparent&con=3&cs=srgb&dpr=1&fm=jpg&ixlib=php-3.1.0&q=80&usm=15&vib=3&w=1300&s=48e970065b37ebf5466b48691a2a847d' }}
                                style={{ height: 128.0, width: 312.0 }} resizeMode={'cover'} resizeMethod={'scale'}
                            />
                            <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, marginVertical: 4.0, marginHorizontal: 16.0 }}>Pickup Line Contest</Text>
                            <Text style={{ margin: 16.0 }}>Enter your best pickup lines and get a chance to win <Text style={{ color: Colors.primary }}>hotminute premium</Text>!</Text>
                            <TouchableOpacity style={{ alignSelf: 'stretch', margin: 16.0 }}>
                                <LinearGradient style={{ margin: 2.0, paddingVertical: 16.0, borderRadius: 28.0, height: 56, justifyContent: 'center', alignItems: 'center', width: '100%' }} colors={notInPool ? [Colors.primaryDark, Colors.primary] : ['#f55', '#f77']}>
                                    <Text style={{ fontFamily: Fonts.heading, color: Colors.background }}>Enter Now</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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