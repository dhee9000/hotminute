import React from 'react';
import { View } from 'react-native';

import { Text } from '../../common/components';
import { Fonts, Colors } from '../../../config';

import { connect } from 'react-redux';
import { ActionTypes } from '../../../redux/';

import { Slider } from 'react-native-elements';

class DistanceFilter extends React.Component {

    state = {
        minAge: 18,
        maxAge: 24,
    }

    render() {
        return (
            <View style={{ flex: 1, padding: 16.0, alignItems: 'stretch', justifyContent: 'center' }}>
                <Text style={{ alignSelf: 'center', color: Colors.textLightGray }}>Min Age</Text>
                <Text style={{ alignSelf: 'center', fontSize: 32.0 }}>{this.state.minAge} years old</Text>
                <Slider
                    onValueChange={value => this.setState({ minAge: value })}
                    minimumValue={18}
                    maximumValue={this.state.maxAge}
                    value={this.state.minAge}
                    step={1}
                    thumbTintColor={Colors.primary}
                    minimumTrackTintColor={Colors.primary}
                />
                <Text style={{ alignSelf: 'center', color: Colors.textLightGray }}>Max Age</Text>
                <Text style={{ alignSelf: 'center', fontSize: 32.0 }}>{this.state.maxAge} years old</Text>
                <Slider
                    onValueChange={value => this.setState({ maxAge: value })}
                    minimumValue={this.state.minAge}
                    maximumValue={100}
                    value={this.state.maxAge}
                    step={1}
                    thumbTintColor={Colors.primary}
                    minimumTrackTintColor={Colors.primary}
                />
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(DistanceFilter);