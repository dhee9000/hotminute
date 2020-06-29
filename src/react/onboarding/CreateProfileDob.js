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

class CreateProfileName extends React.Component {

    state = {
        showDatePicker: false,
        initialDate: new Date(947409600000),
        dob: new Date(1288224800000),
        age: getAge(new Date(1288409600000).toString())
    }

    async componentDidMount() {
        let fname = this.props.navigation.getParam('fname', null);
        let lname = this.props.navigation.getParam('lname', null);
        this.setState({ fname, lname });
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if (profileSnapshot.exists && profileData.bioComplete) {
            this.props.navigation.navigate('CreateProfileMedia');
        }
    }

    onChangeDate = (event, selectedDate) => {
        this.setState({ showDatePicker: Platform.OS === 'ios' ? true : false });
        const currentDate = selectedDate || this.state.dob;
        this.setState({ dob: currentDate, age: getAge(currentDate.toString()) })
    };

    onChooseDateTapped = () => {
        this.setState({ showDatePicker: true });
    }

    onDonePressed = async () => {
        alert(`So you're ${this.state.age} years old?`);
        this.props.navigation.navigate('CreateProfileGender', { fname: this.state.fname, lname: this.state.lname, dob: this.state.dob, age: this.state.age });
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>Who Are You?</Text>
                    <Text style={{ color: Colors.text }}>And how old are you?</Text>
                </View>
                <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
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
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                    <Button disabled={this.state.age < 18} title="I swear I'm old enough" onPress={this.onDonePressed} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function dateToNiceString(myDate) {
    var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",];
    return month[myDate.getMonth()] + " " + myDate.getDate() + " " + myDate.getFullYear();
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfileName);