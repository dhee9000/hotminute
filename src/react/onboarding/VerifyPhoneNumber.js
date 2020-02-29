import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Fonts, Colors } from '../../config';

import {CodeInput} from './components';
import { Input, Button } from 'react-native-elements';

class VerifyPhoneNumber extends React.Component{
    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0}}>
                <View style={{flex: 1, paddingTop: 16.0, width: '100%'}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.background}}>Verify Your Number</Text>
                    <Text style={{color: Colors.background}}>We texted you a code to make sure your number is right.</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', width: '100%'}}>
                    <CodeInput />
                </View>
                <View style={{flex: 1,justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%'}}>
                    <Button title="Verify Code" onPress={() => {this.props.navigation.navigate('GetPermissions')}} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(VerifyPhoneNumber);