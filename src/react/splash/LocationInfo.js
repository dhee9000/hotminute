import React from 'react';
import { View, Image, Animated } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { Input, Button } from 'react-native-elements';

import Heart from '../../../assets/svg/heart.svg';

import { LinearGradient } from 'expo-linear-gradient';

class DatingPeriodInfo extends React.Component {

    state = {
        state: '',
        email: '',
    }

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

        let state = this.props.navigation.getParam('state', 'TX');
        this.setState({ state });
    }

    loadingAnim = new Animated.Value(0);

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }}>
                <LinearGradient style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16.0 }} colors={[Colors.primary, Colors.background]}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 18 }}>so close, and yet so far...</Text>
                    <Text>we're sorry</Text>
                    <Text style={{ fontSize: 32.0 }}>We're not in {this.state.state}. Yet.</Text>
                    <Animated.View source={require('../../../assets/img/logo.png')} style={
                        {
                            transform: [
                                { scale: this.loadingAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.8, 1] }) }
                            ], opacity: this.enterAnim
                        }
                    }>
                        <Heart height={144} width={144} />
                    </Animated.View>
                    <Text>Thanks for downloading hotminute! We don't serve your region yet but we'd love to have you on the app!</Text>
                    <Image source={{ uri: 'https://i.pinimg.com/originals/78/de/86/78de8609e904478be4d68c89cff62e63.jpg' }} style={{ height: 120, width: 120, borderRadius: 8.0, margin: 16.0 }} />
                    <Text>hotminute is slowly expanding to other regions and you can make it happen in {this.state.state}. Just submit your email below and we'll make it happen as soon as possible!</Text>
                    <Input
                        inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                        inputContainerStyle={{ borderColor: Colors.accent, alignSelf: 'stretch', width: '100%' }}
                        containerStyle={{alignSelf: 'stretch'}}
                        placeholderTextColor={Colors.textLightGray}
                        placeholder={'johndoe@gmail.com'}
                        onChangeText={email => this.setState({ email })}
                        value={this.state.email}
                    />
                    <Button containerStyle={{alignSelf: 'stretch'}} title={'Bring hotminute to ' + this.state.state + '!'} />
                </LinearGradient>
            </View>
        )
    }
}

export default DatingPeriodInfo;