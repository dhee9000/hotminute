import React from 'react';
import { View } from 'react-native';

import { Text } from '../../common/components';
import { Fonts, Colors } from '../../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../../redux/ActionTypes';

import { Slider } from 'react-native-elements';

class DistanceFilter extends React.Component {

    state = {
        maxDistance: this.props.filters.maxDistance,
        sliding: false,
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.filters.loaded != this.props.filters.loaded){
            this.setState({
                maxDistance: this.props.filters.maxDistance,
            })
        }
        if(prevState.sliding != this.state.sliding && !this.state.sliding){
            this.props.updateDistanceFilter(this.state.maxDistance);
        }
    }

    render() {
        return (
            <View style={{ flex: 1, padding: 16.0, alignItems: 'stretch', justifyContent: 'center' }}>
                <Text style={{fontSize: 12.0, color: Colors.textLightGray, alignSelf: 'center'}}>match only with people within a</Text>
                <Slider
                    onValueChange={value => this.setState({ maxDistance: value })}
                    minimumValue={0}
                    maximumValue={100}
                    value={this.state.maxDistance}
                    step={1}
                    thumbTintColor={Colors.primary}
                    minimumTrackTintColor={Colors.primary}
                    onSlidingStart={() => this.setState({sliding: true})}
                    onSlidingComplete={() => this.setState({sliding: false})}
                />
                <Text style={{alignSelf: 'center', fontSize: 32.0}}>{this.state.maxDistance} mi</Text>
                <Text style={{fontSize: 12.0, color: Colors.textLightGray, alignSelf: 'center'}}>radius</Text>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    filters: state.filters,
});

const mapDispatchToProps = dispatch => ({
    updateDistanceFilter: distance => dispatch({type: ActionTypes.UPDATE_FILTER.REQUEST, payload: { maxDistance: distance }}),
});

export default connect(mapStateToProps, mapDispatchToProps)(DistanceFilter);