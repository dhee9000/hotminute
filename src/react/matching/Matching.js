import React from 'react';
import { View, Button, NativeModules } from 'react-native';

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

class Start extends React.Component{

    componentDidMount(){
        Permissions.askAsync(Permissions.AUDIO_RECORDING,);
    }
    
      
    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly'}}>
                <Text style={{fontFamily: Fonts.heading, fontSize: 48.0}}>1:00</Text>
                <Button 
                    title={'Connect To Room'} onPress={
                        () => {

                        }
                    } 
                />
                <Text>{this.state.status}</Text>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Start);