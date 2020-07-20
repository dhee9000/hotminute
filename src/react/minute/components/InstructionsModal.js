import React, {useState, useEffect, useRef} from 'react';
import { View, TouchableOpacity, Modal, Dimensions } from 'react-native';

import { Text } from '../../common/components';
import { Colors, Fonts } from '../../../config';

import { Icon } from 'react-native-elements';

const { height, width } = Dimensions.get('screen');

const InstructionsModal = (props) => {

    return (
        <Modal visible={props.showModal} transparent animated animationType={'slide'}>
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, }}>
            <View style={{ backgroundColor: Colors.text, justifyContent: 'flex-start', alignItems: 'center', borderRadius: 16.0, elevation: 4.0, marginHorizontal: 16.0, padding: 16.0 }}>
                <TouchableOpacity onPress={() => props.onClose()}>
                    <Icon name={'close'} size={32} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: '#f55' }}>Swipe Left if you are not interested</Text>
                <Text style={{ color: '#5f5' }}>Swipe Right if you are interested</Text>
                <Text style={{ color: '#55f' }}>Swipe Down to extend your time</Text>
                <Text style={{ color: Colors.primary }}>Have a flipping amazing time :)</Text>
            </View>
        </View>
        </Modal>
    );

}

export default InstructionsModal;