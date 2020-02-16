import React from 'react';
import { View, Button } from 'react-native';

import { Text } from '../common/components';

import {
    TwilioVideoLocalView,
    TwilioVideoParticipantView,
    TwilioVideo
  } from 'react-native-twilio-video-webrtc'

import * as Permissions from 'expo-permissions';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';
import { Colors, Fonts } from '../../config';

class Start extends React.Component{

    componentDidMount(){
        Permissions.askAsync(Permissions.AUDIO_RECORDING, Permissions.CAMERA);
    }

    state = {
        isAudioEnabled: true,
        isVideoEnabled: true,
        status: 'disconnected',
        participants: new Map(),
        videoTracks: new Map(),
        roomName: 'TestRoom',
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzgwNjYxNDAxNzQxZTU0YjhjMmU0Y2RmNDczODc1NjQwLTE1ODE4NDU1NzYiLCJpc3MiOiJTSzgwNjYxNDAxNzQxZTU0YjhjMmU0Y2RmNDczODc1NjQwIiwic3ViIjoiQUMyOTEwNWYzYWI1YzM1OTk1YTAxZGU1YThmZDNkZmVlYSIsImV4cCI6MTU4MTg0OTE3NiwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiSG90TWludXRlTW9iaWxlIiwidmlkZW8iOnsicm9vbSI6IlRlc3RSb29tIn19fQ.gcHgOSZQJw2faKor6YkKBNk4lNU0aKUnLUzKowpOhs4'
      }
    
    _onConnectButtonPress = () => {
        this.twilioVideo.connect({ roomName: this.state.roomName, accessToken: this.state.token })
        this.setState({status: 'connecting'})
    }

    _onEndButtonPress = () => {
        this.twilioVideo.disconnect()
    }

    _onMuteButtonPress = () => {
        this.twilioVideo.setLocalAudioEnabled(!this.state.isAudioEnabled)
            .then(isEnabled => this.setState({isAudioEnabled: isEnabled}))
    }

    _onFlipButtonPress = () => {
        this.twilioVideo.flipCamera()
    }

    _onRoomDidConnect = () => {
        this.setState({status: 'connected'})
    }

    _onRoomDidDisconnect = ({roomName, error}) => {
        console.log("ERROR: ", error)

        this.setState({status: 'disconnected'})
    }

    _onRoomDidFailToConnect = (error) => {
        console.log("ERROR: ", error)

        this.setState({status: 'disconnected'})
    }

    _onParticipantAddedVideoTrack = ({participant, track}) => {
        console.log("onParticipantAddedVideoTrack: ", participant, track)

        this.setState({
            videoTracks: new Map([
            ...this.state.videoTracks,
            [track.trackSid, { participantSid: participant.sid, videoTrackSid: track.trackSid }]
            ]),
        });
    }

    _onParticipantRemovedVideoTrack = ({participant, track}) => {
        console.log("onParticipantRemovedVideoTrack: ", participant, track)

        const videoTracks = this.state.videoTracks
        videoTracks.delete(track.trackSid)

        this.setState({videoTracks: { ...videoTracks }})
    }
      
    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly'}}>
                <Text style={{fontFamily: Fonts.heading, fontSize: 48.0}}>1:00</Text>
                <Button 
                    title={'Connect To Room'} onPress={
                        () => {
                            this._onConnectButtonPress();
                        }
                    } 
                />
                <Button
                    title={'Disconnect'} onPress={
                        () => {
                            this._onEndButtonPress();
                        }
                    } 
                />
                <Text>{this.state.status}</Text>
                <TwilioVideo
                    ref={v => {this.twilioVideo = v}}
                    onRoomDidConnect={ this._onRoomDidConnect }
                    onRoomDidDisconnect={ this._onRoomDidDisconnect }
                    onRoomDidFailToConnect= { this._onRoomDidFailToConnect }
                    onParticipantAddedVideoTrack={ this._onParticipantAddedVideoTrack }
                    onParticipantRemovedVideoTrack= { this._onParticipantRemovedVideoTrack }
                />
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Start);