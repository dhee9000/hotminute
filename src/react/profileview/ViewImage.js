import React from 'react';
import { View, Image, Dimensions, TouchableOpacity } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';
import { Icon } from 'react-native-elements';

const { height, width } = Dimensions.get('screen');

class ViewImage extends React.Component {

    state = {
        imageUri: undefined,
    }

    componentDidMount() {
        
        let imageUri = this.props.navigation.getParam('imageUri', undefined);
        this.setState({imageUri});

    }
    render() {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                { this.state.imageUri ? <Image source={{uri: this.state.imageUri}} style={{height, width}} /> : <Text>No Image Found</Text>}
                <TouchableOpacity onPress={() => this.props.navigation.pop()} style={{position: 'absolute', top: 32.0, left: 16.0, backgroundColor: Colors.primary, borderRadius: 20.0}}>
                    <Icon name={'close'} size={38} color={Colors.text} />
                </TouchableOpacity>
            </View>
        )
    }
}

export default ViewImage;