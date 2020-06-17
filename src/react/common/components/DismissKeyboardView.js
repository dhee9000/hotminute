import React from 'react';
import { Keyboard, View, TouchableWithoutFeedback } from 'react-native';

import { Fonts } from '../../../config';
import { Colors } from '../../../config';

export default DismissKeyboardView = props => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} {...props} />
);