import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/States';

import { Fonts, Colors } from '../../config';

import {CodeInput} from './components';
import { Input, Button } from 'react-native-elements';

class VerifyPhoneNumber extends React.Component{

    state = {
        code: ''
    }

    onCreateAccountPressed = () => {
        this.props.verifyCode(this.state.code);
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.accountCreated != this.props.accountCreated)
            if(this.props.accountCreated)
                this.props.navigation.navigate('VerifyPhoneNumber');
    }

    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0}}>
                <View style={{flex: 1, paddingTop: 16.0, width: '100%'}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading}}>Verify Your Number</Text>
                    <Text style={{color: Colors.text}}>We texted you a code to make sure your number is right.</Text>
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
    codeVerified: state.auth.status == States.AUTHENTICATED,
});

const mapDispatchToProps = dispatch => ({
    verifyCode: code => dispatch({type: ActionTypes.CODE_VERIFICATION.REQUESTED}),
});

export default connect(mapStateToProps, mapDispatchToProps)(VerifyPhoneNumber);