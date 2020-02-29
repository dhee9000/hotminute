import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Input, Button } from 'react-native-elements';

class CreateAccount extends React.Component{
    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0}}>
                <View style={{flex: 1, paddingTop: 16.0, width: '100%'}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.background}}>Signup</Text>
                    <Text style={{color: Colors.background}}>Enter your phone number to begin.</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', width: '100%'}}>
                    <Input 
                        inputStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.background}}
                        inputContainerStyle={{borderColor: Colors.accent}}
                        label={'Phone Number'}
                        labelStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.background}}
                        keyboardType={'phone-pad'}
                        placeholder={'9728836969'}
                        placeholderTextColor={Colors.textLightGray}
                    />
                    <Text style={{color: Colors.textLightGray, fontSize: 10, marginLeft: 8.0, marginTop: 16.0}}>
                        We will send you a code to confirm your number. Standard text or data rates may apply.
                    </Text>
                </View>
                <View style={{flex: 1,justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%'}}>
                    <Button title="Create Account" onPress={() => {this.props.navigation.navigate('VerifyPhoneNumber')}} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);