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

import Heart from '../../../assets/svg/heart.svg';

import { DatingPeriodInfo } from '../splash';

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

        showInstructionsPopup: false,
        showMarketingPopup: false,

        inDatingPeriod: false,

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
            this.setState({ joinedCall: true, showInstructionsPopup: true });
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

        let configDocSnapshot = await firestore().collection('meta').doc('config').get();
        let { datingPeriods, datingPeriodLength } = configDocSnapshot.data();
        datingPeriods = datingPeriods.map(period => period.toDate());

        let inDatingPeriod = false;
        let currentHour = new Date().getUTCHours();

        datingPeriods.map(datingPeriod => {
            if (datingPeriod.getUTCHours() <= currentHour && datingPeriod.getUTCHours() + datingPeriodLength / 60 >= currentHour) {
                inDatingPeriod = inDatingPeriod || true;
            }
            else {
                inDatingPeriod = inDatingPeriod || false;
            }
        });
        this.setState({ inDatingPeriod });
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
            enteredAt: firebase.firestore.FieldValue.serverTimestamp(),
            active: true,
        });

        // Listen for changes to entry
        let unsubscribePoolEntry = firestore().collection('pairingPool').doc(poolEntrySnapshot.id).onSnapshot(async docSnapshot => {
            let data = docSnapshot.data();
            if (data.paired && !data.matched) {
                let pairedProfileSnapshot = await firestore().collection('profiles').doc(data.pairedUid).get();
                let pairedProfile = pairedProfileSnapshot.data();
                let pairedProfilePictureURL = await storage().ref(pairedProfile.images["1"].ref).getDownloadURL();
                pairedProfile.pictureURL = pairedProfilePictureURL;
                this.setState({ roomId: data.roomId, roomToken: data.roomToken, pairedUid: data.pairedUid, pairedProfile, paired: true }, this.joinRoom)
            }
            if (data.matched) {
                this.leaveRoom();
                this.props.navigation.navigate('Matches');
                this.state.unsubscribePoolEntry();
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
        this.state.unsubscribePoolEntry();
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
                <View style={{ flex: 1 }}>
                    {
                        !this.state.inDatingPeriod ? 

                        <DatingPeriodInfo />

                        :

                        this.state.joinedCall ?
                            // IF JOINED CALL
                            <Animated.View style={{ transform: [{ scale: this.callStartAnimation }] }}>
                                <Swiper pictureURL={this.state.pairedProfile.pictureURL} timeLeft={this.state.timeLeft} onSwipeLeft={this.swipeLeft} onSwipeRight={this.swipeRight} onExtend={this.extendCall} />
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
                                        !this.state.enteredPool && !this.state.joinedCall ?
                                            <TouchableOpacity onPress={() => this.setState({ filtersVisible: true })} disabled={this.state.pairingEnabled || this.state.enteredPool}>
                                                <Icon name={'sort'} size={32} color={Colors.textLightGray} />
                                            </TouchableOpacity>
                                            :
                                            null
                                    }
                                    <View style={{ marginVertical: 8.0, width, padding: 16.0 }}>
                                        <TouchableOpacity onPress={notInPool ? this.joinPool : this.leavePool}>
                                            <LinearGradient style={{ margin: 2.0, paddingVertical: 8.0, borderRadius: 28.0, height: 48, justifyContent: 'center', alignItems: 'center', width: '100%' }} colors={notInPool ? [Colors.primaryDark, Colors.primary] : ['#f55', '#f77']}>
                                                <Text style={{ fontFamily: Fonts.heading, color: Colors.background }}>{notInPool ? 'Find a Match' : 'Cancel'}</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
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
                            renderScene={SceneMap({ distance: DistanceFilter, gender: GenderFilter, age: AgeFilter })}
                            renderTabBar={props => <TabBar {...props} onChangeTab={i => this.setState({ filterTabIdx: i })} />}
                            onIndexChange={idx => this.setState({ filterTabIdx: idx })}
                        />
                    </View>
                </Modal>

                {/* INSTRUCTIONS MODAL */}
                <Modal visible={this.state.showInstructionsPopup} transparent animated animationType={'slide'}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, }}>
                        <View style={{ backgroundColor: Colors.text, justifyContent: 'flex-start', alignItems: 'center', borderRadius: 16.0, elevation: 4.0, marginHorizontal: 16.0, padding: 16.0 }}>
                            <TouchableOpacity onPress={() => this.setState({ showInstructionsPopup: false })}>
                                <Icon name={'close'} size={32} color={Colors.primary} />
                            </TouchableOpacity>
                            <Text style={{ color: '#f55' }}>Swipe Left if you are not interested</Text>
                            <Text style={{ color: '#5f5' }}>Swipe Right if you are interested</Text>
                            <Text style={{ color: '#55f' }}>Swipe Down to extend your time</Text>
                            <Text style={{ color: Colors.primary }}>Have a flipping amazing time :)</Text>
                        </View>
                    </View>
                </Modal>

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