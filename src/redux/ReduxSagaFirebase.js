import firebase from '@react-native-firebase/app';
import firebaseConfig from '../config/Firebase';
import ReduxSagaFirebase from 'redux-saga-firebase'

const firebaseApp = firebase.app();

export const rsf = new ReduxSagaFirebase(firebaseApp);