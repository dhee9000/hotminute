import React from 'react';
import { View, Dimensions, NativeModules, Image, Animated, TouchableOpacity, ImageBackground } from 'react-native';

import { Text } from '../common/components';

import { RtcEngine, AgoraView } from 'react-native-agora'
import { AgoraConfig } from '../../config';
const { Agora } = NativeModules;

const {
	FPS30,
	AudioProfileDefault,
	AudioScenarioDefault,
	Host,
	Adaptative
} = Agora

import * as Permissions from 'expo-permissions';

import { connect } from 'react-redux';

import { Colors, Fonts } from '../../config';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';
import { Button, Icon } from 'react-native-elements';

import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native'

import { Minute } from './components'
import { Switch } from './components'
import { Controls } from './components'

import Heart from '../../../assets/svg/pink heart.svg';
import Cross from '../../../assets/svg/x.svg';

const { width, height } = Dimensions.get('screen');

const TOGGLE_SIZE = 80;

class Matching extends React.Component {

	test = new Animated.Value(0);

	decisionAnimation = new Animated.Value(0);

	constructor(props) {
		super(props);

		this.state = {
			peerIds: [],                                //Array for storing connected peers
			uid: Math.floor(Math.random() * 100),       //Generate a UID for local user
			appid: AgoraConfig.AppID,                    //Enter the App ID generated from the Agora Website
			channelName: "TestRoom",        //Channel Name for the current session
			vidMute: false,                             //State variable for Video Mute
			audMute: false,                             //State variable for Audio Mute
			joinSucceed: false,                         //State variable for storing success
		};

		const config = {
			appid: this.state.appid,                  //App ID
			channelProfile: 0,                        //Set channel profile as 0 for RTC
			videoEncoderConfig: {                     //Set Video feed encoder settings
				width: 720,
				height: 1080,
				bitrate: 1,
				frameRate: FPS30,
				orientationMode: Adaptative,
			},
			audioProfile: AudioProfileDefault,
			audioScenario: AudioScenarioDefault,
		};
		RtcEngine.init(config);                     //Initialize the RTC engine
	}

	heartPressed = () => {
		Animated.sequence([
			Animated.timing(this.decisionAnimation, {
				toValue: 1,
				duration: 500,
			}),
			Animated.timing(this.decisionAnimation, {
				toValue: 0,
				duration: 500,
			}),
		]).start();
	}

	componentDidMount() {

		Animated.timing(this.test, {
			toValue: 1,
			duration: 5000,
		}).start();

		Permissions.askAsync(Permissions.AUDIO_RECORDING);

		RtcEngine.on('userJoined', (data) => {
			const { peerIds } = this.state;             //Get currrent peer IDs
			if (peerIds.indexOf(data.uid) === -1) {     //If new user has joined
				this.setState({
					peerIds: [...peerIds, data.uid],        //add peer ID to state array
				});
			}
		});
		RtcEngine.on('userOffline', (data) => {       //If user leaves
			this.setState({
				peerIds: this.state.peerIds.filter(uid => uid !== data.uid), //remove peer ID from state array
			});
		});
		RtcEngine.on('joinChannelSuccess', (data) => {                   //If Local user joins RTC channel
			RtcEngine.startPreview();                                      //Start RTC preview
			this.setState({
				joinSucceed: true,                                           //Set state variable to true
			});
		});
	}

	startCall() {
		RtcEngine.joinChannel(this.state.channelName, this.state.uid);  //Join Channel
		RtcEngine.enableAudio();
	}

	endCall() {
		RtcEngine.leaveChannel();
	}

