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

class SelectPreferencesDistance extends React.Component {

    state = {
        maxDistance: 100
    }

    async componentDidMount() {
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if (profileSnapshot.exists && profileData.filtersComplete) {
            this.props.navigation.navigate('Main');
        }
    }

    onDonePressed = () => {
        this.props.navigation.navigate('SelectPreferencesGender', {maxDistance: this.state.maxDistance});
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>What are you looking for?</Text>
                    <Text style={{ color: Colors.text }}>Travel much?</Text>
                </View>
                <View style={{ alginItems: 'stretch', width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading }}>Distance</Text>
                    <Slider
                        onValueChange={value => this.setState({ maxDistance: value })}
                        minimumValue={0}
                        maximumValue={100}
                        value={this.state.maxDistance}
                        thumbTintColor={Colors.primary}
                    />
                    <Text>{this.state.maxDistance} mi</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                    <Button title="There's more?" onPress={this.onDonePressed} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(SelectPreferencesDistance);