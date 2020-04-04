import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Fonts, Colors } from '../../config';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, Button } from 'react-native-elements';

class SelectPreferences extends React.Component{

    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0}}>
                <View style={{flex: 1, paddingTop: 16.0, width: '100%'}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading}}>What are you looking for?</Text>
                    <Text style={{color: Colors.text}}>We won't judge.</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', width: '100%'}}>
                    <Text>We'll give you matches based on these preferences.</Text>
                </View>
                <View style={{flex: 1,justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%'}}>
                    <Button title="Yup, Looks Good" onPress={() => {this.props.navigation.navigate('Main')}} />
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