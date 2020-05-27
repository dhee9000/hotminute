import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import React from 'react';
import { View, Text, Dimensions, StatusBar } from 'react-native';
import { Button, Icon } from 'react-native-elements';

import { Matching } from '../matching';
import { Profile } from '../profile';
import { Chats } from '../chat';
import { Colors, Fonts } from '../../config';

const { width, height } = Dimensions.get('screen');

import Heart from '../../../assets/svg/heart.svg';

const MainNavigator = createMaterialTopTabNavigator(
    {
        Chats,
        Matching,
        Profile,
    },
    {
        initialRouteName: 'Matching',
        tabBarPosition: 'top',
        tabBarComponent: props => {
            return(
                <View style={{ 
                    position: 'absolute', top: StatusBar.currentHeight, width, zIndex: 10,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
                    paddingHorizontal: 16.0, marginVertical: 16.0,
                }}>
                    <Icon name={'chat'} color={Colors.text} size={36} />
                    <Heart width={36} height={36} />
                    <Icon name={'person'} color={Colors.text} size={36} />
                </View>
            )
        }
    }
)

export default MainNavigator;