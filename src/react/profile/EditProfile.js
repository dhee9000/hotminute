import React from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';

import { Text, TabBar } from '../common/components';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Colors, Fonts } from '../../config';

import { Input, Slider, Button } from 'react-native-elements';

import { TabView, SceneMap } from 'react-native-tab-view';

class EditProfile extends React.Component {

    state = {
        
        tabIdx: 0,

        fname: '',
        lname: '',
        occupation: '',
        bio: '',
        gender: '',

    }

    renderTextView = props => {
        return (
            <View style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}>
                <Input
                    containerStyle={{ marginBottom: 32.0 }}
                    inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                    inputContainerStyle={{ borderColor: Colors.accent }}
                    label={'First Name'}
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
                    label={'Last Name'}
                    labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                    keyboardType={'default'}
                    placeholder={'Last Name'}
                    placeholderTextColor={Colors.textLightGray}
                    onChangeText={lname => this.setState({ lname })}
                    value={this.state.lname}
                />
                <Input
                    containerStyle={{ marginBottom: 32.0 }}
                    inputStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                    inputContainerStyle={{ borderColor: Colors.accent }}
                    label={'Occupation'}
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
                    label={'Bio'}
                    numberOfLines={4}
                    labelStyle={{ fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text }}
                    keyboardType={'default'}
                    placeholder={'A short description of yourself'}
                    placeholderTextColor={Colors.textLightGray}
                    onChangeText={bio => this.setState({ bio })}
                    value={this.state.bio}
                />
            </View>
        )
    }

    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1 }}>
                <View style={{ padding: 16.0, flex: 1 }}>
                    <View style={{ paddingTop: 16.0, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 24.0 }}>edit profile</Text>
                    </View>
                    <TabView
                        style={{ flex: 1 }}
                        navigationState={{ index: this.state.tabIdx, routes: [{ key: 'main', title: 'main' }, { key: 'images', title: 'images' }, { key: 'demographics', title: 'other' }] }}
                        renderScene={SceneMap({main: this.renderTextView, images: this.renderTextView, demographics: this.renderTextView})}
                        renderTabBar={props => <TabBar {...props} onChangeTab={i => this.setState({tabIdx: i})}/> }
                        onIndexChange={idx => this.setState({ tabIdx: idx })}
                    />
                </View>
            </View>
        )
    }
}

export default EditProfile;
