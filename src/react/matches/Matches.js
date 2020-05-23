import React from 'react';
import {View, Text, StyleSheet, Image, FlatList, TouchableOpcaity, Dimensions} from 'react-native';
import {AppContext} from './profile/ProfileApp';
import { sub } from 'react-native-reanimated';


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container:{
         width: width,
         height: height,
         backgroundColor: '#FFB6C1'
    },
    title:{
        fontFamily: 'maven-pro-bold',
        fontSize: width/22,
        color: '#252525'
    },
    subtitle: {
        fontFamily: 'maven-pro-bold',
        fontSize: width/22,
        color: '#bf200b'
    },
    list: {
        margin: width/15
    },
    block: {
        flex: 1,
        height: height/4,
        margin: width/40
    },
    matchesImage: {
        width: '100%',
        height: height/7,
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
    },
    name: {
        fontFamily: 'maven-pro-bold',
        fontSize: width / 22,
        color: '#252525',
        width: '80%',
        marginTop: 15
      },
      occupation: {
        fontFamily: 'maven-pro-bold',
        fontSize: width / 22,
        color: '#bf200b',
        marginTop: 7
      }

});
export class Matches extends React.Component{
    render(){
        return(
            <AppContext.Consumer>
                {
                    (context) =>
                    <View style = {styles.cotainer}>
                        <View style = {{marginLeft: 30, marginTop: 30}}>
                            <Text style={styles.title}>YOUR</Text>
                            <Text style={styles.subtitle}>MATCHES</Text> 
                        </View>
                        <FlatList
                        style={styles.list}
                        data={context}
                        renderItem={({item}) => <TouchableOpcaity style={styles.block} onPress={()=> this.props.navigate('ProfileScreen', {item: item})}>
                            <Image style={styles.matchesImage} source={{uri:item.image}} />
                            <Text style={styles.name}>{item.fname}</Text>
                            <Text style={styles.name}>{item.lname}</Text>
                            <Text style={styles.occupation}>{item.occupation}</Text>
                            </TouchableOpcaity>}
                            numColumns={2}
                            />
                            </View>
                                
                }
                </AppContext.Consumer>
        );
    }
}

