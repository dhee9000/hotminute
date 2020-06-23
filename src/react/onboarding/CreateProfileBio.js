import React from 'react';
import { View, Platform, ScrollView } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Fonts, Colors } from '../../config';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, Button } from 'react-native-elements';

import { RadioButton } from './components';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

class CreateProfileBio extends React.Component {

    state = {
        showDatePicker: false,
        initialDate: new Date(947224800000),
        fname: '',
        lname: '',
        gender: 'male',
        occupation: '',
        bio: '',
    }

    async componentDidMount() {
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if (profileSnapshot.exists && profileData.bioComplete) {
            this.props.navigation.navigate('CreateProfileMedia');
        }
    }

    onChangeDate = (event, selectedDate) => {
        this.setState({ showDatePicker: Platform.OS === 'ios' ? true : false });
        const currentDate = selectedDate || this.state.dob;
        this.setState({ dob: currentDate })
    };

    onChangeGender = (key) => {
        this.setState({ gender: key });
    }

    onChooseDateTapped = () => {
        this.setState({ showDatePicker: true });
    }

    onDonePressed = async () => {
        alert(`Creating Profile: ${this.state.fname} ${this.state.lname}, ${this.state.dob}, ${this.state.occupation}, ${this.state.bio}.`)
        await firestore().collection('profiles').doc(auth().currentUser.uid).set({
            fname: this.state.fname,
            lname: this.state.lname,
            dob: this.state.dob,
            gender: this.state.gender,
            occupation: this.state.occupation,
            bio: this.state.bio,
            bioComplete: true,
        });
        this.props.navigation.navigate('CreateProfileMedia');
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>Who Are You?</Text>
                    <Text style={{ color: Colors.text }}>Let's get to know you.</Text>
                </View>
                <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
                    <ScrollView>
                        <Input
                            containerStyle={{ marginBottom: 32.0 }}
                            inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            inputContainerStyle={{ borderColor: Colors.accent }}
                            label={'What do people call you?'}
                            labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            keyboardType={'default'}
                            placeholder={'First Name'}
                            placeholderTextColor={Colors.textLightGray}
                            onChangeText={fname => this.setState({ fname })}
                            value={this.state.fname}
                        />
                        <Input
                            containerStyle={{ marginBottom: 32.0 }}
                            inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            inputContainerStyle={{ borderColor: Colors.accent }}
                            label={'Bond, James Bond.'}
                            labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            keyboardType={'default'}
                            placeholder={'Last Name'}
                            placeholderTextColor={Colors.textLightGray}
                            onChangeText={lname => this.setState({ lname })}
                            value={this.state.lname}
                        />
                        <View style={{ marginHorizontal: 8.0, marginBottom: 32.0 }}>
                            <Text style={{ color: Colors.text }}>Are you old enough to be dating?</Text>
                            <Text style={{ color: Colors.accent }} onPress={this.onChooseDateTapped}>
                                {this.state.dob ? dateToNiceString(this.state.dob) : "Choose Date of Birth"}
                            </Text>
                        </View>
                        {this.state.showDatePicker &&
                            <DateTimePicker
                                value={this.state.date ? this.state.date : this.state.initialDate}
                                mode={'date'}
                                display="default"
                                onChange={this.onChangeDate}
                            />}
                        <RadioButton options={[{ key: 'male', text: 'Male' }, { key: 'female', text: 'Female' }, { key: 'other', text: 'Other' }]} onChange={this.onChangeGender} />
                        <Input
                            containerStyle={{ marginBottom: 32.0 }}
                            inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            inputContainerStyle={{ borderColor: Colors.accent }}
                            label={'What do you do?'}
                            labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            keyboardType={'default'}
                            placeholder={'ex. Student, Youtuber, Model'}
                            placeholderTextColor={Colors.textLightGray}
                            onChangeText={occupation => this.setState({ occupation })}
                            value={this.state.occupation}
                        />
                        <Input
                            containerStyle={{ marginBottom: 32.0 }}
                            inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            inputContainerStyle={{ borderColor: Colors.accent }}
                            label={'Who are you?'}
                            numberOfLines={3}
                            labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            keyboardType={'default'}
                            placeholder={'A short description of yourself'}
                            placeholderTextColor={Colors.textLightGray}
                            onChangeText={bio => this.setState({ bio })}
                            value={this.state.bio}
                        />
                    </ScrollView>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                    <Text style={{alignSelf: 'center'}}>NOTE: THE FORM ABOVE SCROLLS</Text>
                    <Button title="Looks Good" onPress={this.onDonePressed} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfileBio);

function dateToNiceString(myDate) {
    var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",];
    return month[myDate.getMonth()] + " " + myDate.getDate() + " " + myDate.getFullYear();
}