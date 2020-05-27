import React from 'react';
import { View, FlatList, Image, TouchableOpacity } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Colors, Fonts } from '../../config';

import { GiftedChat } from 'react-native-gifted-chat';

const TEST_PROFILE_IMAGE = 'https://scontent-dfw5-2.xx.fbcdn.net/v/t1.0-9/92129151_1175951836087183_6356546886500876288_n.jpg?_nc_cat=100&_nc_sid=07e735&_nc_ohc=swJ8yNDW6dMAX_y_hUj&_nc_ht=scontent-dfw5-2.xx&oh=9e264f0c1a1fa80e6a00a37eeb4d2fa4&oe=5EB26EF3';

class Chats extends React.Component {
    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1, paddingTop: 64.0, }}>
                <View style={{ padding: 16.0, }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 32.0 }}>Chats</Text>
                </View>
                <View>
                    <FlatList
                        horizontal
                    />
                </View>
                <View>
                    <FlatList
                        ListEmptyComponent={<Text style={{ color: Colors.textLightGray, alignSelf: 'center', textAlign: 'center', marginHorizontal: 16.0 }}>No chats found. Start matching to find people to chat with!</Text>}
                        data={[
                            { id: 'adsfasdg', fname: 'Anjali', lname: 'Patel', displayImageURL: TEST_PROFILE_IMAGE, mostRecentMessage: 'You could end my quarantine ;)' },
                            { id: 'adsfasdgasgasdg', fname: 'Anjali', lname: 'Patel', displayImageURL: TEST_PROFILE_IMAGE, mostRecentMessage: 'You could end my quarantine ;)' },
                            { id: 'adsasdgasdgfasdg', fname: 'Anjali', lname: 'Patel', displayImageURL: TEST_PROFILE_IMAGE, mostRecentMessage: 'You could end my quarantine ;)' },
                            { id: 'argaawrg', fname: 'Anjali', lname: 'Patel', displayImageURL: TEST_PROFILE_IMAGE, mostRecentMessage: 'You could end my quarantine ;)' },
                            { id: 'awrgwg', fname: 'Anjali', lname: 'Patel', displayImageURL: TEST_PROFILE_IMAGE, mostRecentMessage: 'You could end my quarantine ;)' },
                        ]}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => {
                            return (
                                <TouchableOpacity>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8.0, elevation: 2.0 }}>
                                        <Image source={{ uri: item.displayImageURL }} style={{ height: 48, width: 48, borderRadius: 24, marginRight: 8.0 }} />
                                        <View style={{flex: 1}}>
                                            <Text style={{ fontFamily: Fonts.heading, fontSize: 18.0 }}>{item.fname} {item.lname}</Text>
                                            <Text style={{ fontSize: 14.0, color: Colors.textLightGray }} numberOfLines={1}>{item.mostRecentMessage}</Text>
                                        </View>
                                        <Text style={{color: Colors.textLightGray}}>1d</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                    />
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