import React from 'react';
import { View, Dimensions } from 'react-native';

import { Text } from '../../common/components';
import { Fonts, Colors } from '../../../config';

import Svg, {
    Defs, Circle, Ellipse, G, Polygon, Polyline, Line, Rect, LinearGradient, RadialGradient, Stop, ClipPath, Pattern, Mask,
} from 'react-native-svg';

import Animated, { Easing } from 'react-native-reanimated';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

import Controls from './Controls';

const {width, height} = Dimensions.get('screen');

const CIRCLE_SIZE = 40;

class Minute extends React.Component{

    render(){
        return(
            <View style={{width, height, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Svg height="100%" width="100%" viewBox="0 0 100 100">
                    <Defs>
                        <RadialGradient id="gradient">
                            <Stop offset={'60%'} stopColor={'#ff85a6'} stopOpacity={0} />
                            <Stop offset={'90%'} stopColor={'#ff85a6'} stopOpacity={0.25} />
                            <Stop offset={'100%'} stopColor={'#ff85a6'} stopOpacity={0.5} />
                        </RadialGradient>
                        <RadialGradient id="gradient2">
                            <Stop offset={'60%'} stopColor={Colors.primary} stopOpacity={0} />
                            <Stop offset={'90%'} stopColor={Colors.primary} stopOpacity={0.25} />
                            <Stop offset={'100%'} stopColor={Colors.primaryDark} stopOpacity={0.5} />
                        </RadialGradient>
                    </Defs>
                    <Circle
                        cx="50"
                        cy="50"
                        r={CIRCLE_SIZE}
                        stroke={Colors.primaryDark}
                        strokeWidth="1"
                        fill="url(#gradient2)" 
                    />
                    <AnimatedCircle
                        cx="50"
                        cy="50"
                        r={CIRCLE_SIZE-10}
                        stroke={Colors.primary}
                        strokeWidth="0"
                        fill="url(#gradient)"
                        
                    />
                </Svg>
                <View style={{position: 'absolute', justifyContent: 'center', alignItems: 'center'}}>
                    {/* <Text style={{alignSelf: 'center', fontSize: 32.0, fontFamily: Fonts.heading}}>1:00</Text> */}
                    <Controls />
                </View>
            </View>
        )
    }
}

export default Minute;