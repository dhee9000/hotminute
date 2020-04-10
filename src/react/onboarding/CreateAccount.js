import React from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors, Firebase } from '../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/States';

import { CodeInput } from './components';
import { Input, Button } from 'react-native-elements';

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// const auth = firebaseAuth();
const db = firestore();

class CreateAccount extends React.Component {

    state = {
        phno: '',
        code: '',
        confirm: {}
    }

    onCreateAccountPressed = async () => {
        this.props.onSendCodeRequested();
        try {
            db.collection('loginattempts').doc().set({
                attemptedBy: this.state.phno,
                date: firebase.firestore.Timestamp.now(),
            })
            if (auth.currentUser) {
                console.log("Signing Out Existing User!");
                await auth.signOut();
            }
            const confirmationResult = await auth().signInWithPhoneNumber(this.state.phno);
            this.setState({ confirm: confirmationResult });
            this.props.onCodeSendSuccess();
        }
        catch (e) {
            console.error("Send Code Error", e);
            this.props.onCodeSendError(e);
        }
    }

    onVerifyCodePressed = async () => {
        this.props.onVerifyCodeRequested();
        try {
            console.log(this.state.confirm);
            const result = this.state.confirm.confirm(this.state.code);
            this.props.onVerifyCodeSuccess();
        }
        catch (e) {
            console.error("Verify Code Error", e);
            this.props.onVerifyCodeError(e);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.codeSent != this.props.codeSent)
        //     if (this.props.codeSent)
        //         this.props.navigation.navigate('VerifyPhoneNumber');
        if (prevProps.codeVerified != this.props.codeVerified)
            if (this.props.codeVerified)
                this.props.navigation.navigate('CreateProfileBio');
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>Signup</Text>
                    <Text style={{ color: Colors.text }}>Enter your phone number to begin.</Text>
                </View>
                <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
                    <Input
                        inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                        inputContainerStyle={{ borderColor: Colors.accent }}
                        keyboardType={'phone-pad'}
                        label={'Phone Number'}
                        labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                        onChangeText={text => this.setState({ phno: text })}
                        placeholder={'9728836969'}
                        placeholderTextColor={Colors.textLightGray}
                        value={this.state.phno}
                    />
                    <Text style={{ color: Colors.textLightGray, fontSize: 10, marginLeft: 8.0, marginTop: 16.0 }}>
                        We will send you a code to confirm your number. Standard text or data rates may apply.
                    </Text>
                </View>
                {this.props.sendingCode ? <ActivityIndicator size={'large'} /> : null}
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                    <Button title="Create Account" onPress={this.onCreateAccountPressed} />
                </View>

                <Modal visible={this.props.codeSent} animated animationType={'slide'}>
                    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                        <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                            <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>Verify Your Number</Text>
                            <Text style={{ color: Colors.text }}>We texted you a code to make sure your number is right.</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
                            <CodeInput onChangeText={text => this.setState({ code: text })} />
                        </View>
                        {this.props.verifyingCode ? <ActivityIndicator size={'large'} /> : null}
                        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                            <Button title="Verify Code" onPress={this.onVerifyCodePressed} />
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    codeSent: state.auth.status == States.CODE_SEND.COMPLETED,
    sendingCode: state.auth.status == States.CODE_SEND.REQUESTED,
});

const mapDispatchToProps = dispatch => ({
    // Send Code Stuff
    onSendCodeRequested: () => dispatch({ type: ActionTypes.SEND_CODE.REQUEST, }),
    onCodeSendSuccess: () => dispatch({ type: ActionTypes.SEND_CODE.SUCCESS, }),
    onCodeSendError: e => dispatch({ type: ActionTypes.SEND_CODE.FAILURE, paylod: e }),
    // Verify Code Stuff
    onVerifyCodeRequested: () => dispatch({type: ActionTypes.VERIFY_CODE.REQUEST, }),
    onVerifyCodeSuccess: () => dispatch({ type: ActionTypes.VERIFY_CODE.SUCCESS, }),
    onVerifyCodeError: e => dispatch({ type: ActionTypes.VERIFY_CODE.FAILURE, error: e }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);