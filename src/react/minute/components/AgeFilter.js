import React from 'react';
import { View } from 'react-native';

import { Text } from '../../common/components';
import { Fonts, Colors } from '../../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../../redux/ActionTypes';

import { Slider } from 'react-native-elements';

class DistanceFilter extends React.Component {

    state = {
        minAge: this.props.filters.minAge,
        maxAge: this.props.filters.maxAge,
        sliding: false,
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.filters.loaded != this.props.filters.loaded){
            this.setState({
                minAge: this.props.filters.minAge,
                maxAge: this.props.filters.maxAge,
            })
        }
        if(prevState.sliding != this.state.sliding && !this.state.sliding){
            this.props.updateAgeFilter(this.state.minAge, this.state.maxAge);
        }
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
                    onSlidingStart={() => this.setState({sliding: true})}
                    onSlidingComplete={() => this.setState({sliding: false})}
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
                    onSlidingStart={() => this.setState({sliding: true})}
                    onSlidingComplete={() => this.setState({sliding: false})}
                />
            </View>
        )
    }
}

const mapStateToProps = state => ({
    filters: state.filters,
});

const mapDispatchToProps = dispatch => ({
    updateAgeFilter: (minAge, maxAge) => dispatch({type: ActionTypes.UPDATE_FILTER.REQUEST, payload: { minAge, maxAge }}),
});

export default connect(mapStateToProps, mapDispatchToProps)(DistanceFilter);