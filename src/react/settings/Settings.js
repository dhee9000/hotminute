import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

class Settings extends React.Component{
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

export default connect(mapStateToProps, mapDispatchToProps)(Settings);