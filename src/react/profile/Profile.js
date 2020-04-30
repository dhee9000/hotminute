import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Colors, Fonts } from '../../config';

class Profile extends React.Component {
    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1, paddingTop: 64.0, }}>
                <View style={{ padding: 16.0, }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 32.0 }}>Your Profile</Text>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);