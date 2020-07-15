import React from 'react';
import { View, ActivityIndicator, ImageBackground, Dimensions, TouchableHighlight, TouchableOpacity, Image, Animated, Easing } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';
import { Colors, Fonts } from '../../config';

import { Button, Icon } from 'react-native-elements';

import WelcomeSVG from '../../../assets/svg/WelcomeBackground.svg';

const { width, height } = Dimensions.get('screen');

const BACKGROUND_IMAGE_URI = 'https://m.economictimes.com/thumb/msid-64168358,width-1200,height-900,resizemode-4,imgsize-243202/magazines/panache/lingo-jingo-update-your-dictionary-with-these-new-age-dating-terms/breadcrumbing-orbiting-and-more-update-your-dating-dictionary-with-these-new-age-terms/lingo-jingo-update-your-dictionary-with-these-new-age-dating-terms.jpg';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { LinearGradient } from 'expo-linear-gradient';

class Start extends React.Component {

    state = {
        signedIn: auth().currentUser ? true : false,
        profileFetched: false,
    }

    enterAnimation = new Animated.Value(0);

    async componentDidMount() {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
        }
        let token = await messaging().getToken();
        console.log(token);
        setTimeout(() =>
            Animated.timing(this.enterAnimation, {
                toValue: 1,
                duration: 1000,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start(), 500);
        if (auth().currentUser) {
            let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
            let profileData = profileSnapshot.data();
            if (profileSnapshot.exists) {
                this.setState({ profileFetched: true, ...profileData });
                this.props.navigation.navigate('Main');
            }
        }
    }

    signOutPressed = async () => {
        await auth().signOut();
        this.setState({ signedIn: false });
    }

    onGetStartedPressed = async () => {
        if (auth().currentUser) {
            if (this.state.profileComplete) {
                this.props.navigation.navigate('Main');
            }
            else {
                this.props.navigation.navigate('CreateProfileName');
            }
        }
        else {
            this.props.navigation.navigate('Login');
        }
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ImageBackground source={{ uri: BACKGROUND_IMAGE_URI }} blurRadius={2} style={{ width, height }}>
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#33333355', alignItems: 'center' }}>
                        {/* <WelcomeSVG width={width} height={225} /> */}
                        <View style={{ position: 'absolute', top: 72, left: 16, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                            <Text style={{ fontFamily: Fonts.heading, fontSize: 32.0, color: Colors.background }}>Hot{"\n"}Minute</Text>
                        </View>
                        <Animated.Image source={require('../../../assets/img/logo.png')} style={{ height: 256, width: 256, borderRadius: 16.0, opacity: this.enterAnimation.interpolate({ inputRange: [0, 0.5], outputRange: [0, 1], extrapolate: 'clamp' }), transform: [{ translateY: this.enterAnimation.interpolate({ inputRange: [0, 0.5], outputRange: [100, 0], extrapolate: 'clamp' }) }] }} />
                        <Animated.Text style={{ fontFamily: Fonts.primary, fontSize: 32.0, color: Colors.background, opacity: this.enterAnimation.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' }), transform: [{ scale: this.enterAnimation.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' }) }] }}>BETA</Animated.Text>
                        {/* <View style={{ transform: [{ rotate: '-180deg' }] }}>
                            <WelcomeSVG width={width} height={225} />
                        </View> */}
                        <View style={{ position: 'absolute', width, paddingHorizontal: 16.0, bottom: 16, alignContent: 'stretch', marginBottom: 16.0 }}>
                            {this.state.signedIn ? <Text style={{ color: Colors.textLightGray, fontSize: 10.0, alignSelf: 'center', marginBottom: 4.0 }}>Signed in as {this.state.profileFetched ? `${this.state.fname} ${this.state.lname}` : auth().currentUser.uid} <Text style={{ fontSize: 10.0, color: Colors.textLightGray, textDecorationLine: 'underline' }} onPress={this.signOutPressed}>Sign Out</Text></Text> : null}
                            <TouchableOpacity onPress={this.onGetStartedPressed} onLongPress={() => this.props.navigation.navigate('GodMode')}>
                                <LinearGradient
                                    style={{ flex: 1, paddingVertical: 16.0, borderRadius: 64.0, justifyContent: 'center', alignItems: 'center', width: '100%' }}
                                    colors={[Colors.primaryDark, Colors.primary]}
                                >
                                    <Text style={{ fontFamily: Fonts.heading, color: Colors.background }}>Get Started</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Start);