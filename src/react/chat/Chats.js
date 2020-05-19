import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Colors, Fonts } from '../../config';

import Matches from './components/Matches';
import ChatApp from './components/ChatApp';
class Chats extends React.Component{
    render(){
        return(
            <View style={{ backgroundColor: Colors.background, flex: 1, paddingTop: 64.0, }}>
                <View style={{padding: 16.0,}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 32.0}}>Chats</Text>
                </View>
                <View>
                     <Matches /> 
                    <ChatList />
                    <Text>Test</Text>
                       
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Chats);