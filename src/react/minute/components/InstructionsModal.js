import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Modal, Dimensions } from 'react-native';

import { Text } from '../../common/components';
import { Colors, Fonts } from '../../../config';

import { Icon } from 'react-native-elements';

import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get('screen');

const InstructionsModal = (props) => {

    return (
        <Modal visible={props.showModal} transparent animated animationType={'slide'}>
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, }}>
                <View style={{ backgroundColor: Colors.background, justifyContent: 'flex-start', alignItems: 'center', borderRadius: 16.0, elevation: 4.0, marginHorizontal: 8.0, padding: 32.0 }}>
                    <Text style={{ fontFamily: Fonts.heading, color: Colors.primary, fontSize: 24.0 }}>Starting Call</Text>
                    <Text style={{ color: Colors.text }}>Swipe Left if you are not interested</Text>
                    <Text style={{ color: Colors.text }}>Swipe Right if you are interested</Text>
                    <Text style={{ color: Colors.text }}>Swipe Down to extend your time</Text>
                    <Text style={{ color: Colors.text }}>Have a flipping amazing time :)</Text>
                    <TouchableOpacity onPress={() => props.onClose()} style={{ alignSelf: 'stretch', marginVertical: 32.0 }}>
                        <LinearGradient style={{ margin: 2.0, paddingVertical: 8.0, borderRadius: 28.0, height: 48, justifyContent: 'center', alignItems: 'center', width: '100%' }} colors={[Colors.primaryDark, Colors.primary]}>
                            <Text style={{ fontFamily: Fonts.heading, color: Colors.background }}>Got It</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

}

export default InstructionsModal;