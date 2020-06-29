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

class SelectPreferencesGender extends React.Component {

    state = {
        genders: {
            male: true,
            female: true,
            other: true,
        }
    }

    async componentDidMount() {
        let maxDistance = this.props.navigation.getParam('maxDistance', null);
        this.setState({ maxDistance });
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if (profileSnapshot.exists && profileData.filtersComplete) {
            this.props.navigation.navigate('Main');
        }
    }

    onDonePressed = () => {
        this.props.navigation.navigate('SelectPreferencesAge', {maxDistance: this.state.maxDistance, genders: this.state.genders});
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>What are you looking for?</Text>
                    <Text style={{ color: Colors.text }}>We need to know who to pair you with</Text>
                </View>
                <View style={{ alginItems: 'stretch', width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading }}>Gender</Text>
                    <CheckBox
                        title={'Male'}
                        checked={this.state.genders.male}
                        onPress={() => this.setState({ genders: { ...this.state.genders, male: !this.state.genders.male } })}
                    />
                    <CheckBox
                        title={'Female'}
                        checked={this.state.genders.female}
                        onPress={() => this.setState({ genders: { ...this.state.genders, female: !this.state.genders.female } })}
                    />
                    <CheckBox
                        title={'Other'}
                        checked={this.state.genders.other}
                        onPress={() => this.setState({ genders: { ...this.state.genders, other: !this.state.genders.other } })}
                    />
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                    <Button title="Can we please be done already?" onPress={this.onDonePressed} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(SelectPreferencesGender);