import React from 'react';
import { View, Dimensions, NativeModules, Image, Animated, TouchableOpacity, ImageBackground } from 'react-native';

import { Text } from '../common/components';

import { RtcEngine, AgoraView } from 'react-native-agora'
import { AgoraConfig } from '../../config';

const { Agora } = NativeModules;
const { FPS30, AudioProfileDefault, AudioScenarioDefault, Host, Adaptative } = Agora

import * as Permissions from 'expo-permissions';

import { connect } from 'react-redux';

import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';
import { Colors, Fonts } from '../../config';

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
const TEST_PROFILE_IMAGE = 'https://scontent-dfw5-2.xx.fbcdn.net/v/t1.0-9/92129151_1175951836087183_6356546886500876288_n.jpg?_nc_cat=100&_nc_sid=07e735&_nc_ohc=swJ8yNDW6dMAX_y_hUj&_nc_ht=scontent-dfw5-2.xx&oh=9e264f0c1a1fa80e6a00a37eeb4d2fa4&oe=5EB26EF3';

class Matching extends React.Component {

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
		this.playDecisionAnimation(1);
	}

	crossPressed = () => {
		this.playDecisionAnimation(-1);
	}

	playDecisionAnimation = direction => {
		Animated.sequence([
			Animated.timing(this.decisionAnimation, {
				toValue: direction,
				duration: 500,
			}),
			Animated.timing(this.decisionAnimation, {
				toValue: 0,
				duration: 500,
			}),
		]).start();
	}

	componentDidMount() {

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
			<LinearGradient colors={['#000', Colors.primary,]} style={{ flex: 1, padding: 0, alignItems: 'center', borderRadius: 5 }}>
				<ImageBackground style={{ width, height: height, paddingTop: 16.0, }} blurRadius={4} source={{ uri: TEST_PROFILE_IMAGE }}>
					<View style={{ flex: 1, padding: 16.0, paddingTop: 64.0, }}>
						<View style={{ alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 16.0 }}>
							<Switch style={{ marginBottom: 16.0 }} />
							<Text style={{ color: Colors.background }}>Find Matches</Text>
						</View>

						{/* Decision Buttons */}
						<View style={{ flex: 2, alignItems: 'center', justifyContent: 'flex-start', }}>
							<View style={{ width: '100%', paddingVertical: 16.0, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', position: 'absolute', bottom: 0 }}>
								<NoDecisionButton onPress={this.crossPressed} />
								<TimerButton />
								<YesDecisionButton onPress={this.heartPressed} />
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

const TimerButton = props => 
(<View style={{ backgroundColor: Colors.background, borderRadius: TOGGLE_SIZE / 2, elevation: 8.0 }}>
	<LottieView style={{ width: 120, height: 120, }} source={require('../../..//assets/animations/stopwatch.json')} autoPlay loop />
</View>)

const NoDecisionButton = props => 
(<TouchableOpacity onPress={props.onPress}>
	<View style={{ backgroundColor: Colors.background, borderRadius: TOGGLE_SIZE / 2, elevation: 2.0 }}>
		<Cross height={TOGGLE_SIZE} width={TOGGLE_SIZE} />
	</View>
</TouchableOpacity>);

const YesDecisionButton = props => 
(<TouchableOpacity onPress={props.onPress}>
	<View style={{ backgroundColor: Colors.background, borderRadius: TOGGLE_SIZE / 2, elevation: 2.0 }}>
		<Heart height={TOGGLE_SIZE} width={TOGGLE_SIZE} />
	</View>
</TouchableOpacity>);