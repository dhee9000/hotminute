import React from 'react';
import { View } from 'react-native';

import { Text, RadioButton } from '../../common/components';
import { Fonts, Colors } from '../../../config';

import { connect } from 'react-redux';
import { ActionTypes } from '../../../redux/';

import { Slider, CheckBox } from 'react-native-elements';

class GenderFilter extends React.Component {

    state = {
        genders: {
            male: true,
            female: true,
            other: true,
        }
    }

    render() {
        return (
            <View style={{ flex: 1, padding: 16.0, alignItems: 'stretch', justifyContent: 'center' }}>
                <Text style={{fontSize: 12.0, color: Colors.textLightGray, alignSelf: 'center'}}>match only with people of the</Text>
                <CheckBox
                    title={'Male'}
                    checked={this.state.genders.male}
                    onPress={() => this.setState({ genders: { ...this.state.genders, male: !this.state.genders.male } })}
                />
                <CheckBox
                    title={'Female'}
                    checked={this.state.genders.female}
                    onPress={() => this.setState({ genders: { ...this.state.genders, female: !this.state.genders.female } })}
                />
                <CheckBox
                    title={'Other'}
                    checked={this.state.genders.other}
                    onPress={() => this.setState({ genders: { ...this.state.genders, other: !this.state.genders.other } })}
                />
                <Text style={{fontSize: 12.0, color: Colors.textLightGray, alignSelf: 'center'}}>gender(s)</Text>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(GenderFilter);