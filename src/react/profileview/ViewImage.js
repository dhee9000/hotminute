import React from 'react';
import { View, Image, Dimensions, TouchableOpacity } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';
import { Icon } from 'react-native-elements';

import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';

const { height, width } = Dimensions.get('screen');

class ViewImage extends React.Component {

    state = {
        imageUri: undefined,
    }

    componentDidMount() {

        let imageUri = this.props.navigation.getParam('imageUri', undefined);
        this.setState({ imageUri });

    }
    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ReactNativeZoomableView
                    maxZoom={1.5}
                    minZoom={0.5}
                    zoomStep={0.5}
                    initialZoom={1}
                >
                    {this.state.imageUri ? <Image resizeMode={'contain'} source={{ uri: this.state.imageUri }} style={{ height, width }} /> : <Text>No Image Found</Text>}
                </ReactNativeZoomableView>
                <TouchableOpacity onPress={() => this.props.navigation.pop()} style={{ position: 'absolute', top: 32.0, left: 16.0, backgroundColor: Colors.primary, borderRadius: 20.0 }}>
                    <Icon name={'close'} size={32} color={Colors.text} />
                </TouchableOpacity>
            </View>
        )
    }
}

export default ViewImage;