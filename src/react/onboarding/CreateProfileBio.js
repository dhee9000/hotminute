import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Fonts, Colors } from '../../config';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, Button } from 'react-native-elements';

class CreateProfileBio extends React.Component{

    state = {
        showDatePicker: false,
        initialDate: new Date(947224443),
    }

    onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || this.state.date;
        this.setState({date: currentDate})
        this.setState({showDatePicker: false});
    };

    onChooseDateTapped = () => {
        this.setState({showDatePicker: true});
    }

    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0}}>
                <View style={{flex: 1, paddingTop: 16.0, width: '100%'}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading}}>Who Are You?</Text>
                    <Text style={{color: Colors.text}}>Let's get to know you.</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', width: '100%'}}>
                    <Input 
                        containerStyle={{marginBottom: 32.0}}
                        inputStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text}}
                        inputContainerStyle={{borderColor: Colors.accent}}
                        label={'What do people call you?'}
                        labelStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text}}
                        keyboardType={'number-pad'}
                        placeholder={'First Name'}
                        placeholderTextColor={Colors.textLightGray}
                    />
                    <Input
                        containerStyle={{marginBottom: 32.0}}
                        inputStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text}}
                        inputContainerStyle={{borderColor: Colors.accent}}
                        label={'Bond, James Bond.'}
                        labelStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text}}
                        keyboardType={'number-pad'}
                        placeholder={'Last Name'}
                        placeholderTextColor={Colors.textLightGray}
                    />
                    <View style={{marginHorizontal: 8.0, marginBottom: 32.0}}>
                        <Text style={{color: Colors.text}}>Are you old enough to be dating?</Text>
                        <Text style={{color: Colors.accent}} onPress={this.onChooseDateTapped}>
                            {this.state.date ? dateToNiceString(this.state.date) : "Choose Date of Birth"}
                        </Text>
                    </View>
                    {this.state.showDatePicker && 
                    <DateTimePicker
                        value={this.state.date ? this.state.date : this.state.initialDate}
                        mode={'date'}
                        display="spinner"
                        onChange={this.onChangeDate}
                    />}
                    <Input
                        containerStyle={{marginBottom: 32.0}}
                        inputStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text}}
                        inputContainerStyle={{borderColor: Colors.accent}}
                        label={'What do you do?'}
                        labelStyle={{fontFamily: Fonts.primary, fontWeight: 'normal', color: Colors.text}}
                        keyboardType={'number-pad'}
                        placeholder={'ex. Student, Youtuber, Model'}
                        placeholderTextColor={Colors.textLightGray}
                    />
                </View>
                <View style={{flex: 1,justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%'}}>
                    <Button title="Yup, Looks Good" onPress={() => {this.props.navigation.navigate('CreateProfileMedia')}} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfileBio);

function dateToNiceString(myDate){
    var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",];
    return month[myDate.getMonth()]+" "+myDate.getDate()+" "+myDate.getFullYear();
}