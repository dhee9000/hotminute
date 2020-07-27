import React from 'react';
import { View, Image, Animated } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import firestore from '@react-native-firebase/firestore';

import Heart from '../../../assets/svg/heart.svg';

import { LinearGradient } from 'expo-linear-gradient';

import CountDown from 'react-native-countdown-component';

class DatingPeriodInfo extends React.Component {

    state={
        inDatingPeriod: false,
        datingPeriods: [],
        datingPeriodLength: 0,
        timeToNext: 10,
    }

    async componentDidMount() {
        Animated.loop(
            Animated.timing(this.loadingAnim,
                {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }
            )
        ).start();

        let configDocSnapshot = await firestore().collection('meta').doc('config').get();
        let { datingPeriods, datingPeriodLength } = configDocSnapshot.data();
        datingPeriods = datingPeriods.map(period => period.toDate());

        let inDatingPeriod = false;
        let nextDatingPeriod = new Date(2524715940000);
        let currentHour = new Date().getUTCHours();

        datingPeriods.map(datingPeriod => {
            if (datingPeriod.getUTCHours() <= currentHour && datingPeriod.getUTCHours() + datingPeriodLength / 60 >= currentHour) {
                inDatingPeriod = inDatingPeriod || true;
            }
            else {
                inDatingPeriod = inDatingPeriod || false;
            }

            if(datingPeriod.getUTCHours() - nextDatingPeriod.getUTCHours() < 0 && nextDatingPeriod.getUTCHours() > currentHour){
                console.log("CHECK")
                nextDatingPeriod = new Date(datingPeriod.getTime());
            }
        });

        if(nextDatingPeriod.getTime() == new Date(2524715940000).getTime()){
            nextDatingPeriod = datingPeriods[0];
        }

        let timeToNext = Math.max((nextDatingPeriod.getUTCHours() - currentHour)*60*60, 24*60*60 - (currentHour - nextDatingPeriod.getUTCHours())*60*60);
        console.log(timeToNext);
        this.setState({timeToNext, inDatingPeriod, datingPeriods, datingPeriodLength});
    }

    loadingAnim = new Animated.Value(0);

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                <LinearGradient style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16.0 }} colors={[Colors.primary, Colors.background]}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 18 }}>the time isn't quite right...</Text>
                    <Text>introducing</Text>
                    <Text style={{ fontSize: 32.0 }}>Dating Periods</Text>
                    <Animated.View source={require('../../../assets/img/logo.png')} style={{ transform: [{ scale: this.loadingAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.8, 1] }) }], opacity: this.enterAnim }}>
                        <Heart height={144} width={144} />
                    </Animated.View>
                    <CountDown
                        until={this.state.timeToNext}
                        size={24}
                        running={true}
                    />
                    <Text style={{ textAlign: 'center' }}>hotminute needs your potential matches to be online at the same time as you so that you can chat with them!</Text>
                    <Text style={{ textAlign: 'center' }}>That's why we have Dating Periods. Check back at these special times of the day to find your match!</Text>
                </LinearGradient>
            </View>
        )
    }
}

export default DatingPeriodInfo;