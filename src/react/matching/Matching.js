import React from 'react';
import { View, Button, Dimensions, NativeModules } from 'react-native';

import { Text } from '../common/components';

import { RtcEngine, AgoraView } from 'react-native-agora'
import { AgoraConfig } from '../../config';
const {Agora} = NativeModules;

const {
    FPS30,
    AudioProfileDefault,
    AudioScenarioDefault,
    Host,
    Adaptative
} = Agora

import * as Permissions from 'expo-permissions';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';
import { Colors, Fonts } from '../../config';

const {width, height} = Dimensions.get('screen');

class Matching extends React.Component{
    constructor(props){
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

        const config = {                            //Setting config of the app
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

    componentDidMount(){
        Permissions.askAsync(Permissions.AUDIO_RECORDING,);

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
      
    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly'}}>
                <Text style={{fontFamily: Fonts.heading, fontSize: 48.0}}>1:00</Text>
                <Button 
                    title={'Connect To Room'} onPress={
                        () => {
                            this.startCall();
                        }
                    } 
                />
                <Button 
                    title={'Connect To Room'} onPress={
                        () => {
                            this.endCall();
                        }
                    } 
                />
                <View style={{height: height*3/4}}>
                <AgoraView style={{ flex: 1 }}
                  remoteUid={this.state.peerIds[0]} mode={1} key={this.state.peerIds[0]} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Matching);