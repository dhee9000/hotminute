import React from 'react';
import { View, ActivityIndicator, ImageBackground, Dimensions, TouchableHighlight, TouchableOpacity, Image } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';
import { Colors, Fonts } from '../../config';

import { Button, Icon } from 'react-native-elements';

import WelcomeSVG from '../../../assets/svg/WelcomeBackground.svg';

const { width, height } = Dimensions.get('screen');

const BACKGROUND_IMAGE_URI = 'https://static01.nyt.com/images/2020/03/15/fashion/weddings/15Loveisblindjp1/oakImage-1584016654886-mediumSquareAt3X.jpg';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

class Start extends React.Component {

    state = {
        signedIn: auth().currentUser ? true : false,
        profileFetched: false,
    }

    async componentDidMount() {
        if(auth().currentUser){
            let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
            let profileData = profileSnapshot.data();
            if (profileSnapshot.exists) {
                this.setState({ profileFetched: true, ...profileData })
            }
        }
    }

    signOutPressed = async () => {
        await auth().signOut();
        this.setState({signedIn: false});
    }

    onGetStartedPressed = async () => {
        if (auth().currentUser) {
            if(this.state.profileComplete){
                this.props.navigation.navigate('Main');
            }
            else{
                this.props.navigation.navigate('CreateProfileBio');
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
                    <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: '#33333355', alignItems: 'center' }}>
                        <WelcomeSVG width={width} height={225} />
                        <View style={{ position: 'absolute', top: 72, left: 16, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                            <Text style={{ fontFamily: Fonts.heading, fontSize: 32.0, }}>Hot{"\n"}Minute</Text>
                        </View>
                        <Image source={require('../../../assets/img/logo.png')} style={{ height: 128, width: 128, borderRadius: 8.0 }} />
                        <Text style={{ fontSize: 24.0, color: Colors.background }}>Meet your match!</Text>
                        <View style={{ transform: [{ rotate: '-180deg' }] }}>
                            <WelcomeSVG width={width} height={225} />
                        </View>
                        <View style={{ position: 'absolute', width, paddingHorizontal: 16.0, bottom: 16, alignContent: 'stretch', marginBottom: 16.0 }}>
                            {this.state.signedIn ? <Text style={{ color: Colors.textLightGray, fontSize: 10.0, alignSelf: 'center' }}>Signed in as {this.state.profileFetched ? `${this.state.fname} ${this.state.lname}` : auth().currentUser.uid} <Text style={{fontSize: 10.0, color: Colors.textLightGray, textDecorationLine: 'underline'}} onPress={this.signOutPressed}>Sign Out</Text></Text> : null}
                            <TouchableOpacity onPress={this.onGetStartedPressed} onLongPress={() => this.props.navigation.navigate('GodMode')}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 16.0, backgroundColor: Colors.primary, borderRadius: 64.0 }}>
                                    <Text style={{ fontFamily: Fonts.heading, color: Colors.background }}>Get Started</Text>
                                </View>
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