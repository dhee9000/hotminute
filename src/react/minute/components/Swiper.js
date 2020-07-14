import React from 'react';
import { View, Animated, Vibration, Dimensions } from 'react-native';

import { Text, RadioButton } from '../../common/components';
import { Fonts, Colors } from '../../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../../redux/ActionTypes';

import { PanGestureHandler, State } from 'react-native-gesture-handler';

import LottieView from 'lottie-react-native';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const { height, width } = Dimensions.get('screen');

class Swiper extends React.Component {

    gestureX = new Animated.Value(0);
    gestureY = new Animated.Value(0);

    swipeProgress = new Animated.Value(0.5);
    extendProgress = new Animated.Value(0.16);

    state = {
        rightThreshold: false,
        leftThreshold: false,
        downThreshold: false,

        swipedRight: false,
        swipedLeft: false,
        swipedDown: false,
    }

    onSwipeRight = () => {
        if (this.props.onSwipeRight) {
            this.props.onSwipeRight();
        }
    }

    onSwipeLeft = () => {
        if (this.props.onSwipeLeft) {
            this.props.onSwipeLeft();
        }
    }

    onExtend = () => {
        if (this.props.onExtend) {
            this.props.onExtend();
        }
    }

    componentDidMount() {
        this.gestureX.addListener(data => {
            let { value } = data;
            if (value > 100 && !this.state.rightThreshold) {
                this.setState({ rightThreshold: true });
            }
            if (value < 100 && this.state.rightThreshold) {
                this.setState({ rightThreshold: false });
            }
            if (value < -100 && !this.state.leftThreshold) {
                this.setState({ leftThreshold: true });
            }
            if (value > -100 && this.state.leftThreshold) {
                this.setState({ leftThreshold: false });
            }

        });
        this.gestureY.addListener(data => {
            let { value } = data;
            if (value > 100 && !this.state.downThreshold) {
                this.setState({ downThreshold: true });
            }
            if (value < 100 && this.state.downThreshold) {
                this.setState({ downThreshold: false });
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.rightThreshold && this.state.rightThreshold) {
            Vibration.vibrate([50, 50, 50, 50,]);
        }
        if (!prevState.leftThreshold && this.state.leftThreshold) {
            Vibration.vibrate([300, 300]);
        }
        if (!prevState.downThreshold && this.state.downThreshold) {
            Vibration.vibrate([50, 50, 50, 50, 50, 50]);
        }
        if (!prevState.swipedRight && this.state.swipedRight) {
            this.swipeProgress.setValue(0.5);
            Animated.timing(this.swipeProgress, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false
            }).start();
        }
        if (!prevState.swipedLeft && this.state.swipedLeft) {
            this.swipeProgress.setValue(0.5);
            Animated.timing(this.swipeProgress, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false
            }).start();
        }
        if (!prevState.swipedLeft && this.state.swipedLeft) {
            this.swipeProgress.setValue(0.5);
            Animated.timing(this.swipeProgress, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false
            }).start();
        }
        if (!prevState.swipedDown && this.state.swipedDown) {
            Animated.timing(this.extendProgress, {
                toValue: 0.5,
                duration: 1000,
                useNativeDriver: false,
            }).start();
        }
    }

    handleGestureStateChanged = ({ nativeEvent: event }) => {
        if (event.state === State.END) {
            Animated.parallel([
                Animated.timing(this.gestureX, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false
                }),
                Animated.timing(this.gestureY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false
                })
            ]).start();
        }
        if (event.state === State.END && this.state.rightThreshold) {
            this.setState({ swipedRight: true, swipedLeft: false });
            this.onSwipeRight();
        }
        if (event.state === State.END && this.state.leftThreshold) {
            this.setState({ swipedLeft: true, swipedRight: false });
            this.onSwipeLeft();
        }
        if (event.state === State.END && this.state.downThreshold) {
            this.setState({ swipedDown: true });
            this.onExtend();
        }
    }

    render() {

        let imageRotateY = this.gestureX.interpolate({ inputRange: [-100, 100], outputRange: ['-45deg', '45deg'], extrapolate: 'clamp' });
        let imageRotateX = this.gestureY.interpolate({ inputRange: [0, 100], outputRange: ['0deg', '-45deg'], extrapolate: 'clamp' });
        let swipeRightProgress = this.gestureX.interpolate({ inputRange: [0, 100], outputRange: [0, 0.5], extrapolate: 'clamp' });
        let swipeLeftProgress = this.gestureX.interpolate({ inputRange: [-100, 0], outputRange: [0.5, 0], extrapolate: 'clamp' });
        let swipeDownProgress = this.gestureY.interpolate({ inputRange: [0, 100], outputRange: [0, 0.16], extrapolate: 'clamp' });

        return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View style={{ transform: [{ rotateY: imageRotateY }, { rotateX: imageRotateX }] }}>
                    <Animated.Image blurRadius={8.0} source={{ uri: this.props.pictureURL ? this.props.pictureURL : BLANK_IMAGE_URI }} style={{ height, width, borderRadius: 8.0 }} />
                </Animated.View>
                <PanGestureHandler onHandlerStateChange={this.handleGestureStateChanged} onGestureEvent={Animated.event([{ nativeEvent: { translationX: this.gestureX, translationY: this.gestureY } }], { useNativeDriver: false })} minPointers={1} maxPointers={1}>
                    <Animated.View style={{ position: 'absolute', top: 0, left: 0, height, width, alignItems: 'center', justifyContent: 'center', backgroundColor: '#33333377' }}>
                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ alignSelf: 'center', fontFamily: Fonts.heading, fontSize: 96.0, color: Colors.primary }}>{this.props.timeLeft}</Text>
                        </View>
                        <View style={{ flex: 1, margin: 16, width: 256, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <LottieView source={require('../../../../assets/animations/SwipeLeft.json')} style={{ height: 48, width: 48 }} progress={this.state.swipedLeft ? this.swipeProgress : swipeLeftProgress} />
                                <Animated.Text style={{ fontSize: 12.0, color: this.gestureX.interpolate({ inputRange: [-100, 0], outputRange: ['#f55', Colors.textLightGray], extrapolate: 'clamp' }) }}>NO</Animated.Text>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <LottieView source={require('../../../../assets/animations/SwipeClock.json')} style={{ height: 48, width: 48 }} progress={this.state.swipedDown ? this.extendProgress : swipeDownProgress} />
                                <Animated.Text style={{ fontSize: 12.0, color: this.gestureY.interpolate({ inputRange: [0, 100], outputRange: [Colors.textLightGray, '#55f'], extrapolate: 'clamp' }) }}>EXTEND</Animated.Text>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <LottieView source={require('../../../../assets/animations/SwipeRight.json')} style={{ height: 48, width: 48 }} progress={this.state.swipedRight ? this.swipeProgress : swipeRightProgress} />
                                <Animated.Text style={{ fontSize: 12.0, color: this.gestureX.interpolate({ inputRange: [0, 100], outputRange: [Colors.textLightGray, '#5f5'], extrapolate: 'clamp' }) }}>YES</Animated.Text>
                            </View>
                        </View>
                    </Animated.View>
                </PanGestureHandler>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Swiper);