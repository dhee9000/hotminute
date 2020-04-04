import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

class Chats extends React.Component{
    render(){
        return(
            <View>
                
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Chats);