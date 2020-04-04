import { all, apply, call, put, takeEvery, fork, } from 'redux-saga/effects';
import { rsf } from '../../ReduxSagaFirebase';

import * as ActionTypes from '../../ActionTypes';
import * as States from '../../States';

function* onCreateAccountRequested(action){
    let phno = action.payload;
    try{
        const confirmationResult = yield call([rsf, rsf.auth.signInWithPhoneNumber], phno);
        yield put({type: ActionTypes.CREATE_ACCOUNT.SUCCESS});
        yield put({type: ActionTypes.VERIFICATION_CODE_SENT, payload: confirmationResult});
    }
    catch(e){
        yield put({type: ActionTypes.CREATE_ACCOUNT.FAILURE});
    }
}

function* onVerifyCodeRequested(action){
    let code = action.payload;
    try{
        yield call([rsf, rsf.auth.signInWithPhone])
    }
    catch (e){
        console.log(e);
    }
}

function* watchCreateAccountRequested(){
	console.log('Signup Watcher Running');
	yield takeEvery(ActionTypes.CREATE_ACCOUNT.REQUESTED, onCreateAccountRequested);
}

const authWatchers = [
	watchCreateAccountRequested,
];

export default function* watchAuthActions(){
	console.log('Auth Actions Watcher Running');
	yield all(
		authWatchers.map(watcher => fork(watcher))
	);
}