import React from 'react';
import { View, Animated, Vibration, Dimensions } from 'react-native';

import { Text, RadioButton } from '../../common/components';
import { Fonts, Colors } from '../../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../../redux/ActionTypes';

import { PanGestureHandler, State, TouchableOpacity } from 'react-native-gesture-handler';

import LottieView from 'lottie-react-native';
import { Icon } from 'react-native-elements';

const BLANK_IMAGE_URI = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const { height, width } = Dimensions.get('screen');

const GESTURE_THRESHOLD = 200;

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

class Swiper extends React.Component {

    gestureX = new Animated.Value(0);
    gestureY = new Animated.Value(0);

    swipeProgress = new Animated.Value(0.5);
    extendProgress = new Animated.Value(0);

    hintProgress = new Animated.Value(0);

    state = {
        rightThreshold: false,
        leftThreshold: false,
        downThreshold: false,

        swipedRight: false,
        swipedLeft: false,
        swipedDown: false,

        text: 0,
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

    onReport = () => {
        if (this.props.onReport) {
            this.props.onReport();
        }
    }

    onEndCall = () => {
        if (this.props.onEndCall) {
            this.props.onEndCall();
        }
    }

    componentDidMount() {
        this.gestureX.addListener(data => {
            let { value } = data;
            if (value > GESTURE_THRESHOLD && !this.state.rightThreshold) {
                this.setState({ rightThreshold: true });
            }
            if (value < GESTURE_THRESHOLD && this.state.rightThreshold) {
                this.setState({ rightThreshold: false });
            }
            if (value < -GESTURE_THRESHOLD && !this.state.leftThreshold) {
                this.setState({ leftThreshold: true });
            }
            if (value > -GESTURE_THRESHOLD && this.state.leftThreshold) {
                this.setState({ leftThreshold: false });
            }

        });
        this.gestureY.addListener(data => {
            let { value } = data;
            if (value > GESTURE_THRESHOLD && !this.state.downThreshold) {
                this.setState({ downThreshold: true });
            }
            if (value < GESTURE_THRESHOLD && this.state.downThreshold) {
                this.setState({ downThreshold: false });
            }
        });

        Animated.loop(
            Animated.timing(this.hintProgress,
                {
                    toValue: 6,
                    duration: 15000,
                    useNativeDriver: true,
                }
            )
        ).start();
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
                useNativeDriver: true
            }).start();
        }
        if (!prevState.swipedLeft && this.state.swipedLeft) {
            this.swipeProgress.setValue(0.5);
            Animated.timing(this.swipeProgress, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            }).start();
        }
        if (!prevState.swipedDown && this.state.swipedDown) {
            Animated.timing(this.extendProgress, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
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

    updateText = () => {
        this.setState({ text: this.state.text < 2 ? this.state.text + 1 : 0 });
    }

    render() {

        let imageRotateY = this.gestureX.interpolate({ inputRange: [-200, 200], outputRange: ['-45deg', '45deg'], extrapolate: 'clamp' });
        let imageRotateX = this.gestureY.interpolate({ inputRange: [0, GESTURE_THRESHOLD], outputRange: ['0deg', '-45deg'], extrapolate: 'clamp' });
        let swipeRightProgress = this.gestureX.interpolate({ inputRange: [0, GESTURE_THRESHOLD], outputRange: [0, 0.5], extrapolate: 'clamp' });
        let swipeLeftProgress = this.gestureX.interpolate({ inputRange: [-GESTURE_THRESHOLD, 0], outputRange: [0.5, 0.25], extrapolate: 'clamp' });
        let swipeDownProgress = this.gestureY.interpolate({ inputRange: [0, GESTURE_THRESHOLD], outputRange: [0, 0.16], extrapolate: 'clamp' });

        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View style={{ position: 'absolute', top: 0, left: 0, transform: [{ rotateY: imageRotateY }, { rotateX: imageRotateX }] }}>
                    <Animated.Image blurRadius={24.0} source={{ uri: this.props.pictureURL ? this.props.pictureURL : BLANK_IMAGE_URI }} style={{ height, width, borderRadius: 8.0 }} />
                </Animated.View>
                <PanGestureHandler onHandlerStateChange={this.handleGestureStateChanged} onGestureEvent={Animated.event([{ nativeEvent: { translationX: this.gestureX, translationY: this.gestureY } }], { useNativeDriver: false })} minPointers={1} maxPointers={1}>
                    <Animated.View style={{ flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', backgroundColor: '#33333377', zIndex: 100 }}>
                        <View style={{ flex: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <TouchableOpacity onPress={this.onReport} style={{ margin: 16.0 }}>
                                <Text style={{ fontSize: 14.0 }}>REPORT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.onEndCall} style={{ margin: 16.0, backgroundColor: '#ffffffaa', padding: 8.0, borderRadius: 4.0 }}>
                                <Icon name={'call-end'} color={'#f55'} size={32} />
                            </TouchableOpacity>
                            <Countdown time={this.props.timeLeft} />
                        </View>
                        <View style={{ flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', padding: 16.0 }}>
                            <View style={{ alignItems: 'center' }}>
                                <Animated.View style={{ transform: [{ rotateZ: '90deg' }] }}>
                                    <LottieView source={require('../../../../assets/animations/arrows.json')} style={{ height: 36, width: 36, }} progress={this.hintProgress.interpolate({ inputRange: [0, 1.9, 2, 3.9, 4, 5.9, 6], outputRange: [0, 1, 0, 0, 0, 0, 0] })} />
                                </Animated.View>
                                <Animated.Text style={{ fontFamily: Fonts.heading, fontSize: 12.0, color: Colors.text, opacity: this.hintProgress.interpolate({ inputRange: [0, 1.9, 2, 3.9, 4, 5.9, 6], outputRange: [0, 1, 0, 0, 0, 0, 0] }) }}>CANCEL</Animated.Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                {/* <Animated.View style={{ transform: [{ rotateZ: this.hintProgress.interpolate({ inputRange: [0, 1, 1.9, 2, 3, 3.9, 4, 5, 5.9, 6], outputRange: ['0deg', '0deg', '0deg', '90deg', '90deg', '90deg', '270deg', '270deg', '270deg', '360deg'] }) }] }}> */}
                                <LottieView source={require('../../../../assets/animations/arrows.json')} style={{ height: 36, width: 36, }} progress={this.hintProgress.interpolate({ inputRange: [0, 1.9, 2, 3.9, 4, 5.9, 6], outputRange: [0, 0, 0, 1, 0, 0, 0] })} />
                                {/* </Animated.View> */}
                                <Animated.Text style={{ fontFamily: Fonts.heading, fontSize: 12.0, color: Colors.text, opacity: this.hintProgress.interpolate({ inputRange: [0, 1.9, 2, 3.9, 4, 5.9, 6], outputRange: [0, 0, 0, 1, 0, 0, 0] }) }}>EXTEND</Animated.Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <Animated.View style={{ transform: [{ rotateZ: '270deg' }] }}>
                                    <LottieView source={require('../../../../assets/animations/arrows.json')} style={{ height: 36, width: 36, }} progress={this.hintProgress.interpolate({ inputRange: [0, 1.9, 2, 3.9, 4, 5.9, 6], outputRange: [0, 0, 0, 0, 0, 1, 0] })} />
                                </Animated.View>
                                <Animated.Text style={{ fontFamily: Fonts.heading, fontSize: 12.0, color: Colors.text, opacity: this.hintProgress.interpolate({ inputRange: [0, 1.9, 2, 3.9, 4, 5.9, 6], outputRange: [0, 0, 0, 0, 0, 1, 0] }) }}>MATCH</Animated.Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, padding: 16, alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                {/* <LottieView source={require('../../../../assets/animations/SwipeLeft.json')} style={{ height: 36, width: 36, }} progress={this.state.swipedLeft ? this.swipeProgress : swipeLeftProgress} /> */}
                                {/* <View>
                                    <Animated.Image source={require('../../../../assets/img/logo.png')} style={{ height: 32.0, width: 32.0, borderRadius: 8.0, tintColor: this.gestureX.interpolate({ inputRange: [-GESTURE_THRESHOLD, 0], outputRange: ['#f55', Colors.textLightGray], extrapolate: 'clamp' }) }} />
                                    <Animated.Image source={require('../../../../assets/img/logo.png')} style={{ position: 'absolute', top: 0, left: 0, height: 32.0, width: 32.0, borderRadius: 8.0, opacity: this.state.swipedLeft ? this.swipeProgress : swipeLeftProgress }} />
                                </View> */}
                                <AnimatedIcon name={'close'} size={32} color={this.gestureX.interpolate({ inputRange: [-GESTURE_THRESHOLD, 0], outputRange: ['#f55', Colors.textLightGray], extrapolate: 'clamp' })} />
                                <Animated.Text style={{ fontSize: 12.0, color: this.gestureX.interpolate({ inputRange: [-GESTURE_THRESHOLD, 0], outputRange: ['#f55', Colors.textLightGray], extrapolate: 'clamp' }) }}>NOPE</Animated.Text>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                {/* <LottieView source={require('../../../../assets/animations/SwipeClock.json')} style={{ height: 48, width: 48 }} progress={this.state.swipedDown ? this.extendProgress : swipeDownProgress} /> */}
                                <View>
                                    {/* <Animated.Image source={require('../../../../assets/img/logo.png')} style={{ height: 32.0, width: 32.0, borderRadius: 8.0, tintColor: this.gestureY.interpolate({ inputRange: [0, GESTURE_THRESHOLD], outputRange: [Colors.textLightGray, '#55f'], extrapolate: 'clamp' }) }} />
                                    <Animated.Image source={require('../../../../assets/img/logo.png')} style={{ position: 'absolute', top: 0, left: 0, height: 32.0, width: 32.0, borderRadius: 8.0, opacity: this.state.swipedDown ? this.extendProgress : swipeDownProgress }} /> */}
                                    <AnimatedIcon name={'add-circle'} size={32} color={this.gestureY.interpolate({ inputRange: [0, GESTURE_THRESHOLD], outputRange: [Colors.text, '#55f'], extrapolate: 'clamp' })} />
                                </View>
                                <Animated.Text style={{ fontSize: 24.0, color: this.gestureY.interpolate({ inputRange: [0, GESTURE_THRESHOLD], outputRange: [Colors.textLightGray, '#55f'], extrapolate: 'clamp' }) }}>30s</Animated.Text>
                                {this.state.swipedDown && !this.props.extended ? <Text style={{fontSize: 12.0}}>waiting for partner to extend</Text> : this.props.extended ? <Text style={{fontSize: 12.0}}>0 extends remaining</Text> : <Text style={{fontSize: 12.0}}>1 extends remaining</Text>}
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <LottieView source={require('../../../../assets/animations/SwipeRight.json')} style={{ height: 48, width: 48 }} progress={this.state.swipedRight ? this.swipeProgress : swipeRightProgress} />
                                {/* <View>
                                    <Animated.Image source={require('../../../../assets/img/logo.png')} style={{ height: 32.0, width: 32.0, borderRadius: 8.0, tintColor: this.gestureX.interpolate({ inputRange: [0, GESTURE_THRESHOLD], outputRange: [Colors.textLightGray, '#5f5'], extrapolate: 'clamp' }) }} />
                                    <Animated.Image source={require('../../../../assets/img/logo.png')} style={{ position: 'absolute', top: 0, left: 0, height: 32.0, width: 32.0, borderRadius: 8.0, opacity: this.state.swipedRight ? this.swipeProgress : swipeRightProgress }} />
                                </View> */}
                                <Animated.Text style={{ fontSize: 12.0, color: this.gestureX.interpolate({ inputRange: [0, GESTURE_THRESHOLD], outputRange: [Colors.textLightGray, Colors.primary], extrapolate: 'clamp' }) }}>MATCH</Animated.Text>
                            </View>
                        </View>
                    </Animated.View>
                </PanGestureHandler>
            </View>
        )
    }
}

class Countdown extends React.Component {

    countAnim = new Animated.Value(0);
    urgentAnim = new Animated.Value(1);

    state = {
        nextTime: 0,
        currTime: this.props.time,
    }

    componentDidUpdate(prevProps) {
        if (prevProps.time != this.props.time) {
            this.setState({ nextTime: this.props.time });
            Animated.timing(this.countAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
            setTimeout(() => {
                this.setState({ currTime: this.state.nextTime }, this.countAnim.setValue(0));
            }, 400);
            if (this.props.time < 10) {
                Animated.sequence([
                    Animated.timing(this.urgentAnim, {
                        toValue: 2,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.timing(this.urgentAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true
                    })
                ]).start()
            }
        }
    }

    render() {

        return (
            <View style={{ width: 196, height: 196, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.View style={
                    {
                        // position: 'absolute',
                        alignSelf: 'center',
                        opacity: this.countAnim,
                        transform: [{ translateY: this.countAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }]
                    }
                }>
                    <Text style={[this.textStyle, { color: this.props.time < 10 ? '#f55' : Colors.text, }]}>{this.state.nextTime}</Text>
                </Animated.View>
                <Animated.View style={
                    {
                        position: 'absolute',
                        alignSelf: 'center',
                        opacity: this.countAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                        transform: [
                            { translateY: this.countAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) },
                            { scale: this.urgentAnim }
                        ]
                    }
                }>
                    <Text style={[this.textStyle, { color: this.props.time < 10 ? '#f55' : Colors.text, }]}>{this.state.currTime}</Text>
                </Animated.View>
            </View>
        )
    }

    textStyle = {
        fontSize: 144,
    }


}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Swiper);