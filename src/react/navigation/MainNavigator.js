import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import React from 'react';
import { View, Text, Dimensions, StatusBar } from 'react-native';
import { Button, Icon } from 'react-native-elements';

import { Minute } from '../minute';
import { Profile } from '../profile';
import { Chats, ChatView } from '../chat';
import { Colors, Fonts } from '../../config';

const { width, height } = Dimensions.get('screen');

import Heart from '../../../assets/svg/heart.svg';
import { createStackNavigator } from 'react-navigation-stack';

const ChatStack = createStackNavigator({
    Chats,
    ChatView,
})

const MainNavigator = createMaterialTopTabNavigator(
    {
        Chats,
        Minute,
        Profile,
    },
    {
        initialRouteName: 'Minute',
        tabBarPosition: 'top',
        // tabBarComponent: props => {
        //     return(
        //         <View style={{ 
        //             position: 'absolute', top: StatusBar.currentHeight, width, zIndex: 10,
        //             flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
        //             paddingHorizontal: 16.0, marginVertical: 16.0,
        //         }}>
        //             <Icon name={'chat'} color={Colors.text} size={36} />
        //             <Heart width={36} height={36} />
        //             <Icon name={'person'} color={Colors.text} size={36} />
        //         </View>
        //     )
        // }
    }
)

export default MainNavigator;