import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/States';

import { Input, Button } from 'react-native-elements';

class CreateAccount extends React.Component{

    state = {
        phno: ''
    }

    onCreateAccountPressed = () => {
        this.props.createAccount(this.state.phno);
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
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading}}>Signup</Text>
                    <Text style={{color: Colors.text}}>Enter your phone number to begin.</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', width: '100%'}}>
                    <Input 
                        inputStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text}}
                        inputContainerStyle={{borderColor: Colors.accent}}
                        keyboardType={'phone-pad'}
                        label={'Phone Number'}
                        labelStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text}}
                        onChangeText={text => this.setState({phno: text})}
                        placeholder={'9728836969'}
                        placeholderTextColor={Colors.textLightGray}
                        value={this.state.phno}
                    />
                    <Text style={{color: Colors.textLightGray, fontSize: 10, marginLeft: 8.0, marginTop: 16.0}}>
                        We will send you a code to confirm your number. Standard text or data rates may apply.
                    </Text>
                </View>
                <View style={{flex: 1,justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%'}}>
                    <Button title="Create Account" onPress={this.onCreateAccountPressed} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    accountCreated: state.auth.status == States.CODE_SENT,
});

const mapDispatchToProps = dispatch => ({
    createAccount: phno => dispatch({type: ActionTypes.CREATE_ACCOUNT.REQUESTED, payload: phno}),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);