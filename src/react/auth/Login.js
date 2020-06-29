import React from 'react';
import { View, ActivityIndicator, Modal, KeyboardAvoidingView, Dimensions, Platform } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/States';

import { CodeInput } from './components';
import { Input, Button } from 'react-native-elements';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('screen');

const PHNO_REGEX = /^\+(\d{1,3})(\d{3})(\d{3})(\d{4})$/;

class Login extends React.Component {

    state = {
        phno: '',
        sendingCode: false,
        codeSent: false,
        code: '',
        verifyingCode: false,
        codeVerified: false,
        confirmation: {}
    }

    onLoginPressed = async () => {
        this.setState({ sendingCode: true });

        // Validate Input Phone Number
        if (!this.state.phno || this.state.phno.length < 10) {
            alert("Enter your phone number to continue!");
            return;
        }
        if (!(PHNO_REGEX.exec(this.state.phno))) {
            alert("Phone number must be in the format +16053551234");
            return;
        }

        try {
            if (auth().currentUser) {
                console.log("Signing Out Existing User!");
                await auth().signOut();
            }
            const confirmation = await auth().signInWithPhoneNumber(this.state.phno);
            this.setState({ confirmation, sendingCode: false, codeSent: true });
        }
        catch (e) {
            console.log("Send Code Error", e);
            alert("Error sending code!")
            alert(e);
            this.setState({sendingCode: false, codeSent: false, confirmation: {}});
        }
    }

    onVerifyCodePressed = async () => {
        this.setState({ verifyingCode: true });
        try {
            await this.state.confirmation.confirm(this.state.code);
            this.setState({ verifyingCode: false, codeVerified: true });
        }
        catch (e) {
            console.log("Verify Code Error", e);
            alert("Error verifying code, please try again!");
            // alert(e);
            this.setState({ codeSent: false })
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevState.codeVerified != this.state.codeVerified && this.state.codeVerified) {
            // Check if Profile Exists
            let profileDoc = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
            if (profileDoc.exists && profileDoc.data().profileCompleted) {
                // ... if it does and the setup complete flag has been set navigate to main screen
                this.props.navigation.navigate('Main');
            }
            else {
                // ... if it doesn't navigate to create profile screen
                this.props.navigation.navigate('CreateProfileName');
            }
        }
    }

    componentDidMount(){
        if(auth().currentUser){
            alert("Already signed in as: " + auth().currentUser.uid);
        }
    }

    render() {
        return (
            <DismissKeyboardView>
                <View style={{flex: 1}}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'height' : 'none'} style={{flex: 1}}>
                    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                        <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                            <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>Get Started</Text>
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
                        {this.state.sendingCode ? <ActivityIndicator size={'large'} /> : null}
                        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                            <Button title="Get Started" onPress={this.onLoginPressed} />
                        </View>

                        <Modal visible={this.state.codeSent} animated animationType={'slide'}>
                            <DismissKeyboardView>
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'height' : 'none'} style={{flex: 1}}>
                                    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                                        <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                                            <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>Verify Your Number</Text>
                                            <Text style={{ color: Colors.text }}>We texted you a code to make sure your number is right.</Text>
                                        </View>
                                        <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
                                            <CodeInput onChangeText={text => this.setState({ code: text })} value={this.state.code} />
                                        </View>
                                        {this.state.verifyingCode ? <ActivityIndicator size={'large'} /> : null}
                                        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                                            <Text style={{color: Colors.textLightGray, alignSelf: 'center', marginVertical: 4.0}} onPress={() => this.setState({codeSent: false})}>Cancel</Text>
                                            <Button title="Verify Code" onPress={this.onVerifyCodePressed} />
                                        </View>
                                    </View>
                                </KeyboardAvoidingView>
                            </DismissKeyboardView>
                        </Modal>
                    </View>
                </KeyboardAvoidingView>
                </View>
            </DismissKeyboardView>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Login);