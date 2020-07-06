import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Fonts, Colors } from '../../config';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, Button, CheckBox, Slider } from 'react-native-elements';

import auth, { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

class SelectPreferencesAge extends React.Component {

    state = {
        minAge: 18,
        maxAge: 24,
    }

    async componentDidMount() {
        let maxDistance = this.props.navigation.getParam('maxDistance', null);
        let genders = this.props.navigation.getParam('genders', null);
        this.setState({ maxDistance, genders });
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if (profileSnapshot.exists && profileData.filtersComplete) {
            this.props.navigation.navigate('Main');
        }
    }

    onDonePressed = async () => {
        await firestore().collection('filters').doc(auth().currentUser.uid).set({
            maxDistance: this.state.maxDistance,
            maxAge: this.state.maxAge,
            minAge: this.state.minAge,
            genders: this.state.genders,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await firestore().collection('profiles').doc(auth().currentUser.uid).update({
            filtersComplete: true,
            profileComplete: true,
        })
        this.props.navigation.navigate('Main');
        // this.props.navigation.navigate('Main', {maxDistance: this.state.maxDistance, genders: this.state.genders, minAge: this.state.minAge, maxAge: this.state.maxAge});
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>Age Filter</Text>
                </View>
                <View style={{ alginItems: 'stretch', width: '100%' }}>
                    <Text style={{ alignSelf: 'center', color: Colors.textLightGray }}>Min Age</Text>
                    <Text style={{ alignSelf: 'center', fontSize: 32.0 }}>{this.state.minAge} years old</Text>
                    <Slider
                        onValueChange={value => this.setState({ minAge: value })}
                        minimumValue={18}
                        maximumValue={this.state.maxAge}
                        value={this.state.minAge}
                        step={1}
                        thumbTintColor={Colors.primary}
                        minimumTrackTintColor={Colors.primary}
                    />
                    <Text style={{ alignSelf: 'center', color: Colors.textLightGray }}>Max Age</Text>
                    <Text style={{ alignSelf: 'center', fontSize: 32.0 }}>{this.state.maxAge} years old</Text>
                    <Slider
                        onValueChange={value => this.setState({ maxAge: value })}
                        minimumValue={this.state.minAge}
                        maximumValue={100}
                        value={this.state.maxAge}
                        step={1}
                        thumbTintColor={Colors.primary}
                        minimumTrackTintColor={Colors.primary}
                    />
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                    <Button title={"Alright, we're all set!"} onPress={this.onDonePressed} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(SelectPreferencesAge);