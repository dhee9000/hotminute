import React from 'react';
import { View, Image } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Fonts, Colors } from '../../config';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, Button } from 'react-native-elements';

const BLANK_IMAGE_URI = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fya-webdesign.com%2Fexplore%2Fsvg-artwork-icon-vector%2F&psig=AOvVaw3ZF6RKqDGx8HUSe1ho4leA&ust=1583049630546000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCLDPxMml9ucCFQAAAAAdAAAAABAD';

class CreateProfileMedia extends React.Component{

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
            <View style={{flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0}}>
                <View style={{flex: 1, paddingTop: 16.0, width: '100%'}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.background}}>mirror, mirror on the wall</Text>
                    <Text style={{color: Colors.background}}>You're the fairest of them all ;)</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', width: '100%'}}>
                    <Text style={{color: Colors.background, marginBottom: 16.0}}>Choose up to 6 pictures of yourself to show on your profile after dates match with you.</Text>
                    <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 2.0}}>
                        <Image source={{uri: BLANK_IMAGE_URI}} style={{height: 120, width: 120, backgroundColor: Colors.background, borderRadius: 8}} />
                        <Image source={{uri: BLANK_IMAGE_URI}} style={{height: 120, width: 120, backgroundColor: Colors.background, borderRadius: 8}} />
                        <Image source={{uri: BLANK_IMAGE_URI}} style={{height: 120, width: 120, backgroundColor: Colors.background, borderRadius: 8}} />
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 2.0}}>
                        <Image source={{uri: BLANK_IMAGE_URI}} style={{height: 120, width: 120, backgroundColor: Colors.background, borderRadius: 8}} />
                        <Image source={{uri: BLANK_IMAGE_URI}} style={{height: 120, width: 120, backgroundColor: Colors.background, borderRadius: 8}} />
                        <Image source={{uri: BLANK_IMAGE_URI}} style={{height: 120, width: 120, backgroundColor: Colors.background, borderRadius: 8}} />
                    </View>
                </View>
                <View style={{flex: 1,justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%'}}>
                    <Button title="Are We Done Yet?" onPress={() => {this.props.navigation.navigate('GetPermissions')}} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CreateProfileMedia);

function dateToNiceString(myDate){
    var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",];
    return month[myDate.getMonth()]+" "+myDate.getDate()+" "+myDate.getFullYear();
}