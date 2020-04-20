import React from 'react';
import { View, SafeAreaView, ScrollView, NativeModules } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Input, Button } from 'react-native-elements';

import io from 'socket.io-client';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import { RtcEngine, AgoraView } from 'react-native-agora'
import { AgoraConfig } from '../../config';

const { Agora } = NativeModules;
const { FPS30, AudioProfileDefault, AudioScenarioDefault, Host, Adaptative } = Agora

import * as Permissions from 'expo-permissions';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag'

var SERVER_IP = 'http://192.168.1.18';

class GodMode extends React.Component {

    state = {
        socket: null,
        userId: -1,
        uid: auth().currentUser.uid,
        idToken: null,
        inQueue: false,
        roomId: null,
        roomToken: null,
        joinedRoom: false,

        peerIds: [],                                //Array for storing connected peers
        appid: AgoraConfig.AppID,                    //Enter the App ID generated from the Agora Website
        channelName: "TestRoom",        //Channel Name for the current session
        vidMute: false,                             //State variable for Video Mute
        audMute: false,                             //State variable for Audio Mute
        joinSucceed: false,                         //State variable for storing success
    }

    constructor(props) {
        super(props);
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

    async componentDidMount() {
        
        SERVER_IP = await (await firestore().collection('meta').doc('test').get()).data().server_url;

        alert('YOU ARE IN GOD MODE! USE WITH CAUTION!');

        const socket = io(`${SERVER_IP}/matchmaker`);
        socket.on('connect', () => {
            alert('Socket Connected!');
        })
        socket.on('debug', message => {
            alert(message);
        })
        socket.on('matchfound', data => {
            this.setState({ roomToken: data.token, roomId: data.roomId, inQueue: false, })
        });
        socket.on('joinqueue', result => {
            if (result === 'success') {
                this.setState({ inQueue: true });
            }
        });
        socket.on('leavequeue', result => {
            if (result === 'success') {
                this.setState({ inQueue: false });
            }
        });
        this.setState({ socket });

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
        RtcEngine.registerLocalUserAccount(this.state.uid);
		RtcEngine.joinChannelWithUserAccount(this.state.roomId, this.state.uid, this.state.roomToken);  //Join Channel
        RtcEngine.enableAudio();
        RtcEngine.disableVideo();
	}

	endCall() {
		RtcEngine.leaveChannel();
	}

    onSignInPressed = async userId => {
        this.setState({ userId });
        let user = users[userId];
        await auth().signOut();
        let result = await auth().signInWithPhoneNumber(user.phno);
        await result.confirm(user.code);
        this.setState({ userId, uid: auth().currentUser.uid });
    }

    onTestSocketPressed = async () => {
        this.state.socket.emit('debug', 'test');
    }

    joinQueue = async () => {
        this.state.socket.emit('joinqueue', { uid: auth().currentUser.uid });
    }

    leaveQueue = async () => {
        this.state.socket.emit('leavequeue', { uid: auth().currentUser.uid });
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ backgroundColor: '#fff', padding: 16.0, flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                    <ScrollView>
                        <Text style={{ color: Colors.primary, fontFamily: Fonts.heading, fontSize: 24.0, margin: 4.0, padding: 4.0 }}>GOD MODE</Text>
                        <Text style={{ color: '#fff', backgroundColor: '#f00', fontFamily: Fonts.heading, fontSize: 12.0, margin: 4.0, padding: 4.0, borderRadius: 4.0, }}>WARNING: YOU ARE IN GOD MODE! THERE IS LIMITED ERROR CHECKING AND STABILITY. ALL BUTTON PRESSES HAVE CONSEQUENCES. DO NOT VIOLATE THE INTENDED SEQUENCE OF ACTIONS!</Text>

                        <View style={{ borderColor: Colors.primary, borderWidth: 4.0, padding: 4.0, margin: 4.0 }}>
                            <Text>AUTH STUFF</Text>
                            <Button title="Sign In as User 1" onPress={() => this.onSignInPressed(0)} />
                            <Button title="Sign In as User 2" onPress={() => this.onSignInPressed(1)} />
                        </View>

                        <View style={{ borderColor: Colors.primary, borderWidth: 4.0, padding: 4.0, margin: 4.0 }}>
                            <Text>SOCKET STUFF</Text>
                            <Button title="Test Socket" onPress={() => this.onTestSocketPressed()} />
                        </View>

                        <View style={{ borderColor: Colors.primary, borderWidth: 4.0, padding: 4.0, margin: 4.0 }}>
                            <Text>QUEUE STUFF</Text>
                            <Button title="Join Queue" onPress={() => this.joinQueue()} />
                            <Button title="Leave Queue" onPress={() => this.leaveQueue(1)} />
                        </View>

                        <View style={{ borderColor: Colors.primary, borderWidth: 4.0, padding: 4.0, margin: 4.0 }}>
                            <Text>ROOM STUFF</Text>
                            <Button title="Join Room" onPress={() => this.startCall()} />
                            <Button title="Leave Room" onPress={() => this.endCall()} />
                        </View>

                        <View style={{ borderColor: Colors.primary, borderWidth: 4.0, padding: 4.0, margin: 4.0 }}>
                            <Text>PROFILE STUFF</Text>
                            <Button title="Set Profile" onPress={() => this.startCall()} />
                            <Button title="Leave Room" onPress={() => this.endCall()} />
                        </View>

                        <View style={{ borderColor: Colors.text, borderWidth: 4.0, padding: 4.0, margin: 4.0 }}>
                            <Text>Selected user: {'\n'} {this.state.userId + 1}</Text>
                            <Text>Logged in user UID: {'\n'} {this.state.uid}</Text>
                            <Text>Logged in user IdToken: {'\n'} {this.state.idToken}</Text>
                            <Text>In Queue: {'\n'} {this.state.inQueue ? "YES" : "NO"}</Text>
                            <Text>Assigned Room: {'\n'} {this.state.roomId}</Text>
                            <Text>Assigned Room Token: {'\n'} {this.state.roomToken}</Text>
                        </View>
                        <AgoraView remoteUid={this.state.peerIds[0]} mode={1} key={this.state.peerIds[0]} />
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}

const users = [
    {
        phno: "+16505551212",
        code: "123456"
    },
    {
        phno: "+16505553434",
        code: "123456"
    },
    {
        phno: "+16505551234",
        code: "123456"
    }
]

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(GodMode);