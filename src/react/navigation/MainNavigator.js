import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import React from 'react';
import { View, Text } from 'react-native';

import { Matching } from '../matching';
import { Profile } from '../profile';
import { Chat } from '../chat';

const MainNavigator = createMaterialTopTabNavigator(
    {
        Profile,
        Matching,
        Chat,
    },
    {
        initialRouteName: 'Matching',
        tabBarPosition: 'bottom',
        tabBarComponent: props => {
            return(
                <View></View>
            )
        }
    }
)

export default MainNavigator;