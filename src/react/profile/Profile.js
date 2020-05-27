import React from 'react';
import { View, Image, ScrollView } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import { ActionTypes } from '../../redux/';

import { Colors, Fonts } from '../../config';

const TEST_PROFILE_IMAGE = 'https://scontent-dfw5-2.xx.fbcdn.net/v/t1.0-9/92129151_1175951836087183_6356546886500876288_n.jpg?_nc_cat=100&_nc_sid=07e735&_nc_ohc=swJ8yNDW6dMAX_y_hUj&_nc_ht=scontent-dfw5-2.xx&oh=9e264f0c1a1fa80e6a00a37eeb4d2fa4&oe=5EB26EF3';
const IMG_DIM = 128;

const TEST_INTERESTS = ["Dance", "Movies", "Bollywood", "TikTok", "Science", "Programming", "Comedy"];

class Profile extends React.Component {
    render() {
        return (
            <View style={{ backgroundColor: Colors.background, flex: 1, paddingTop: 64.0, }}>
                <View style={{ padding: 16.0, flex: 1 }}>
                    <Text style={{ fontFamily: Fonts.heading, fontSize: 32.0 }}>Your Profile</Text>
                    <ScrollView style={{flex: 1, marginTop: 16.0}} contentContainerStyle={{alignItems: 'center'}}>
                        <Image source={{uri: TEST_PROFILE_IMAGE}} style={{width: IMG_DIM, height: IMG_DIM, borderRadius: IMG_DIM/2, alignSelf: 'center'}} />
                        <Text style={{fontFamily: Fonts.heading, fontSize: 28.0, marginTop: 16.0,}}>Anjali Patel</Text>
                        <Text style={{fontSize: 18, color: Colors.textLightGray}}>24</Text>
                        <Text style={{fontSize: 18, color: Colors.textLightGray}}>Engineer</Text>
                        <Text style={{fontSize: 18, color: Colors.textLightGray}}>15 mi</Text>
                        <Text style={{alignSelf: 'flex-start', fontFamily: Fonts.heading}}>Interests</Text>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            {TEST_INTERESTS.map(interest => (
                                <View style={{backgroundColor: Colors.primary, paddingHorizontal: 8.0, borderRadius: 16.0, margin: 2.0}}>
                                    <Text style={{color: Colors.background}}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={{alignSelf: 'flex-start', fontFamily: Fonts.heading, marginTop: 16.0}}>Pictures</Text>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);