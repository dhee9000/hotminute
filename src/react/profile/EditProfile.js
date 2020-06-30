import React, { Component } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Colors, Fonts } from '../../config';

const styles = StyleSheet.create({
    name: {
        margin: 20,
        padding: 10,
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        width: 350,
        borderColor: 'gray',
        borderWidth: 1,
    },
    sub: {
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
        fontSize: 15,
        width: 350,
        borderColor: 'gray',
        borderWidth: 1,
    },
});

class EditProfile extends React.Component {

    state: {
        fname: '',
        lname: '',
        occupation: '',
        bio: '',
    };

    saveProfile = () => {
        this.props.navigation.state.params.saveEditProfile(
            this.state.fname,
            this.state.lname,
            this.state.occupation,
            this.state.bio
        );
        this.props.navigation.navigate('Profile');
        alert('Profile Updated');
    };

    componentWillMount() {
        this.setState({
            fname: this.props.navigation.getParam('fname', undefined),
            lname: this.props.navigation.getParam('lname', undefined),
            occupation: this.props.navigation.getParam('occupation', undefined),
            bio: this.props.navigation.getParam('bio', undefined),

        });
        this.props.navigation.setParams({ saveEditProfile: this.saveProfile });
    }

    render() {
        return (
            <View style={{ alignItems: 'center', paddingTop: 50 }}>
                <TextInput
                    style={styles.name}
                    placeholder="Enter your first name"
                    multiline={false}
                    onChangeText={
                        (text) =>
                            this.setState({ fname: text })
                    }
                    value={this.state.fname}
                />
                <TextInput
                    style={styles.name}
                    placeholder="Enter your last name"
                    multiline={false}
                    onChangeText={
                        (text) =>
                            this.setState({ lname: text })
                    }
                    value={this.state.lname}
                />
                <TextInput
                    style={styles.sub}
                    placeholder="Enter your occupation"
                    multiline={true}
                    onChangeText={
                        text => this.setState({ occupation: text })
                    }
                    value={this.state.occupation}
                />
                <TextInput
                    style={styles.sub}
                    placeholder="Enter your bio"
                    multiline={true}
                    onChangeText={
                        text => this.setState({ bio: text })
                    }
                    value={this.state.bio}
                />
            </View>
        );
    }
}

export default EditProfile;
