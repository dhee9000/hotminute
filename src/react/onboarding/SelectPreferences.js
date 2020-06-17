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

class SelectPreferences extends React.Component {

    state = {
        filters: {
            maxDistance: 100,
            genders: {
                male: false,
                female: true,
                other: false,
            },
            minAge: '18',
            maxAge: '24',
        },
    }

    async componentDidMount() {
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if(profileSnapshot.exists && profileData.filtersComplete){
            this.props.navigation.navigate('Main');
        }
    }

    onDonePressed = async () => {
        await firestore().collection('filters').doc(auth().currentUser.uid).set({
            maxDistance: parseInt(this.state.filters.maxDistance),
            maxAge: parseInt(this.state.filters.maxAge),
            minAge: parseInt(this.state.filters.minAge),
            genders: {
                male: this.state.filters.genders.male,
                female: this.state.filters.genders.female,
                other: this.state.filters.genders.other,
            },
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await firestore().collection('profiles').doc(auth().currentUser.uid).update({
            filtersComplete: true,
            profileComplete: true,
        })
        this.props.navigation.navigate('Main');
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>What are you looking for?</Text>
                    <Text style={{ color: Colors.text }}>We won't judge.</Text>
                </View>
                <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
                    <Text>We'll give you matches based on these preferences.</Text>
                </View>
                <View style={{ alginItems: 'center'}}>
                <Text style={{ fontFamily: Fonts.heading }}>Distance</Text>
                                <Slider
                                    value={this.state.distanceFilter}
                                    onValueChange={value => this.setState({ distanceFilter: value })}
                                    minimumValue={0}
                                    maximumValue={100}
                                    onValueChange={value => this.setState({ filters: { ...this.state.filters, maxDistance: Math.round(value) } })}
                                    value={this.state.filters.maxDistance}
                                    thumbTintColor={Colors.primary}
                                />
                                <Text>{this.state.filters.maxDistance} mi</Text>
                                <Text style={{ fontFamily: Fonts.heading }}>Gender</Text>
                    <CheckBox
                        title={'Male'}
                        checked={this.state.filters.genders.male}
                        onPress={() => this.setState({ filters: { ...this.state.filters, genders: { ...this.state.filters.genders, male: !this.state.filters.genders.male } } })}
                    />
                    <CheckBox
                        title={'Female'}
                        checked={this.state.filters.genders.female}
                        onPress={() => this.setState({ filters: { ...this.state.filters, genders: { ...this.state.filters.genders, female: !this.state.filters.genders.female } } })}
                    />
                    <CheckBox
                        title={'Other'}
                        checked={this.state.filters.genders.other}
                        onPress={() => this.setState({ filters: { ...this.state.filters, genders: { ...this.state.filters.genders, other: !this.state.filters.genders.other } } })}
                    />
                    <Input
                        containerStyle={{ marginBottom: 32.0 }}
                        inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                        inputContainerStyle={{ borderColor: Colors.accent }}
                        label={'Max Age'}
                        labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                        keyboardType={'numeric'}
                        placeholder={'25'}
                        placeholderTextColor={Colors.textLightGray}
                        onChangeText={maxAge => this.setState({ filters: { ...this.state.filters, maxAge } })}
                        value={this.state.filters.maxAge}
                    />
                    <Input
                        containerStyle={{ marginBottom: 32.0 }}
                        inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                        inputContainerStyle={{ borderColor: Colors.accent }}
                        label={'Min Age'}
                        labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                        keyboardType={'numeric'}
                        placeholder={'18'}
                        placeholderTextColor={Colors.textLightGray}
                        onChangeText={minAge => this.setState({ filters: { ...this.state.filters, minAge } })}
                        value={this.state.filters.minAge}
                    />
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                    <Button title="Yup, Looks Good" onPress={this.onDonePressed} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(SelectPreferences);