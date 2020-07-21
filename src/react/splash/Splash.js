import React from 'react';
import { View, Image, Animated } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors, GoogleMaps } from '../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';

import Location from 'react-native-location';

import Heart from '../../../assets/svg/heart.svg';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import storage from '@react-native-firebase/storage';
import config from '../../config/Agora';

const MAPS_API_KEY = GoogleMaps.key;

class Splash extends React.Component {

    state = {
        currentActionString: '',
        initialTimeOver: false,
        jumpTo: null,
    }


    async componentDidMount() {

        Animated.sequence([
            Animated.timing(this.enterAnim,
                {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }
            ),
            Animated.loop(
                Animated.timing(this.loadingAnim,
                    {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }
                )
            )
        ]).start();

        setTimeout(() => {
            this.setState({ initialTimeOver: true });
        }, 1000)

        this.setState({ currentActionString: 'Checking User...' });
        if (!auth().currentUser) {
            this.goToStart();
        }
        else {
            this.setState({ currentActionString: 'Checking Profile...' });
            let profileDocSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
            if (!profileDocSnapshot.exists || !profileDocSnapshot.data().profileComplete) {
                this.goToStart();
            }
            else {
                this.setState({ currentActionString: 'Registering Notifications...' });
                let fcmToken = await messaging().getToken();
                await firestore().collection('users').doc(auth().currentUser.uid).set({
                    fcmTokens: firestore.FieldValue.arrayUnion(fcmToken)
                }, { merge: true });

                this.setState({ currentActionString: 'Almost Done...'})
                this.goToMain();
            }
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.initialTimeOver && this.state.jumpTo){
            this.props.navigation.navigate(this.state.jumpTo);
        }
    }

    goToStart = () => {
        this.setState({ jumpTo: 'Start'});
    }

    goToMain = () => {
        this.setState({ jumpTo: 'Main'});
    }

    goToLocation = state => {
        this.setState({ jumpTo: 'Location'});
    }

    goToDatingPeriods = () => {
        this.setState({ jumpTo: 'DatingPeriodInfo'});
    }

    enterAnim = new Animated.Value(0);
    loadingAnim = new Animated.Value(0);

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View source={require('../../../assets/img/logo.png')} style={
                    {
                        transform: [
                            { translateY: this.enterAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) },
                            { scale: this.loadingAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.8, 1] }) }
                        ], opacity: this.enterAnim
                    }
                }>
                    <Heart height={256} width={256} />
                </Animated.View>
                <Animated.Text style={
                    [
                        { fontFamily: Fonts.heading, fontSize: 32, color: Colors.primary },
                        { transform: [{ translateY: this.enterAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }], opacity: this.enterAnim }
                    ]}>hotminute</Animated.Text>
                <Text>{this.state.currentActionString}</Text>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Splash);