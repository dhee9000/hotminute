import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';
import { Colors, Fonts } from '../../config';

class Start extends React.Component{
    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, padding: 16.0, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontFamily: Fonts.heading, fontSize: 32.0}}>Hot Minute</Text>
                <ActivityIndicator size={'large'} />
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Start);