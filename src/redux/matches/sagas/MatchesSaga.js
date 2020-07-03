import { all, apply, call, put, takeEvery, fork, select, take, takeLeading } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import * as ActionTypes from '../../ActionTypes';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

function* watchListenMatchesRequested() {
    yield takeLeading(ActionTypes.LISTEN_MATCHES.REQUEST,
        function* onListenMatchesRequested(action) {

            const matchesChannel = eventChannel(
                emit => {
                    return firestore().collection('matches').where('uids', 'array-contains', auth().currentUser.uid).onSnapshot(emit)
                }
            );

            console.log("REQUEST: Listening for Matches")
            try {
                while (true) {
                    const matchesSnapshot = yield take(matchesChannel);
                    let matchesDocsData = matchesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                    for (const match of matchesDocsData) {
                        let otherUid = match.uids.filter(uid => uid != auth().currentUser.uid)[0];
                        yield put({ type: ActionTypes.FETCH_PROFILE.REQUEST, payload: otherUid });
                    }

                    yield put({ type: ActionTypes.FETCH_MATCHES.SUCCESS, payload: matchesDocsData });
                }
            }
            catch (e) {
                console.log("Matches Sync Error:", e);
                yield put({ type: ActionTypes.LISTEN_MATCHES.FAILURE });
            }

        }
    );
}

const matchesWatchers = [
    watchListenMatchesRequested,
];

export default function* watchMatchesActions() {
    console.log('Matches Actions Watcher Running');
    yield all(
        matchesWatchers.map(watcher => fork(watcher))
    );
}