import React from 'react';
import { View, SafeAreaView, ScrollView, NativeModules } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Input, Button, ThemeConsumer } from 'react-native-elements';

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import { w3cwebsocket as WebSocket } from "websocket";

import { RtcEngine, AgoraView } from 'react-native-agora'
import { AgoraConfig } from '../../config';

const { Agora } = NativeModules;
const { FPS30, AudioProfileDefault, AudioScenarioDefault, Host, Adaptative } = Agora

import * as Permissions from 'expo-permissions';

try{
    firebase.initializeApp(Firebase);
   }
   catch(e){
     console.log("Firebase Init Error: ", e);
   }

class GodMode extends React.Component {

    state = {
        userId: -1,
        uid: null,
        idToken: null,
        inQueue: false,
        roomId: null,
        roomToken: null,
        joinedRoom: false,

        //
        socket: null,
        socketActive: false,

        //
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

    componentDidMount() {
        alert('You are in God Mode! Proceed with caution!');

        // Get Signed In User
        try {
            auth().currentUser.uid;
            this.setState({ uid });
        }
        catch (e) {
            this.setState({ uid: null })
        }

        //
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
        RtcEngine.on('error', (data) => {
            if(data.errorCode != 11 && data.errorCode != "11" && data.errorCode != 18 && data.errorCode != "18"){
                alert("Error Code: " + data.errorCode);
                console.log(data);
            }
            if(data.errorCode == 17 || data.errorCode == 110){
                this.startCall();
            }
        })
    }

    onSignInPressed = async userId => {
        this.setState({ userId });
        let user = users[userId];
        await auth().signOut();
        let result = await auth().signInWithPhoneNumber(user.phno);
        await result.confirm(user.code);
        this.setState({ userId, uid: auth().currentUser.uid });
    }

    handleSocketMessage = message => {
        switch (message.type) {
            case 'debug': {
                alert(message.body);
                break;
            }
            case 'matchfound': {
                var data = message.body;
                this.setState({ roomToken: data.token, roomId: data.roomId, inQueue: false, });
                break;
            }
        }
    }

    onConnectSocketPressed = () => {
        const socket = new WebSocket('ws://apitest.hotminute.app');
        socket.onopen = () => {
            console.log('WebSocket Client Connected!');
            socket.send(JSON.stringify({ type: 'auth', body: this.state.uid }))
        }
        socket.onmessage = messageRaw => {
            var message = JSON.parse(messageRaw.data);
            console.log(message);
            this.handleSocketMessage(message);
        }
        this.setState({ socket });
    }

    onTestSocketPressed = () => {
        this.state.socket.send(JSON.stringify({
            type: 'debug',
            body: 'test'
        }));

    }

    onJoinQueuePressed = () => {
        this.state.socket.send(JSON.stringify({
            type: 'joinqueue',
            body: { uid: this.state.uid }
        }));
        this.setState({ inQueue: true });
    }

    onLeaveQueuePressed = () => {
        this.state.socket.send(JSON.stringify({
            type: 'leavequeue',
            body: { uid: this.state.uid }
        }));
        this.setState({ inQueue: false });
    }

    startCall() {
        RtcEngine.leaveChannel();
        this.setState({
            peerIds: [],
            joinSucceed: false,
        });
        RtcEngine.registerLocalUserAccount(this.state.uid);
        setTimeout(() => {
            RtcEngine.joinChannelWithUserAccount(this.state.roomId, this.state.uid, this.state.roomToken);  //Join Channel
            RtcEngine.enableAudio();
            RtcEngine.disableVideo();
        }, 1000);
    }

    endCall() {
        RtcEngine.leaveChannel();
        this.setState({
            peerIds: [],
            joinSucceed: false,
        });
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ backgroundColor: '#fff', flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                    <ScrollView contentContainerStyle={{ padding: 16.0, paddingTop: 64.0, }} style={{ alignSelf: 'stretch' }}>
                        <Text style={{ color: Colors.primary, fontFamily: Fonts.heading, fontSize: 24.0, margin: 4.0, padding: 4.0 }}>GOD MODE</Text>
                    

                        <View style={{ padding: 4.0, margin: 4.0 }}>
                            <Text>AUTH STUFF</Text>
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Sign In as User 1" onPress={() => this.onSignInPressed(0)} />
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Sign In as User 2" onPress={() => this.onSignInPressed(1)} />
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Sign In as User 3" onPress={() => this.onSignInPressed(2)} />
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Sign In as User 4" onPress={() => this.onSignInPressed(3)} />
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Sign In as User 5" onPress={() => this.onSignInPressed(4)} />
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Sign In as User 6" onPress={() => this.onSignInPressed(5)} />
                        </View>

                        <View style={{ padding: 4.0, margin: 4.0 }}>
                            <Text>SOCKET STUFF</Text>
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Connect To Socket" onPress={() => this.onConnectSocketPressed()} />
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Test Socket" onPress={() => this.onTestSocketPressed()} />
                        </View>

                        <View style={{ padding: 4.0, margin: 4.0 }}>
                            <Text>QUEUE STUFF</Text>
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Join Queue" onPress={() => this.onJoinQueuePressed()} />
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Leave Queue" onPress={() => this.onLeaveQueuePressed(1)} />
                        </View>

                        <View style={{ padding: 4.0, margin: 4.0 }}>
                            <Text>ROOM STUFF</Text>
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Join Room" onPress={() => this.startCall()} />
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Leave Room" onPress={() => this.endCall()} />
                        </View>

                        <View style={{ padding: 4.0, margin: 4.0 }}>
                            <Text>PROFILE STUFF</Text>
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Set Profile" onPress={() => this.startCall()} />
                            <Button containerStyle={{ marginVertical: 2.0 }} title="Leave Room" onPress={() => this.endCall()} />
                        </View>

                        <View style={{ borderColor: Colors.primary, borderWidth: 4.0, padding: 4.0, margin: 4.0 }}>
                            <Text>Selected user: {'\n'} {this.state.userId + 1}</Text>
                            <Text>Logged in user UID: {'\n'} {this.state.uid}</Text>
                            <Text>Logged in user IdToken: {'\n'} {this.state.idToken}</Text>
                            <Text>In Queue: {'\n'} {this.state.inQueue ? "YES" : "NO"}</Text>
                            <Text>Assigned Room: {'\n'} {this.state.roomId}</Text>
                            <Text>Assigned Room Token: {'\n'} {this.state.roomToken}</Text>
                        </View>
                        <AgoraView style={{ flex: 1, height: 100, width: 100, }}
                            remoteUid={this.state.peerIds[0]} mode={1} key={this.state.peerIds[0]} />
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
        phno: "+16505551234",
        code: "123456"
    },
    {
        phno: "+16505553434",
        code: "123456"
    },
    {
        phno: "+16505555656",
        code: "123456"
    },
    {
        phno: "+16505557878",
        code: "123456"
    },
    {
        phno: "+1650555678",
        code: "123456"
    }
]

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(GodMode);