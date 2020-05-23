import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpcaity, Dimensions} from 'react-native';
import * as theme from '../theme';

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
       fontSize: width/14,
       color: '#252525'
   },
   subtitle: {
       fontFamily: 'maven-pro-bold',
       fontSize: width/22,
       color: '#bf200b',
       marginTop: 10
   },
   back: {
    width: theme.sizes.base * 3,
    height: theme.sizes.base * 3,
    justifyContent: 'center',
    alignItems: 'flex-start',
   },
   cover:{
    width: '100%',
    height: height / 3.2
   },
   matchesImage: {
    width: '100%',
    height: height / 2.7,
    resizeMode: 'contain',
    position: 'absolute',
    top: height/ 14
   },
   details: {
    margin: 50,
    position: 'absolute',
    top: height / 2.5
  },
  bio:{
    fontFamily: 'maven-pro-regular',
    fontSize: width / 22,
    color: '#4c4c4c',
    marginTop: 20 
  },

});


export class ProfileScreen extends React.Component{
constrcutor(props){
    super(props);
    this.state = {item: {}}
}
componentDidMount(){
    this.setState({
        item: this.props.navigation.getParams('item')
    });
}

   render(){
       return(
           <View style={styles.container}>
               <TouchableOpacity style={styles.back} onPress={() => this.props.navigation.goBack()}>
               <FontAwesome name="chevron-left" color={theme.colors.black} size={theme.sizes.font * 1} style={{paddingRight: 20}} />
          </TouchableOpacity>
          <View>
          <Image style={styles.cover} source={{uri: this.state.coverImage}} />
          </View>
          <Image style={styles.matchesImage} source={{uri: this.state.item.image}} />
          <View style={styles.details}>
              <Text style={styles.title}>{this.state.item.fname}</Text>
              <Text style={styles.title}>{this.state.item.lname}></Text>
              <Text style={styles.subtitle}>{this.state.item.occupation}</Text>
              <Text style={styles.bio}>{this.state.item.bio}</Text>
              </View>
              
              </View>
       );
   }
}