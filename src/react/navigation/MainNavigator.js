import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import React from 'react';
import { View, Text, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';

import { Minute } from '../minute';
import { Profile, EditProfile } from '../profile';
import { ProfileView, ViewImage } from '../profileview';
import { Chats, ChatView } from '../chat';
import { Colors, Fonts } from '../../config';

const { width, height } = Dimensions.get('screen');

import Heart from '../../../assets/svg/heart.svg';
import { createStackNavigator } from 'react-navigation-stack';

const renderTabBarIcon = ({ focused, color, size }, name) => {
    switch (name) {
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
        Profile: {
            screen: Profile,
            navigationOptions: {
                tabBarIcon: ({ focused, tintColor, size }) => (<Icon name={'person'} color={tintColor} size={size} />),
            }
        },
        Date: {
            screen: Minute,
            navigationOptions: {
                tabBarIcon: ({ focused, tintColor, size }) => (<Icon name={'favorite'} color={tintColor} size={size} />),
            }
        },
        Matches: {
            screen: Chats,
            navigationOptions: {
                tabBarIcon: ({ focused, tintColor, size }) => (<Icon name={'message'} color={tintColor} size={size} />),
            }
        },
    },
    {
        initialRouteName: 'Date',
        tabBarPosition: 'bottom',
        tabBarOptions: {
            activeTintColor: '#fff',
            inactiveTintColor: Colors.primaryLight,
            contentContainerStyle: { backgroundColor: '#ffffff00', padding: 0 },
            showIcon: true,
            showLabel: false,
        },
        tabBarComponent: props => {
            let { navigation, onTabPress } = props;
            let { routes, index } = navigation.state;
            return (
                <View style={{
                    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
                    paddingHorizontal: 8.0, paddingVertical: 8.0,
                    backgroundColor: Colors.background
                }}>
                    <TouchableOpacity onPress={() => onTabPress({route: routes[0]})}>
                        <Icon name={'person'} color={index == 0 ? Colors.primary : Colors.text} size={28} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onTabPress({route: routes[1]})}>
                        <Icon name={'favorite'} color={index == 1 ? Colors.primary : Colors.text} size={28} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onTabPress({route: routes[2]})}>
                        <Icon name={'chat'} color={index == 2 ? Colors.primary : Colors.text} size={28} />
                    </TouchableOpacity>
                </View>
            )
        }
    }
)

const MainStack = createStackNavigator(
    {
        MainNavigator,
        ChatView,
        EditProfile,
        ProfileView,
        ViewImage,
    },
    {
        headerMode: 'none'
    }
)

export default MainStack;