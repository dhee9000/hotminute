import React from 'react';
import { StyleSheet } from 'react-native';

import { Image } from 'react-native';

const styles = StyleSheet.create({
    image: {
      margin: 5,
      marginLeft: 10,
      marginRight: 10,
      width: 60,
      height: 60,
      borderRadius: 30
    },
  });

export const Images = ({imageId, contentStyles=styles}) => {
  switch (imageId) {
      case 0:
        return <Image source={{uri: 'https://www.google.com/search?q=margot+robbie&sxsrf=ALeKk03i8nM4f6yvcXqY_9fS6E1lObtMKw:1589269558903&source=lnms&tbm=isch&sa=X&ved=2ahUKEwi0r4q86q3pAhVERK0KHS-8D0AQ_AUoAXoECCIQAw#imgrc=LFMMz8pKiuxhOM'}} style={contentStyles.image} resizeMode='contain' />;
      case 1:
        return <Image source={{uri: 'https://www.google.com/search?q=margot+robbie&sxsrf=ALeKk03i8nM4f6yvcXqY_9fS6E1lObtMKw:1589269558903&source=lnms&tbm=isch&sa=X&ved=2ahUKEwi0r4q86q3pAhVERK0KHS-8D0AQ_AUoAXoECCIQAw#imgrc=LFMMz8pKiuxhOM'}} style={contentStyles.image} resizeMode='contain' />;
      case 2:
        return <Image source={{uri: 'https://www.google.com/search?q=margot+robbie&sxsrf=ALeKk03i8nM4f6yvcXqY_9fS6E1lObtMKw:1589269558903&source=lnms&tbm=isch&sa=X&ved=2ahUKEwi0r4q86q3pAhVERK0KHS-8D0AQ_AUoAXoECCIQAw#imgrc=LFMMz8pKiuxhOM'}} style={contentStyles.image} resizeMode='contain' />;
      case 3:
        return <Image source={{uri: 'https://www.google.com/search?q=margot+robbie&sxsrf=ALeKk03i8nM4f6yvcXqY_9fS6E1lObtMKw:1589269558903&source=lnms&tbm=isch&sa=X&ved=2ahUKEwi0r4q86q3pAhVERK0KHS-8D0AQ_AUoAXoECCIQAw#imgrc=LFMMz8pKiuxhOM'}} style={contentStyles.image} resizeMode='contain' />;
      case 4:
        return <Image source={{uri: 'https://www.google.com/search?q=margot+robbie&sxsrf=ALeKk03i8nM4f6yvcXqY_9fS6E1lObtMKw:1589269558903&source=lnms&tbm=isch&sa=X&ved=2ahUKEwi0r4q86q3pAhVERK0KHS-8D0AQ_AUoAXoECCIQAw#imgrc=LFMMz8pKiuxhOM'}} style={contentStyles.image} resizeMode='contain' />;
  }
  }


