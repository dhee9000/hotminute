import { all, apply, call, put, takeEvery, fork, select, take, takeLeading } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import * as ActionTypes from '../../ActionTypes';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

function* watchListenChatsRequested() {
    yield takeLeading(ActionTypes.LISTEN_CHATS.REQUEST,
        function* onListenChatsRequested(action) {

            const chatsChannel = eventChannel(
                emit => {
                    return firestore().collection('chats').where('uids', 'array-contains', auth().currentUser.uid).onSnapshot(emit)
                }
            );

            console.log("REQUEST: Listening for Chats")
            try {
                while (true) {
                    const chatsSnapshot = yield take(chatsChannel);
                    let chatsDocsData = chatsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                    for (const chat of chatsDocsData) {
                        let otherUid = chat.uids.filter(uid => uid != auth().currentUser.uid)[0];
                        yield put({ type: ActionTypes.FETCH_PROFILE.REQUEST, payload: otherUid });
                    }

                    yield put({ type: ActionTypes.FETCH_CHATS.SUCCESS, payload: chatsDocsData });
                }
            }
            catch (e) {
                console.log("Chats Sync Error:", e);
                yield put({ type: ActionTypes.LISTEN_CHATS.FAILURE });
            }

        }
    );
}

const chatsWatchers = [
    watchListenChatsRequested,
];

export default function* watchChatsActions() {
    console.log('Chats Actions Watcher Running');
    yield all(
        chatsWatchers.map(watcher => fork(watcher))
    );
}