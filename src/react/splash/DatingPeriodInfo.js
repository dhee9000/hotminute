import React from 'react';
import { View, Image, Animated } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import Heart from '../../../assets/svg/heart.svg';

import { LinearGradient } from 'expo-linear-gradient';

class DatingPeriodInfo extends React.Component {

    componentDidMount() {
        Animated.loop(
            Animated.timing(this.loadingAnim,
                {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }
            )
        ).start();
    }

    loadingAnim = new Animated.Value(0);

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                <LinearGradient style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16.0 }} colors={[Colors.primary, Colors.background]}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 18 }}>the time isn't quite right...</Text>
                    <Text>introducing</Text>
                    <Text style={{ fontSize: 32.0 }}>Dating Periods</Text>
                    <Animated.View source={require('../../../assets/img/logo.png')} style={
                        {
                            transform: [
                                { scale: this.loadingAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.8, 1] }) }
                            ], opacity: this.enterAnim
                        }
                    }>
                        <Heart height={144} width={144} />
                    </Animated.View>
                    <Text>hotminute needs your potential matches to be online at the same time as you so that you can chat with them!</Text>
                    <Image source={{ uri: 'https://www.nationalgeographic.com/content/dam/science/2019/03/08/daylight-saving/dst5.gif' }} style={{ height: 120, width: 120, borderRadius: 8.0, margin: 16.0 }} />
                    <Text>That's why we have Dating Periods. Check back at these special times of the day to find your match!</Text>
                    <Image source={{ uri: 'https://media1.giphy.com/media/ZvFsqDaaOLkSQ/giphy.gif' }} style={{ height: 120, width: 120, borderRadius: 8.0, margin: 16.0 }} />
                </LinearGradient>
            </View>
        )
    }
}

export default DatingPeriodInfo;