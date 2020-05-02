import { all, apply, call, put, takeEvery, fork, select } from 'redux-saga/effects';

import { Firebase } from '../../../config';

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import { default as firebaseAuth } from '@react-native-firebase/auth';

// try {
//     firebase.initializeApp(Firebase);
// }
// catch (e) {
//     console.log("Firebase Init Error: ", e);
// }

const db = firestore();
const auth = firebaseAuth();

import * as ActionTypes from '../../ActionTypes';
import * as States from '../../States';

// function* watchSendCodeRequested() {
//     yield takeEvery(ActionTypes.SEND_CODE.REQUEST,
//         function* onSendCodeRequested(action) {

//             let phno = action.payload;

//             try {
//                 if(auth.currentUser){
//                     console.log("Signing Out Existing User!");
//                     yield call([auth, auth.signOut]);
//                 }
//                 const confirmationResult = yield call([auth, auth.signInWithPhoneNumber], phno);
//                 console.log(confirmationResult);
//                 yield put({ type: ActionTypes.SEND_CODE.SUCCESS, payload: confirmationResult });
//             }
//             catch (e) {
//                 console.log(e);
//                 yield put({ type: ActionTypes.SEND_CODE.FAILURE, paylod: e });
//             }

//         }
//     );
// }

// function* watchVerifyCodeRequested() {
//     yield takeEvery(ActionTypes.VERIFY_CODE.REQUEST,
//         function* onVerifyCodeRequested(action) {

//             let code = action.payload;

//             const confirmationResult = yield select(state => state.auth.confirmation);
//             console.log(confirmationResult);

//             try{
//                 const cred = firebase.auth.PhoneAuthProvider.credential(confirmationResult.verificationId, code);
//                 let result = yield call([auth, auth.signInWithCredential], cred);
//                 yield put({ type: ActionTypes.VERIFY_CODE.SUCCESS, })
//             }
//             catch(e) {
//                 console.error("Verify Code Error", e);
//                 yield put({ type: ActionTypes.VERIFY_CODE.FAILURE, error: e });
//             }

//         }
//     )
// }

const authWatchers = [
    // watchSendCodeRequested,
    // watchVerifyCodeRequested
];

export default function* watchAuthActions() {
    console.log('Auth Actions Watcher Running');
    yield all(
        authWatchers.map(watcher => fork(watcher))
    );
}