import React from 'react';
import { View, Image } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Input, Button, Icon } from 'react-native-elements';

class GetPermissionMic extends React.Component{

    grantPermission = async () => {
        this.props.navigation.navigate('GetPermissionCameraRoll');
    }
    
    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0}}>
                <View style={{flex: 1, paddingTop: 16.0, width: '100%'}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading}}>Gimme Permissions</Text>
                    <Text style={{color: Colors.text}}>We need your location. And your photos. And your mic. Also let us in your notifications?</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', width: '100%'}}>
                    <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 16.0}}>
                        <Image source={{uri: 'https://via.placeholder.com/512x512.png/FFFFFF/333333?text=Placeholder'}} style={{height: 256, width: 256}} />
                        <Text style={{color: Colors.heading, fontFamily: Fonts.heading, fontSize: 20.0, marginTop:4.0}}>Microphone</Text>
                    </View>
                </View>
                <View style={{flex: 1,justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%'}}>
                    <Text style={{color: Colors.textLightGray, fontSize: 10, alignSelf: 'center'}}>
                        Data use is subject to our <Text style={{textDecorationLine: 'underline', color: Colors.textLightGray, fontSize: 10, alignSelf: 'center'}}>Privacy Policy</Text> and <Text style={{textDecorationLine: 'underline', color: Colors.textLightGray, fontSize: 10, alignSelf: 'center'}}>Terms of Service</Text>
                    </Text>
                    <Button title="Allow Mic" onPress={this.grantPermission} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(GetPermissionMic);