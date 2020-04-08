import React from 'react';
import { View, ActivityIndicator, ImageBackground, Dimensions } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';
import { Colors, Fonts } from '../../config';

import { Button, Icon } from 'react-native-elements';

import WelcomeSVG from '../../../assets/svg/WelcomeBackground.svg';

const { width, height } = Dimensions.get('screen');

const BACKGROUND_IMAGE_URI = 'https://static01.nyt.com/images/2020/03/15/fashion/weddings/15Loveisblindjp1/oakImage-1584016654886-mediumSquareAt3X.jpg';

class Start extends React.Component{

    onLoginPressed = () => {
        this.props.navigation.navigate('Login');
    }

    onSignupPressed = () => {
        this.props.navigation.navigate('Onboarding');
    }

    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center'}}>
                <ImageBackground source={{uri: BACKGROUND_IMAGE_URI}} blurRadius={2} style={{width, height}}>
                    <View style={{flex: 1, justifyContent: 'space-between', backgroundColor: '#33333355', alignItems: 'center'}}>
                        <WelcomeSVG width={width} height={225} />
                        <View style={{position: 'absolute', top: 72, left: 16, justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                            <Text style={{fontFamily: Fonts.heading, fontSize: 32.0,}}>Hot{"\n"}Minute</Text>
                            {/* <ActivityIndicator size={'large'} /> */}
                        </View>
                        <Text style={{fontSize: 24.0, color: Colors.background}}>Meet your match!</Text>
                        <View style={{transform: [{rotate: '-180deg'}]}}>
                            <WelcomeSVG width={width} height={225} />
                        </View>
                        <View style={{position: 'absolute', width, paddingHorizontal: 16.0, bottom: 16, alignContent: 'stretch'}}>
                            <Button title='Login' onPress={this.onLoginPressed} containerStyle={{marginVertical: 2.0}} />
                            <Button title='Signup' onPress={this.onSignupPressed} containerStyle={{marginVertical: 2.0}} />
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