import React from 'react';
import { Text as RNText } from 'react-native';

import { Fonts } from '../../../config';
import { Colors } from '../../../config';

export default Text = props => (<RNText {...props} style={[{fontFamily: Fonts.primary, fontSize: 16.0, color: Colors.text}, props.style]} />);