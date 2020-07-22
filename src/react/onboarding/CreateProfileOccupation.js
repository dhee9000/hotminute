import React from 'react';
import { View, Platform, ScrollView } from 'react-native';

import { Text, DismissKeyboardView } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Fonts, Colors } from '../../config';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, Button } from 'react-native-elements';

import { RadioButton } from './components';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

class CreateProfileOccupation extends React.Component {

    state = {
        occupation: '',
    }

    async componentDidMount() {
        let fname = this.props.navigation.getParam('fname', null);
        let lname = this.props.navigation.getParam('lname', null);
        let dob = this.props.navigation.getParam('dob', null);
        let age = this.props.navigation.getParam('age', null);
        let gender = this.props.navigation.getParam('gender', null);
        this.setState({ fname, lname, dob, age, gender });
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if (profileSnapshot.exists && profileData.bioComplete) {
            this.props.navigation.navigate('CreateProfileMedia');
        }
    }

    onDonePressed = () => {
        this.props.navigation.navigate('CreateProfileBio', { fname: this.state.fname, lname: this.state.lname, dob: this.state.dob, age: this.state.age, gender: this.state.gender, occupation: this.state.occupation });
    }

    render() {
        return (
            <DismissKeyboardView>
                <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                    <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>What do you do?</Text>
                    </View>
                    <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
                        <Input
                            containerStyle={{ marginBottom: 32.0 }}
                            inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            inputContainerStyle={{ borderColor: Colors.accent }}
                            labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            keyboardType={'default'}
                            placeholder={'ex. Student, Youtuber, Model'}
                            placeholderTextColor={Colors.textLightGray}
                            onChangeText={occupation => this.setState({ occupation })}
                            onSubmitEditing={this.onDonePressed}
                            value={this.state.occupation}
                        />
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                        <Button disabled={!this.state.occupation || this.state.fname.occupation < 3} title={"What's next?"} onPress={this.onDonePressed} />
                    </View>
                </View>
            </DismissKeyboardView>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfileOccupation);