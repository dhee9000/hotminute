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
import storage from '@react-native-firebase/storage';
import config from '../../config/Agora';

const MAPS_API_KEY = GoogleMaps.key;

class Splash extends React.Component {

    state = {
        currentActionString: '',
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
                this.setState({ currentActionString: 'Checking Permission...' });
                let permissionGranted = await Location.requestPermission({ ios: "whenInUse", android: { detail: "coarse" } })
                if (!permissionGranted) {
                    alert("You must grant location permissions for HotMinute to work!");
                }
                else {
                    this.setState({ currentActionString: 'Checking Location...' });
                    let currentLocation = await Location.getLatestLocation();
                    let { longitude, latitude } = currentLocation;
                    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAPS_API_KEY}`);
                    let addressLookup = await response.json();
                    console.log(addressLookup);
                    let stateCode = addressLookup.results[0].address_components.filter(component => component.types.includes('administrative_area_level_1'))[0].short_name;
                    if (!stateCode === 'TX') {
                        this.goToLocation(stateCode);
                    }
                    else {
                        this.setState({ currentActionString: 'Checking Dating Period...' });
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
                        if (!inDatingPeriod) {
                            this.goToDatingPeriods();
                        }
                        else {
                            this.props.navigation.navigate('Main');
                        }
                    }
                }
            }
        }
    }

    goToStart = () => {
        setTimeout(() => {
            this.props.navigation.navigate('Start');
        }, 1000);
    }

    goToLocation = state => {
        setTimeout(() => {
            this.props.navigation.navigate('LocationInfo', { state });
        }, 1000);
    }

    goToDatingPeriods = () => {
        setTimeout(() => {
            this.props.navigation.navigate('DatingPeriodInfo');
        }, 1000);
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