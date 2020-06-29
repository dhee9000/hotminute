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

class CreateProfileGender extends React.Component {

    state = {
        gender: 'male',
    }

    async componentDidMount() {
        let fname = this.props.navigation.getParam('fname', null);
        let lname = this.props.navigation.getParam('lname', null);
        let dob = this.props.navigation.getParam('dob', null);
        let age = this.props.navigation.getParam('age', null);
        this.setState({ fname, lname, dob, age });
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if (profileSnapshot.exists && profileData.bioComplete) {
            this.props.navigation.navigate('CreateProfileMedia');
        }
    }

    onChangeGender = (key) => {
        this.setState({ gender: key });
    }

    onDonePressed = () => {
        alert(`Just to review, you are ${this.state.fname}, a ${this.state.age} year old ${this.state.gender}.`);
        this.props.navigation.navigate('CreateProfileOccupation', { fname: this.state.fname, lname: this.state.lname, dob: this.state.dob, age: this.state.age, gender: this.state.gender });
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>Who Are You?</Text>
                    <Text style={{ color: Colors.text }}>Pick your gender</Text>
                </View>
                <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
                    <RadioButton options={[{ key: 'male', text: 'Male' }, { key: 'female', text: 'Female' }, { key: 'other', text: 'Other' }]} onChange={this.onChangeGender} />
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfileGender);