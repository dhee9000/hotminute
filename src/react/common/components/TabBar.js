import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import RNAnimated from 'react-native-reanimated';
import { Fonts, Colors } from '../../../config';

const TabBar = props => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
            {props.navigationState.routes.map((route, i) => {
                const color = RNAnimated.color(
                    RNAnimated.round(
                        RNAnimated.interpolate(props.position, {
                            inputRange,
                            outputRange: inputRange.map(inputIndex =>
                                inputIndex === i ? 33 : 230
                            ),
                        })
                    ),
                    RNAnimated.round(
                        RNAnimated.interpolate(props.position, {
                            inputRange,
                            outputRange: inputRange.map(inputIndex =>
                                inputIndex === i ? 33 : 52
                            ),
                        })
                    ),
                    RNAnimated.round(
                        RNAnimated.interpolate(props.position, {
                            inputRange,
                            outputRange: inputRange.map(inputIndex =>
                                inputIndex === i ? 33 : 98
                            ),
                        })
                    )
                );

                const backgroundColor = RNAnimated.color(
                    RNAnimated.round(
                        RNAnimated.interpolate(props.position, {
                            inputRange,
                            outputRange: inputRange.map(inputIndex =>
                                inputIndex === i ? 230 : 33
                            ),
                        })
                    ),
                    RNAnimated.round(
                        RNAnimated.interpolate(props.position, {
                            inputRange,
                            outputRange: inputRange.map(inputIndex =>
                                inputIndex === i ? 52 : 33
                            ),
                        })
                    ),
                    RNAnimated.round(
                        RNAnimated.interpolate(props.position, {
                            inputRange,
                            outputRange: inputRange.map(inputIndex =>
                                inputIndex === i ? 98 : 33
                            ),
                        })
                    )
                );

                return (
                    <TouchableOpacity
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                        key={route.key}
                        onPress={() => props.onChangeTab(i)}>
                        <RNAnimated.View style={{ backgroundColor, paddingVertical: 4.0, paddingHorizontal: 8.0, borderRadius: 24.0 }}>
                            <RNAnimated.Text style={{ color, fontSize: 16.0, fontFamily: Fonts.heading }}>{route.title}</RNAnimated.Text>
                        </RNAnimated.View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default TabBar;