import firebase from 'firebase'
import '@firebase/firestore'
import firebaseConfig from '../config/Firebase';
import ReduxSagaFirebase from 'redux-saga-firebase'

const firebaseApp = firebase.initializeApp(firebaseConfig)

export const rsf = new ReduxSagaFirebase(firebaseApp)