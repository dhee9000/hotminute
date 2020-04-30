import React from 'react';
import { View, ActivityIndicator } from 'react-native';

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

    onVerifyCodePressed = () => {
        this.props.verifyCode(this.state.code);
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.codeVerified != this.props.codeVerified)
            if(this.props.codeVerified)
                this.props.navigation.navigate('CreateProfileBio');
    }

    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0}}>
                <View style={{flex: 1, paddingTop: 16.0, width: '100%'}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading}}>Verify Your Number</Text>
                    <Text style={{color: Colors.text}}>We texted you a code to make sure your number is right.</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', width: '100%'}}>
                    <CodeInput onChangeText={text => this.setState({code: text})} />
                </View>
                {this.props.verifyingCode ? <ActivityIndicator size={'large'} /> : null}
                <View style={{flex: 1,justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%'}}>
                    <Button title="Verify Code" onPress={this.onVerifyCodePressed} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    codeVerified: state.auth.status == States.CODE_VERIFY.COMPLETED,
    verifyingCode: state.auth.status == States.CODE_VERIFY.REQUESTED,
});

const mapDispatchToProps = dispatch => ({
    verifyCode: code => dispatch({type: ActionTypes.VERIFY_CODE.REQUEST, payload: code}),
});

export default connect(mapStateToProps, mapDispatchToProps)(VerifyPhoneNumber);