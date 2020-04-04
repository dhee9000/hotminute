import React from 'react';
import { View } from 'react-native';

import { Text } from '../common/components';
import { Fonts, Colors } from '../../config';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';

import { Input, Button, Icon } from 'react-native-elements';

class GetPermissions extends React.Component{
    render(){
        return(
            <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-evenly', padding: 16.0}}>
                <View style={{flex: 1, paddingTop: 16.0, width: '100%'}}>
                    <Text style={{fontFamily: Fonts.heading, fontSize: 24.0, color: Colors.heading}}>Gimme Permissions</Text>
                    <Text style={{color: Colors.text}}>We need your location. And your photos. And your mic. Also let us in your notifications?</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', width: '100%'}}>
                    <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 16.0}}>
                        <Icon name='mic' color={Colors.heading}  size={72}/>
                        <Text style={{color: Colors.heading, fontFamily: Fonts.heading, fontSize: 20.0, marginTop:4.0}}>Microphone</Text>
                    </View>
                    <Text style={{color: Colors.text, marginBottom: 16.0}}>Kinda need a mic to talk to your blind dates don't you?</Text>
                    {/* <Button title="Allow Mic" type="solid"/> */}
                    {/* <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 4.0, width: '100%', borderRadius: 16.0, backgroundColor: Colors.primary}}>
                        <Text style={{color: Colors.text}}>Allow Mic</Text>
                    </View> */}
                    {/* <Text style={{color: Colors.heading, fontFamily: Fonts.heading, marginTop: 16.0}}>Camera Roll</Text>
                    <Text style={{color: Colors.text}}>We need this to help you build that perfect profile.</Text>
                    <Button title="Allow Camera Roll" type="outline" raised/>
                    <Text style={{color: Colors.heading, fontFamily: Fonts.heading, marginTop: 16.0}}>Location</Text>
                    <Text style={{color: Colors.text}}>We'll need this to find you dates that aren't 963,194,103 miles away.</Text>
                    <Button title="Allow Location" type="outline" raised/> */}
                </View>
                <View style={{flex: 1,justifyContent: 'flex-end', paddingBottom: 32.0, width: '100%'}}>
                    {/* <Text style={{color: Colors.textLightGray, fontSize: 10, marginLeft: 8.0, marginTop: 16.0}}>
                        Your data is subject to our Privacy Policy and Terms of Service.
                    </Text> */}
                    <Button title="Allow Mic" onPress={() => {this.props.navigation.navigate('CreateProfileBio')}} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(GetPermissions);