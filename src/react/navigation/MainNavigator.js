import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import React from 'react';
import { View, Text, Dimensions, StatusBar } from 'react-native';
import { Button, Icon } from 'react-native-elements';

import { Minute } from '../minute';
import { Profile } from '../profile';
import { ProfileView } from '../profileview';
import { Chats, ChatView } from '../chat';
import { Colors, Fonts } from '../../config';

const { width, height } = Dimensions.get('screen');

import Heart from '../../../assets/svg/heart.svg';
import { createStackNavigator } from 'react-navigation-stack';

const renderTabBarIcon = ({focused, color, size}, name) => {
    switch(name){
        case 'matches': {
            return (
                <Icon name={'people'} color={color} size={size} />
            )
        }
        case 'date': {
            return (
                <Icon name={'alarm'} color={color} size={size} />
            )
        }
        case 'profile': {
            return (
                <Icon name={'person'} color={color} size={size} />
            )
        }
    }
}

const MainNavigator = createMaterialTopTabNavigator(
    {
        Matches:{
            screen: Chats,
            navigationOptions: {
                tabBarIcon: ({focused, tintColor, size}) => (<Icon name={'message'} color={tintColor} size={size} />),
            }
        },
        Date: {
            screen: Minute,
            navigationOptions: {
                tabBarIcon: ({focused, tintColor, size}) => (<Icon name={'favorite'} color={tintColor} size={size} />),
            }
        },
        Profile: {
            screen: Profile,
            navigationOptions: {
                tabBarIcon: ({focused, tintColor, size}) => (<Icon name={'person'} color={tintColor} size={size} />),
            }
        }
    },
    {
        initialRouteName: 'Date',
        tabBarPosition: 'bottom',
        tabBarOptions: {
            activeTintColor: '#fff',
            inactiveTintColor: Colors.primaryLight,
            contentContainerStyle: { backgroundColor: Colors.primary, padding: 0},
            showIcon: true,
            showLabel: false,
        },
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

const MainStack = createStackNavigator(
    {
        MainNavigator,
        ChatView,
        ProfileView,
    },
    {
        headerMode: 'none'
    }
)

export default MainStack;