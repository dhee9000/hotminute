import React from 'react';
import { View, Platform, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';

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

class CreateProfileInterests extends React.Component {

    state = {
        editInterest: '',
        interests: [],
    }

    async componentDidMount() {
        let fname = this.props.navigation.getParam('fname', null);
        let lname = this.props.navigation.getParam('lname', null);
        let dob = this.props.navigation.getParam('dob', null);
        let age = this.props.navigation.getParam('age', null);
        let gender = this.props.navigation.getParam('gender', null);
        let occupation = this.props.navigation.getParam('occupation', null);
        let bio = this.props.navigation.getParam('bio', null);
        this.setState({ fname, lname, dob, age, gender, occupation, bio });
        let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
        let profileData = profileSnapshot.data();
        if (profileSnapshot.exists && profileData.bioComplete) {
            this.props.navigation.navigate('CreateProfileMedia');
        }
    }

    onDonePressed = async () => {
        await firestore().collection('profiles').doc(auth().currentUser.uid).set({
            fname: this.state.fname,
            lname: this.state.lname,
            dob: this.state.dob,
            age: this.state.age,
            gender: this.state.gender,
            occupation: this.state.occupation,
            bio: this.state.bio,
            interests: this.state.interests,
            bioComplete: true,
        });
        this.props.navigation.navigate('CreateProfileMedia');
    }

    onAddInterestPressed = () => {
        if (!this.state.interests.includes(this.state.editInterest)) {
            this.setState({ editInterest: '', interests: [...this.state.interests, this.state.editInterest] });
        }
        else {
            alert("Already added " + this.state.editInterest + "!");
            this.setState({ editInterest: '' });
        }
    }

    renderInterest = ({ item }) => {
        return (
            <TouchableOpacity key={item} onPress={() => this.setState({ interests: this.state.interests.filter(interest => interest !== item) })}>
                <View style={{ backgroundColor: Colors.primary, borderRadius: 16.0, paddingHorizontal: 16.0, paddingVertical: 4.0, margin: 2.0, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.background }}>{item}</Text>
                    <Text style={{ color: Colors.text }}> ✕</Text>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <DismissKeyboardView>
                <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0 }}>
                    <View style={{ flex: 1, paddingTop: 16.0, width: '100%' }}>
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading }}>Interests</Text>
                    </View>
                    <Image source={require('../../../assets/img/interests-visual.png')} style={{height: 144, width: 144}} />
                    <View style={{ flex: 3, justifyContent: 'center', width: '100%' }}>
                        <Input
                            containerStyle={{ marginBottom: 32.0 }}
                            inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            inputContainerStyle={{ borderColor: Colors.accent }}
                            label={'Add an Interest (at least 3)'}
                            labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                            keyboardType={'default'}
                            placeholder={'Basketball'}
                            placeholderTextColor={Colors.textLightGray}
                            onChangeText={editInterest => this.setState({ editInterest })}
                            onSubmitEditing={this.onAddInterestPressed}
                            returnKeyLabel={'Add'}
                            blurOnSubmit={false}
                            value={this.state.editInterest}
                        />
                        {/* <Button disabled={!this.state.editInterest || this.state.editInterest.length < 2} onPress={this.onAddInterestPressed} title={'Add'} type={'outline'} /> */}
                        {/* <FlatList
                            contentContainerStyle={{ margin: 16.0 }}
                            data={this.state.interests}
                            renderItem={this.renderInterest}
                            keyExtractor={item => item}
                        /> */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', marginVertical: 8.0 }}>
                        {
                            this.state.interests.map(interest => this.renderInterest({item: interest}))
                        }
                        </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%' }}>
                        <Button disabled={this.state.interests.length < 3} title={"Are we done yet?"} onPress={this.onDonePressed} />
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfileInterests);