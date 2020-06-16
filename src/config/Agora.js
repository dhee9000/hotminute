import React from 'react';
import { NativeModules } from 'react-native';

const { Agora } = NativeModules;
const { FPS30, AudioProfileDefault, AudioScenarioDefault, Host, Adaptative } = Agora

const AgoraConfig = {
    AppID: 'b1350a7f93bc4fe18bdc2e3b3a8952e1'
};

const config = {
    appid: AgoraConfig.AppID,                 //App ID
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

export default config;