	render() {
		return (
			<LinearGradient
				colors={['#000', Colors.primary,]}
				// locations={[0.8, 1]}
				style={{ flex: 1, padding: 0, alignItems: 'center', borderRadius: 5 }}>
				<ImageBackground
					style={{
						width,
						height: height - 72,
					}}
					blurRadius={18}
					source={{ uri: 'https://scontent-dfw5-1.cdninstagram.com/v/t51.2885-15/sh0.08/e35/s750x750/83920414_144946376985449_3639079263977706456_n.jpg?_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_cat=105&_nc_ohc=cyMRXpmVVScAX_HRXoz&oh=485d26bc9220356c425a44cdd6d01a10&oe=5EAF5044' }}
				>
					<View style={{ flex: 1, padding: 16.0 }}>
						{/* <LinearGradient
					colors={[Colors.primaryDark, Colors.primary]}
					style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 24.0, elevation:0.0, padding: 16.0, margin: 8.0 }}>
				</LinearGradient> */}
						<View style={{flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16.0}}>
							<Icon name={'chat'} color={Colors.primary} size={36} />
							<Icon name={'person'} color={Colors.primary} size={36}/>
						</View>
						<View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
							<Switch style={{ marginBottom: 16.0 }} />
							<Text style={{ color: Colors.background }}>Auto-Connect</Text>
						</View>
						<View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', }}>
							{/* <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' }}>
							<Animated.View style={{
								backgroundColor: Colors.white,
								alignItems: 'center', justifyContent: 'center',
								borderRadius: 24.0, borderColor: Colors.text,
								elevation: 4.0, overflow: 'hidden',
								transform: [{ translateX: this.decisionAnimation.interpolate({ inputRange: [0.4, 1], outputRange: [0, 500], extrapolate: 'clamp' }) }, { scale: this.decisionAnimation.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0.5], extrapolate: 'clamp' }) }]
							}}>
								<Animated.Image
									style={{ height: 360, width: 360, }}
									blurRadius={18}
									source={{ uri: 'https://scontent-dfw5-1.cdninstagram.com/v/t51.2885-15/sh0.08/e35/s750x750/83920414_144946376985449_3639079263977706456_n.jpg?_nc_ht=scontent-dfw5-1.cdninstagram.com&_nc_cat=105&_nc_ohc=cyMRXpmVVScAX_HRXoz&oh=485d26bc9220356c425a44cdd6d01a10&oe=5EAF5044' }}
								/>
								{/* <Animated.Text style={{
								fontFamily: Fonts.heading,
								color: this.test.interpolate({ inputRange: [0, 1], outputRange: [Colors.text, '#fff9fe',] }),
								fontSize: 42.0,
								position: 'absolute', bottom: 0,
							}} numberOfLines={1}>Ricky Matam</Animated.Text> */}
							{/*</Animated.View>
						</View> */}
							<View>

							</View>
							{/* <LinearGradient
						colors={[Colors.primaryDark, Colors.primary]}
						style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 24.0, paddingVertical: 8, paddingHorizontal: 64, elevation: 4.0, margin: 8.0 }}>
						<Text style={{ fontFamily: Fonts.heading, color: Colors.textWhite, fontSize: 32.0, }}>Hot Minute</Text>
					</LinearGradient> */}
							<View style={{ width: '100%', paddingVertical: 16.0, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', position: 'absolute', bottom: 0 }}>
								<View style={{ backgroundColor: Colors.background, borderRadius: TOGGLE_SIZE / 2, elevation: 2.0 }}>
									<Cross height={TOGGLE_SIZE} width={TOGGLE_SIZE} />
								</View>
								<View style={{ backgroundColor: Colors.background, borderRadius: TOGGLE_SIZE / 2, elevation: 8.0 }}>
									<LottieView
										ref={animation => {
											this.animation = animation;
										}}
										style={{
											width: 120,
											height: 120,
										}}
										source={require('../../..//assets/animations/stopwatch.json')}
										autoPlay
										loop
									/>
									{/* <View style={{ height: TOGGLE_SIZE, width: TOGGLE_SIZE, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.primary }}>+30</Text></View> */}
								</View>
								<TouchableOpacity onPress={this.heartPressed}>
									<View style={{ backgroundColor: Colors.background, borderRadius: TOGGLE_SIZE / 2, elevation: 2.0 }}>
										<Heart height={TOGGLE_SIZE} width={TOGGLE_SIZE} />
									</View>
								</TouchableOpacity>
							</View>
							<View style={{ backgroundColor: Colors.primary, height: 0, width: 0, overflow: 'hidden' }}>
								<AgoraView style={{ flex: 1 }}
									remoteUid={this.state.peerIds[0]} mode={1} key={this.state.peerIds[0]} />
							</View>
						</View>
					</View>
				</ImageBackground>
			</LinearGradient>
		)
	}
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Matching);