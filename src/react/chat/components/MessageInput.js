import React from 'react';
import {Dimensions, StyleSheet, Text, TextInput, View} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 1,
        shadowOpacity: 0.3
    },
    textInputContainer: {
        flexDirection: 'row',
        width: width,
        borderRadius: 5,
        margin: 5,
    },
    textInput: {
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        height: 36,
        flexDirection: 'row',
        borderRadius: 10,
    },
    emoticonIcon: {
        alignSelf: 'flex-start',
        margin: 6
    },
    cameraIcon: {
        alignSelf: 'flex-end',
        marginRight: 6,
        marginBottom: 3
    },
    micContainer: {
        width: 36,
        height: 36,
        backgroundColor: '#ffc1cc',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginRight: 14,
        marginLeft: 7
    }
});

export const MessageInput = () => (
    <View style={styles.textInputContainer}>
        <View style={[styles.shadow, styles.textInput]}>
            <Icon name="emoticon" size={24} color="#999" style={styles.emoticonIcon} />
            <Input style={{flex:1}} 
               placeholder="Enter a message"
               type='text'
               value={this.props.chat}
               autoFocus={true}
               onChange={(e)=> this.props.onTextInput(e.target.value)}
               onKeyDown={(e)=> {
                   if(e.keyCode === 13) {
                       this.props.onSend()
                       this.props.onResetText()
                   }
               }}/>
            <Icon name="camera" size={24} color="#bbb" style={styles.cameraIcon} />
            </View>
            <View style={styles.micContainer}>
                <Icon name="microphone" size={18} color="#fff" />
                </View>
                </View>
);
